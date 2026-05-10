import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID, getMint } from "@solana/spl-token";
import { config, connection, trustedMints } from "./config.js";
import { fetchBirdeyeTokenSecurity, fetchDexScreener, fetchHeliusAsset } from "./externalApis.js";
import { clampScore, flag, percentFromRaw, riskLevelFromScore, toPublicKey, uiAmount, unavailable, verdictFromScore, withTimeout } from "./utils.js";

function metadataFromParsedMint(parsedInfo) {
  const extensions = parsedInfo?.extensions || [];
  const tokenMetadata = extensions.find((item) => item.extension === "tokenMetadata")?.state;
  return {
    name: tokenMetadata?.name,
    symbol: tokenMetadata?.symbol,
    updateAuthority: tokenMetadata?.updateAuthority,
    uri: tokenMetadata?.uri,
  };
}

function suspiciousMetadataLink(uri) {
  if (!uri) return null;
  const lowered = uri.toLowerCase();
  if (lowered.startsWith("http://")) return "Metadata uses insecure HTTP.";
  if (/(bit\.ly|tinyurl|t\.me|telegram|discord|claim|airdrop|bonus|free|reward)/i.test(lowered)) {
    return "Metadata link contains spam, lure, or redirect keywords.";
  }
  return null;
}

function abnormalSupplyFlags(rawSupply, decimals) {
  const flags = [];
  const supply = BigInt(rawSupply || "0");
  if (supply === 0n) {
    flags.push(flag("zero-supply", "Abnormal zero supply", "MEDIUM", "The mint reports zero supply, which is unusual for a tradable token.", "warning"));
  }
  if (decimals >= 12) {
    flags.push(flag("high-decimals", "Unusual decimals", "MEDIUM", `Token uses ${decimals} decimals, which is unusual for normal SPL assets.`, "warning"));
  }
  if (supply > 1_000_000_000_000_000_000_000_000n) {
    flags.push(flag("huge-supply", "Abnormal supply", "MEDIUM", "Token supply is extremely large, a common pattern in spam or memecoin-like tokenomics.", "warning"));
  }
  return flags;
}

function tokenFromDexPair(pair, mintAddress) {
  const mint = mintAddress.toLowerCase();
  if (pair?.baseToken?.address?.toLowerCase?.() === mint) return pair.baseToken;
  if (pair?.quoteToken?.address?.toLowerCase?.() === mint) return pair.quoteToken;
  return null;
}

async function getMintContext(mintAddress) {
  const mintKey = toPublicKey(mintAddress, "mintAddress");
  const account = await withTimeout(
    connection.getParsedAccountInfo(mintKey, "confirmed"),
    12_000,
    "getParsedAccountInfo"
  );
  const value = account.value;
  if (!value) {
    const err = new Error("Mint account not found on Solana mainnet.");
    err.status = 404;
    throw err;
  }

  const ownerProgram = value.owner.toBase58();
  const isToken2022 = ownerProgram === TOKEN_2022_PROGRAM_ID.toBase58();
  const isTokenProgram = ownerProgram === TOKEN_PROGRAM_ID.toBase58();
  if (!isToken2022 && !isTokenProgram) {
    const err = new Error(`Address is not an SPL token mint. Owner program: ${ownerProgram}`);
    err.status = 400;
    throw err;
  }

  const mint = await withTimeout(
    getMint(connection, mintKey, "confirmed", isToken2022 ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID),
    12_000,
    "getMint"
  );
  const parsedInfo = value.data?.parsed?.info || {};
  return {
    mint,
    ownerProgram,
    token2022Metadata: metadataFromParsedMint(parsedInfo),
  };
}

export async function holderConcentration(mintAddress, supplyRaw) {
  try {
    const largest = await withTimeout(
      connection.getTokenLargestAccounts(toPublicKey(mintAddress, "mintAddress")),
      10_000,
      "getTokenLargestAccounts"
    );
    const supply = BigInt(supplyRaw || "0");
    if (supply === 0n) return { topHolderPercent: null, topFivePercent: null, holders: [] };
    const topFiveRaw = largest.value.slice(0, 5).reduce((sum, account) => sum + BigInt(account.amount), 0n);
    return {
      topHolderPercent: percentFromRaw(largest.value[0]?.amount || "0", supplyRaw),
      topFivePercent: percentFromRaw(topFiveRaw.toString(), supplyRaw),
      holders: largest.value.slice(0, 5).map((account, index) => ({
        address: account.address.toBase58(),
        amount: account.amount,
        rank: index + 1,
        percentage: percentFromRaw(account.amount, supplyRaw),
      })),
    };
  } catch {
    return { topHolderPercent: null, topFivePercent: null, holders: [] };
  }
}

