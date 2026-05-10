import {
  PublicKey,
  SystemInstruction,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  VersionedTransaction,
} from "@solana/web3.js";
import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { createAlert } from "./alertEngine.js";
import { analyzeMint } from "./tokenAnalysis.js";
import { toPublicKey } from "./utils.js";

const SUSPICIOUS_PROGRAMS = new Map([
  ["11111111111111111111111111111111", "System Program"],
  [TOKEN_PROGRAM_ID.toBase58(), "SPL Token Program"],
  [TOKEN_2022_PROGRAM_ID.toBase58(), "Token-2022 Program"],
]);

function instructionFromCompiled(message, compiled) {
  const keys = message.staticAccountKeys || message.accountKeys || [];
  const programId = keys[compiled.programIdIndex];
  const accounts = (compiled.accountKeyIndexes || compiled.accounts || []).map((index) => ({
    pubkey: keys[index],
    isSigner: message.isAccountSigner ? message.isAccountSigner(index) : false,
    isWritable: message.isAccountWritable ? message.isAccountWritable(index) : false,
  }));
  return new TransactionInstruction({ programId, keys: accounts, data: Buffer.from(compiled.data) });
}

function decodeTransaction(transactionBase64) {
  const raw = Buffer.from(transactionBase64, "base64");
  try {
    const legacy = Transaction.from(raw);
    return {
      mode: "live",
      instructions: legacy.instructions,
      signers: legacy.signatures.map((sig) => sig.publicKey.toBase58()),
    };
  } catch {
    const versioned = VersionedTransaction.deserialize(raw);
    return {
      mode: "live",
      instructions: versioned.message.compiledInstructions.map((instruction) => instructionFromCompiled(versioned.message, instruction)),
      signers: versioned.message.staticAccountKeys
        .slice(0, versioned.message.header.numRequiredSignatures)
        .map((key) => key.toBase58()),
    };
  }
}

function parseTokenInstruction(ix) {
  if (!ix.programId.equals(TOKEN_PROGRAM_ID) && !ix.programId.equals(TOKEN_2022_PROGRAM_ID)) return null;
  const type = ix.data[0];
  if (type === 3 || type === 12) {
    return {
      kind: "transfer",
      source: ix.keys[0]?.pubkey?.toBase58(),
      destination: ix.keys[1]?.pubkey?.toBase58(),
      authority: ix.keys[2]?.pubkey?.toBase58(),
    };
  }
  if (type === 4) {
    return {
      kind: "approve",
      source: ix.keys[0]?.pubkey?.toBase58(),
      delegate: ix.keys[1]?.pubkey?.toBase58(),
      owner: ix.keys[2]?.pubkey?.toBase58(),
    };
  }
  return { kind: "token-program", opcode: type };
}

export async function simulateTransaction(body) {
  const { walletAddress, transactionBase64, mintAddress, amount } = body;
  if (walletAddress) toPublicKey(walletAddress, "walletAddress");
  const alerts = [];
  const tokenTransfers = [];
  const solChanges = [];
  const approvals = [];
  const suspiciousPrograms = [];
  const summary = [];
  let mode = "mock";

  if (transactionBase64) {
    const decoded = decodeTransaction(transactionBase64);
    mode = decoded.mode;
    summary.push(`Decoded ${decoded.instructions.length} transaction instruction${decoded.instructions.length === 1 ? "" : "s"} without broadcasting.`);
    for (const ix of decoded.instructions) {
      const programId = ix.programId.toBase58();
      if (ix.programId.equals(SystemProgram.programId)) {
        try {
          const type = SystemInstruction.decodeInstructionType(ix);
          if (type === "Transfer") {
            const transfer = SystemInstruction.decodeTransfer(ix);
            solChanges.push({
              address: transfer.toPubkey.toBase58(),
              changeSol: Number(transfer.lamports) / 1_000_000_000,
              explanation: `System transfer to ${transfer.toPubkey.toBase58()}`,
            });
            solChanges.push({
              address: transfer.fromPubkey.toBase58(),
              changeSol: -Number(transfer.lamports) / 1_000_000_000,
              explanation: `System transfer from ${transfer.fromPubkey.toBase58()}`,
            });
          }
        } catch {
          summary.push("System instruction was detected but could not be fully decoded.");
        }
      }
      const tokenIx = parseTokenInstruction(ix);
      if (tokenIx?.kind === "transfer") {
        tokenTransfers.push({ mintAddress: mintAddress || "unknown", direction: "unknown", amount: "decoded-token-transfer" });
      }
      if (tokenIx?.kind === "approve") {
        approvals.push({
          owner: tokenIx.owner,
          delegate: tokenIx.delegate,
          riskLevel: "HIGH",
          explanation: "Transaction contains a token delegate approval. Verify the delegate before signing.",
        });
        alerts.push(createAlert({
          id: "transaction-approval",
          label: "Token approval requested",
          severity: "HIGH",
          explanation: "This transaction can grant another address permission over a token account.",
          status: "danger",
        }, { walletAddress, source: "transaction-simulation", evidence: tokenIx }));
      }
      if (!SUSPICIOUS_PROGRAMS.has(programId)) {
        suspiciousPrograms.push({
          programId,
          label: "Unknown program interaction",
          explanation: "This transaction touches a program SolGuard does not recognize as a core Solana/token program.",
        });
      }
    }
  }

  if (mintAddress) {
    const asset = await analyzeMint(mintAddress);
    tokenTransfers.push({ mintAddress, direction: "unknown", amount: amount || "unknown" });
    summary.push(`Pre-flight token context: ${asset.symbol} (${asset.name}) is ${asset.riskLevel} risk.`);
    if (asset.riskFlags.some((riskFlag) => riskFlag.id === "freeze-authority-active")) {
      alerts.push(createAlert({
        id: "simulation-freeze-authority",
        label: "Freeze authority before signing",
        severity: "HIGH",
        explanation: "The token you are about to touch has an active freeze authority.",
        status: "danger",
      }, { walletAddress, mintAddress, source: "transaction-simulation", evidence: asset.evidence }));
    }
    if (asset.riskFlags.some((riskFlag) => riskFlag.id === "mint-authority-active")) {
      alerts.push(createAlert({
        id: "simulation-mint-authority",
        label: "Mint authority before signing",
        severity: "HIGH",
        explanation: "The token you are about to touch can still mint more supply.",
        status: "danger",
      }, { walletAddress, mintAddress, source: "transaction-simulation", evidence: asset.evidence }));
    }
  }

  if (!transactionBase64) {
    summary.push("No raw transaction payload was supplied, so SolGuard ran intent-level pre-flight checks only.");
  }
  if (!approvals.length) {
    approvals.push({
      owner: walletAddress,
      delegate: undefined,
      riskLevel: "SAFE",
      explanation: "No token approval instruction was decoded from the supplied payload.",
    });
  }
  const riskLevel = alerts.some((alert) => alert.severity === "CRITICAL")
    ? "CRITICAL"
    : alerts.some((alert) => alert.severity === "HIGH")
      ? "HIGH"
      : suspiciousPrograms.length
        ? "MEDIUM"
        : "SAFE";
  return {
    simulationMode: mode,
    riskLevel,
    summary,
    tokenTransfers,
    solChanges,
    approvals,
    suspiciousPrograms,
    alerts,
    evidence: {
      walletAddress,
      mintAddress,
      transactionProvided: Boolean(transactionBase64),
      simulatedAt: new Date().toISOString(),
    },
  };
}
