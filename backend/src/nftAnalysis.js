import { fetchHeliusOwnerAssets } from "./externalApis.js";
import { flag, riskLevelFromScore } from "./utils.js";

function suspiciousMetadataLink(uri) {
  if (!uri) return null;
  const lowered = uri.toLowerCase();
  if (lowered.startsWith("http://")) return "Metadata uses insecure HTTP.";
  if (/(bit\.ly|tinyurl|t\.me|telegram|discord|claim|airdrop|bonus|free|reward)/i.test(lowered)) {
    return "Metadata link contains spam, lure, or redirect keywords.";
  }
  return null;
}

export function analyzeNftAsset(asset) {
  const metadata = asset.content?.metadata || {};
  const links = asset.content?.links || {};
  const mintAddress = asset.id;
  const metadataUri = asset.content?.json_uri || null;
  const flags = [];
  const collectionVerified = Boolean(asset.grouping?.some((item) => item.group_key === "collection"));
  if (!collectionVerified) {
    flags.push(flag("unverified-nft-collection", "Unverified NFT collection", "MEDIUM", "NFT does not have a clearly verified collection signal from the asset indexer.", "warning"));
  }
  const linkWarning = suspiciousMetadataLink(metadataUri || links.external_url);
  if (linkWarning) {
    flags.push(flag("malicious-looking-metadata", "Suspicious NFT metadata link", "HIGH", linkWarning, "warning", metadataUri || links.external_url));
  }
  if (/airdrop|claim|reward|bonus|free|visit/i.test(`${metadata.name || ""} ${metadata.description || ""}`)) {
    flags.push(flag("spam-nft-language", "Spam-like NFT language", "HIGH", "NFT name or description contains airdrop/claim language often used in spam assets.", "warning"));
  }
  const score = flags.reduce((sum, item) => sum + (item.severity === "HIGH" ? 40 : 20), 0);
  return {
    mintAddress,
    name: metadata.name || "Unknown NFT",
    symbol: metadata.symbol || "NFT",
    image: links.image || null,
    metadataUri,
    riskLevel: riskLevelFromScore(score),
    riskFlags: flags.length
      ? flags
      : [flag("nft-no-critical-findings", "No critical NFT findings", "SAFE", "No suspicious NFT metadata or collection signal was detected.", "ok")],
  };
}

export async function scanWalletNfts(walletAddress) {
  const ownerAssets = await fetchHeliusOwnerAssets(walletAddress);
  return ownerAssets
    .filter((asset) => asset.interface === "V1_NFT" || asset.interface === "ProgrammableNFT")
    .map(analyzeNftAsset);
}