export function whaleSummaryFromConcentration(concentration) {
  const top = concentration.topHolderPercent;
  const topFive = concentration.topFivePercent;
  const score = top == null ? 0 : top > 50 ? 90 : top > 35 ? 70 : topFive > 70 ? 65 : top > 20 ? 40 : 10;
  return {
    topHolderPercent: top,
    topFivePercent: topFive,
    riskLevel: riskLevelFromScore(score),
    holders: concentration.holders?.length
      ? concentration.holders
      : [{ address: "unavailable", percentage: null, amount: "0", rank: 1 }],
    source: concentration.holders?.length ? "rpc" : "placeholder",
  };
}

function confidenceScore({ heliusAsset, dexPair, concentration, mintContext }) {
  let confidence = 45;
  if (mintContext) confidence += 25;
  if (heliusAsset || dexPair) confidence += 10;
  if (dexPair?.liquidity?.usd != null) confidence += 10;
  if (concentration.topHolderPercent != null) confidence += 10;
  if (config.birdeyeApiKey) confidence += 5;
  return clampScore(confidence);
}

function aiExplanationForAsset(assetName, flags, unavailableCount) {
  const risks = flags.filter((item) => item.status !== "unknown");
  if (!risks.length) {
    return `${assetName} has no high-confidence deterministic risk findings from the available checks. ${unavailableCount} checks are marked unavailable instead of guessed.`;
  }
  const evidence = risks.slice(0, 3).map((item) => item.explanation.replace(/\.$/, ""));
  return `${assetName} triggered ${risks.length} evidence-backed risk finding${risks.length === 1 ? "" : "s"}: ${evidence.join("; ")}. SolGuard separates unavailable API data from actual security evidence.`;
}

