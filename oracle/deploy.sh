#!/bin/bash
gcloud functions deploy pushRevenueOracle \
  --runtime nodejs20 \
  --trigger-http \
  --allow-unauthenticated \
  --entry-point pushRevenueOracle \
  --region us-east1 \
  --memory 256MB \
  --timeout 120s \
  --set-env-vars POLYGON_RPC_URL=$POLYGON_RPC_URL,REVENUE_ORACLE_ADDRESS=$REVENUE_ORACLE_ADDRESS,REVENUE_API_URL=$REVENUE_API_URL,REVENUE_API_KEY=$REVENUE_API_KEY,SLACK_WEBHOOK_URL=$SLACK_WEBHOOK_URL,CHAIN_ID=$CHAIN_ID \
  --set-secrets ORACLE_PRIVATE_KEY=oracle-private-key:latest
