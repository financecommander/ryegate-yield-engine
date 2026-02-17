# Ryegate Frontend - Investor Dashboard

React-based investor dashboard for the Ryegate Yield Engine security token platform.

## Features

- **Wallet Connection**: MetaMask and WalletConnect integration
- **Holdings View**: Real-time balance tracking by partition (Reg D / Reg A+)
- **Yield Management**: View pending yield and claim distributions
- **Subscription Flow**: Direct token minting (testnet/demo)
- **Compliance Documents**: ERC-1643 document viewer with IPFS integration
- **Dark Theme**: Professional institutional finance UI

## Tech Stack

- React 18
- Vite
- ethers.js v6
- Tailwind CSS
- React Router v6
- lucide-react icons

## Setup

### Prerequisites

- Node.js 18+
- MetaMask or compatible Web3 wallet
- Access to Polygon Amoy testnet

### Environment Variables

Create a `.env` file:

```bash
VITE_RYEGATE_NOTES_ADDRESS=0x_deployed_notes_address
VITE_REVENUE_ORACLE_ADDRESS=0x_deployed_oracle_address
VITE_KYC_WHITELIST_ADDRESS=0x_deployed_kyc_address
VITE_USDC_ADDRESS=0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359
VITE_CHAIN_ID=80002
VITE_RPC_URL=https://rpc-amoy.polygon.technology
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
```

### Development

```bash
npm install
npm run dev
```

Open http://localhost:3000

### Build

```bash
npm run build
```

Output in `dist/` directory.

### Deploy to Google Cloud Run

```bash
# Build the Docker image
gcloud builds submit --tag gcr.io/PROJECT_ID/ryegate-frontend

# Deploy to Cloud Run
gcloud run deploy ryegate-frontend \
  --image gcr.io/PROJECT_ID/ryegate-frontend \
  --platform managed \
  --region us-east1 \
  --port 8080 \
  --allow-unauthenticated
```

## Pages

### Dashboard (`/`)
- Token holdings by partition
- Pending yield display
- Latest oracle performance report
- Yield claim history

### Subscribe (`/subscribe`)
- KYC status check
- Partition selection (Reg D / Reg A+)
- Investment amount entry
- Direct token minting (testnet)

### Claim (`/claim`)
- Pending yield breakdown
- Claim all yield button
- Historical claims
- Transaction tracking

### Documents (`/documents`)
- ERC-1643 document list
- IPFS links
- On-chain hash verification
- PPM, PPA, quarterly reports

## Architecture

```
src/
├── config/         — Contract ABIs, addresses, chain configs
├── context/        — Wallet connection state
├── hooks/          — Custom hooks for contracts, yield, documents
├── pages/          — Route pages
├── components/     — Reusable UI components
└── utils/          — Formatters and error handlers
```

## Contract Interactions

- **RyegateNotes**: Balance queries, yield claims, token issuance
- **KYCWhitelist**: Whitelist and accreditation checks
- **RevenueOracle**: Latest performance reports
- **USDC**: Balance and approval for subscriptions

## Security Notes

- All transactions require user approval via MetaMask
- KYC whitelisting enforced on-chain
- Lockup periods checked before transfers
- Production subscriptions require broker-dealer processing

## License

Proprietary - Ryegate Capital 2026