export async function analyzeMint(mintAddress, tokenAccount = null) {
  const mintContext = await getMintContext(mintAddress);
  const mint = mintContext.mint;
  const rawAmount = tokenAccount?.tokenAmount?.amount ?? mint.supply.toString();
  const decimals = tokenAccount?.tokenAmount?.decimals ?? mint.decimals;
  const [heliusAsset, dexPair, birdeye, concentration] = await Promise.all([
    fetchHeliusAsset(mintAddress),
    fetchDexScreener(mintAddress),
    fetchBirdeyeTokenSecurity(mintAddress),
    holderConcentration(mintAddress, mint.supply.toString()),
  ]);

  const heliusMetadata = heliusAsset?.content?.metadata || {};
  const token2022Metadata = mintContext.token2022Metadata;
  const trustedMint = trustedMints.get(mintAddress);
  const dexToken = tokenFromDexPair(dexPair, mintAddress);
  const name = trustedMint?.name || heliusMetadata.name || token2022Metadata.name || dexToken?.name || "Unknown Asset";
  const symbol = trustedMint?.symbol || heliusMetadata.symbol || token2022Metadata.symbol || dexToken?.symbol || "UNKNOWN";
  const metadataStatus = trustedMint || heliusAsset || token2022Metadata.name || dexToken?.name ? "verified" : "unverified";
  const liquidityUSD = dexPair?.liquidity?.usd ?? null;
  const metadataUri = heliusAsset?.content?.json_uri || token2022Metadata.uri || null;
  const metadataLinkWarning = suspiciousMetadataLink(metadataUri);
  const isNftLike = decimals === 0 && BigInt(rawAmount || "0") <= 1n;
  const whaleSummary = whaleSummaryFromConcentration(concentration);
  const flags = [];
  let score = 0;

  if (tokenAccount?.isZeroBalance) {
    score += 8;
    flags.push(flag("zero-balance-asset", "Zero-balance visible asset", "MEDIUM", "This visible token account has a zero balance. It can be inactive or spam, so SolGuard marks it for review without calling it a scam.", "warning"));
  }
  if (metadataStatus !== "verified" && !trustedMint) {
    score += 10;
    flags.push(flag("unverified-metadata", "Unverified metadata", "MEDIUM", "No trusted metadata source confirmed this asset. This is a weaker signal unless combined with other risks.", "warning"));
  }
  if (mint.mintAuthority && !trustedMint) {
    score += 25;
    flags.push(flag("mint-authority-active", "Mint authority active", "HIGH", "Mint authority is still active, meaning the issuer can create more tokens and dilute holders.", "danger", mint.mintAuthority.toBase58()));
  }
  if (mint.freezeAuthority && !trustedMint) {
    score += 25;
    flags.push(flag("freeze-authority-active", "Freeze authority active", "HIGH", "Freeze authority is active, so token accounts may be frozen by the authority.", "danger", mint.freezeAuthority.toBase58()));
  }
  if (tokenAccount?.delegate) {
    score += 20;
    flags.push(flag("delegate-authority", "Delegate authority detected", "HIGH", "This token account has a delegate approval that may move delegated tokens.", "danger", tokenAccount.delegate));
  }
  if (liquidityUSD === null) {
    flags.push(unavailable("liquidity-unknown", "Liquidity data unavailable", "Liquidity could not be verified from public APIs. This is not counted as a security risk."));
  } else if (liquidityUSD < 1_000) {
    score += 30;
    flags.push(flag("critical-liquidity", "Critical liquidity", "CRITICAL", "Liquidity is below $1k, so exiting a position may be extremely difficult.", "danger", `$${liquidityUSD}`));
  } else if (liquidityUSD < 10_000) {
    score += 20;
    flags.push(flag("very-low-liquidity", "Very low liquidity", "HIGH", "Detected liquidity is below $10k, which can create severe slippage.", "danger", `$${liquidityUSD}`));
  } else if (liquidityUSD < 50_000) {
    score += 10;
    flags.push(flag("low-liquidity", "Low liquidity", "MEDIUM", "Liquidity exists but remains thin for safer trading.", "warning", `$${liquidityUSD}`));
  }
  if (concentration.topHolderPercent !== null && concentration.topHolderPercent > 35 && !trustedMint) {
    score += concentration.topHolderPercent > 50 ? 22 : 15;
    flags.push(flag("holder-concentration", "Suspicious holder concentration", "HIGH", `Largest holder controls ${concentration.topHolderPercent}% of supply.`, "warning"));
  } else if (concentration.topHolderPercent === null) {
    flags.push(unavailable("holder-distribution-unknown", "Holder distribution unavailable", "Holder concentration could not be verified from RPC/API data."));
  }
  if (config.knownScamMints.has(mintAddress) || birdeye?.data?.is_scam) {
    score += 70;
    flags.push(flag("known-scam-list", "Known scam/rug indicator", "CRITICAL", "This mint matched a configured scam/rug source.", "danger"));
  }
  if (name === "Unknown Asset" && Number(rawAmount) <= 1) {
    score += 12;
    flags.push(flag("unknown-nft-or-asset", "Suspicious NFT or unknown asset", "MEDIUM", "Unknown single-quantity assets are common in wallet spam.", "warning"));
  }
  if (isNftLike && metadataStatus !== "verified") {
    score += 15;
    flags.push(flag("suspicious-nft", "Suspicious NFT-style asset", "HIGH", "This looks like a single-quantity NFT-style asset without verified metadata, a common spam pattern.", "warning"));
  }
  if (metadataLinkWarning) {
    score += 18;
    flags.push(flag("metadata-link-risk", "Suspicious metadata link", "HIGH", metadataLinkWarning, "warning", metadataUri));
  }
  for (const supplyFlag of abnormalSupplyFlags(mint.supply.toString(), mint.decimals)) {
    score += 10;
    flags.push(supplyFlag);
  }
  if (!config.birdeyeApiKey) {
    flags.push(unavailable("birdeye-unavailable", "Known scam API unavailable", "BIRDEYE_API_KEY is not configured, so known scam/rug checks are marked unavailable."));
  }

  const riskScore = trustedMint ? Math.min(20, score) : clampScore(score);
  const unavailableCount = flags.filter((item) => item.status === "unknown").length;
  const asset = {
    mintAddress,
    tokenAccountAddress: tokenAccount?.tokenAccountAddress,
    name,
    symbol,
    balance: uiAmount(rawAmount, decimals),
    rawAmount,
    decimals,
    isZeroBalance: rawAmount === "0",
    metadataStatus,
    riskLevel: riskLevelFromScore(riskScore),
    riskScore,
    confidence: confidenceScore({ heliusAsset, dexPair, concentration, mintContext }),
    verdict: verdictFromScore(riskScore),
    riskFlags: flags,
    evidence: {
      ownerProgram: mintContext.ownerProgram,
      mintAuthority: mint.mintAuthority?.toBase58() || null,
      freezeAuthority: mint.freezeAuthority?.toBase58() || null,
      delegate: tokenAccount?.delegate || null,
      delegatedAmount: tokenAccount?.delegatedAmount || null,
      liquidityUSD,
      marketCapUSD: dexPair?.marketCap ?? dexPair?.fdv ?? null,
      topHolderPercent: concentration.topHolderPercent,
      topFivePercent: concentration.topFivePercent,
      metadataUri,
      pairUrl: dexPair?.url || null,
    },
    aiExplanation: "",
    whaleSummary,
    isNftLike,
  };
  asset.aiExplanation = aiExplanationForAsset(`${asset.name} (${asset.symbol})`, asset.riskFlags, unavailableCount);
  return asset;
}
