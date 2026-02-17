# Ryegate Oracle Backend

Google Cloud Function for pushing revenue data from external APIs to the RevenueOracle smart contract on Polygon.

## Setup

### Prerequisites
- Google Cloud account with Cloud Functions enabled
- gcloud CLI installed and authenticated
- Node.js 20+

### 1. Prepare Environment Variables

Create a `.env` file with your configuration:

```bash
POLYGON_RPC_URL=https://rpc-amoy.polygon.technology
ORACLE_PRIVATE_KEY=0x_your_oracle_signer_private_key
REVENUE_ORACLE_ADDRESS=0x_deployed_revenue_oracle_address
REVENUE_API_URL=https://your-financials-api.com/quarterly
REVENUE_API_KEY=your_api_key
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx
CHAIN_ID=80002
```

### 2. Set Up Google Secret Manager

Store the oracle's private key in Google Secret Manager:

```bash
echo -n "0x_your_oracle_signer_private_key" | gcloud secrets create oracle-private-key --data-file=-
```

To update:
```bash
echo -n "0x_new_private_key" | gcloud secrets versions add oracle-private-key --data-file=-
```

### 3. Deploy to Google Cloud Functions

```bash
source .env
bash deploy.sh
```

The function will be deployed at:
```
https://us-east1-{PROJECT_ID}.cloudfunctions.net/pushRevenueOracle
```

### 4. Testing

**Manual Revenue Push (Testnet):**
```bash
curl -X POST https://us-east1-{PROJECT_ID}.cloudfunctions.net/pushRevenueOracle \
  -H "Content-Type: application/json" \
  -d '{
    "grossRevenue": 2000000,
    "operatingCosts": 800000,
    "adjustedEBITDA": 1000000,
    "periodStart": "2026-01-01",
    "periodEnd": "2026-03-31"
  }'
```

**Via External API:**
Set `REVENUE_API_URL` and trigger with a GET request. The function will fetch data and submit.

## Revenue Data Format

Expected API response:
```json
{
  "grossRevenue": 2000000,
  "operatingCosts": 800000,
  "adjustedEBITDA": 1000000,
  "periodStart": "2026-01-01",
  "periodEnd": "2026-03-31"
}
```

All amounts are whole dollars and will be converted to 6-decimal USDC format.

## Features

- **Retry Logic**: 3 attempts with exponential backoff (1s, 3s, 9s)
- **Slack Notifications**: Success/failure alerts via webhook
- **Fallback Mode**: Manual data submission if API is unavailable
- **Gas Tracking**: Reports gas used for each transaction

## Admin CLI

See [../admin/README.md](../admin/README.md) for CLI setup and commands.

## Monitoring

View logs in Google Cloud:
```bash
gcloud functions logs read pushRevenueOracle --limit 50
```
