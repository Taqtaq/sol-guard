# SolGuard Backend

Express API service for wallet and token risk scanning.

```bash
npm install
copy .env.example .env
npm run dev
```

Health check:

```text
GET http://127.0.0.1:8000/api/health
```

The scanner uses public Solana RPC by default and marks paid/API-dependent checks as `unknown` when keys are not configured.
