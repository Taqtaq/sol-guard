# SolGuard

SolGuard is a Solana wallet and token security platform. The repository is split into:

- `frontend` - Next.js app, landing page, Phantom wallet connect, dashboard, pre-trade scan UI
- `backend` - Express API service for Solana RPC scans, monitoring, alerts, simulation, score history
- `shared` - shared TypeScript API contract types used by the frontend

The landing page remains at `/`. The security console is at `/dashboard`.

## Prerequisites

- Node.js 20+
- npm
- Phantom browser extension for wallet-connect testing
- Strongly recommended: a private Solana RPC endpoint. Public RPC often rate-limits wallet scans.

## Install

```bash
npm run install:all
```

## Environment

Frontend:

```bash
copy frontend\.env.example frontend\.env.local
```

Backend:

```bash
copy backend\.env.example backend\.env
```

Backend variables:

```env
PORT=8000
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
FRONTEND_ORIGIN=http://localhost:3000,http://127.0.0.1:3000
HELIUS_API_KEY=
BIRDEYE_API_KEY=
KNOWN_SCAM_MINTS=
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

If optional APIs are not configured, SolGuard marks those checks as unavailable instead of turning missing data into fake risk.

## Run Locally

Terminal 1:

```bash
npm run dev:backend
```

Terminal 2:

```bash
npm run dev:frontend
```

Open:

```text
http://localhost:3000/dashboard
```

## API

- `GET /api/health`
- `POST /api/scan-wallet`
- `POST /api/scan-token`
- `POST /api/monitor-wallet`
- `POST /api/simulate-transaction`
- `GET /api/score-history/:wallet`
- `POST /api/telegram/test-alert`

## What Is Real

- Phantom integration uses the official Solana wallet adapter providers.
- Wallet scan discovers visible SPL and Token-2022 accounts from Solana RPC.
- Zero-balance visible token accounts are included and labeled as possible spam/inactive assets, not automatic scams.
- Token analysis checks mint authority, freeze authority, metadata, holder concentration, liquidity, known-scam sources, delegates, abnormal supply, and suspicious metadata links.
- Monitoring stores wallet snapshots and compares future scans for new assets, balance changes, authority changes, liquidity drops, NFT changes, and score drops.
- Alerts have severity, title, explanation, evidence, timestamp, source, wallet, and mint.
- Score history is stored locally in `backend/data`.
- Transaction simulation decodes supplied transaction payloads when possible and otherwise runs safe intent-level pre-flight checks.

## Best Results

Use these for a stronger demo:

- `SOLANA_RPC_URL` from Helius, QuickNode, Triton, Alchemy, or another paid RPC provider
- `HELIUS_API_KEY` for NFT and richer asset metadata
- `BIRDEYE_API_KEY` for scam/security enrichment
- `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` for alert delivery
- `KNOWN_SCAM_MINTS` for local threat-intel demos

## Verification

```bash
npm run lint
npm run build
npm run test:backend
```

Manual browser verification:

1. Start backend and frontend.
2. Open `/dashboard`.
3. Click `Connect Wallet`.
4. Select Phantom in the official wallet modal.
5. Approve in Phantom.
6. Confirm the shortened wallet address renders.
7. Confirm wallet scan starts automatically.
8. Run a token scan, monitoring scan, and simulation preview.

## Deployment Notes

- Deploy `frontend` to Vercel or another Next.js host.
- Deploy `backend` to Render, Railway, Fly.io, or a Node-capable VPS.
- Set `NEXT_PUBLIC_BACKEND_URL` in the frontend host to the deployed backend URL.
- Set backend CORS with `FRONTEND_ORIGIN=https://your-frontend-domain`.
- Use a private RPC URL for production reliability.
