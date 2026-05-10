import { config } from "./config.js";

export async function fetchHeliusAsset(mintAddress) {
  if (!config.heliusApiKey) return null;
  try {
    const response = await fetch(`https://mainnet.helius-rpc.com/?api-key=${config.heliusApiKey}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "solguard-asset",
        method: "getAsset",
        params: { id: mintAddress },
      }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.result || null;
  } catch {
    return null;
  }
}

export async function fetchHeliusOwnerAssets(walletAddress) {
  if (!config.heliusApiKey) return [];
  try {
    const response = await fetch(`https://mainnet.helius-rpc.com/?api-key=${config.heliusApiKey}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "solguard-owner-assets",
        method: "getAssetsByOwner",
        params: {
          ownerAddress: walletAddress,
          page: 1,
          limit: 100,
          displayOptions: {
            showFungible: true,
            showNativeBalance: false,
            showCollectionMetadata: true,
          },
        },
      }),
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.result?.items || [];
  } catch {
    return [];
  }
}

export async function fetchDexScreener(mintAddress) {
  try {
    const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${mintAddress}`);
    if (!response.ok) return null;
    const data = await response.json();
    const pairs = Array.isArray(data.pairs) ? data.pairs : [];
    if (!pairs.length) return null;
    return pairs.sort((a, b) => ((b.liquidity?.usd || 0) - (a.liquidity?.usd || 0)))[0];
  } catch {
    return null;
  }
}

export async function fetchBirdeyeTokenSecurity(mintAddress) {
  if (!config.birdeyeApiKey) return null;
  try {
    const response = await fetch(`https://public-api.birdeye.so/defi/token_security?address=${mintAddress}`, {
      headers: { "X-API-KEY": config.birdeyeApiKey, "x-chain": "solana" },
    });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}
