const { ethers } = require('ethers');
const axios = require('axios');
require('dotenv').config();

// Revenue Oracle ABI for pushRevenue function
const REVENUE_ORACLE_ABI = [
  'function pushRevenue(uint256 grossRevenue, uint256 operatingCosts, uint256 adjustedEBITDA, uint256 periodStart, uint256 periodEnd) external'
];

// Convert ISO date string to Unix timestamp
function dateToTimestamp(dateStr) {
  return Math.floor(new Date(dateStr).getTime() / 1000);
}

// Convert dollar amount to 6-decimal USDC format
function dollarToWei(amount) {
  return amount * 1_000_000;
}

// Retry logic with exponential backoff
async function retryWithBackoff(fn, maxAttempts = 3) {
  const delays = [1000, 3000, 9000]; // 1s, 3s, 9s
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts - 1) throw error;
      const delay = delays[attempt];
      console.log(`Attempt ${attempt + 1} failed. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Send Slack notification
async function sendSlackNotification(message, isSuccess) {
  if (!process.env.SLACK_WEBHOOK_URL) return;
  
  try {
    await axios.post(process.env.SLACK_WEBHOOK_URL, {
      text: message
    });
  } catch (error) {
    console.error('Slack notification failed:', error.message);
  }
}

// Main handler
exports.pushRevenueOracle = async (req, res) => {
  try {
    console.log('Oracle function triggered');
    
    // Validate environment
    if (!process.env.ORACLE_PRIVATE_KEY || !process.env.REVENUE_ORACLE_ADDRESS || !process.env.POLYGON_RPC_URL) {
      throw new Error('Missing required env vars: ORACLE_PRIVATE_KEY, REVENUE_ORACLE_ADDRESS, POLYGON_RPC_URL');
    }

    let revenueData;

    // Check if we should fetch from API or use request body
    if (process.env.REVENUE_API_URL) {
      console.log('Fetching revenue data from API...');
      try {
        const response = await axios.get(process.env.REVENUE_API_URL, {
          headers: process.env.REVENUE_API_KEY ? { 'X-API-Key': process.env.REVENUE_API_KEY } : {}
        });
        revenueData = response.data;
      } catch (error) {
        throw new Error(`Revenue API fetch failed: ${error.message}`);
      }
    } else {
      console.log('Using revenue data from request body');
      revenueData = req.body;
    }

    // Validate revenue data
    if (!revenueData.grossRevenue || !revenueData.operatingCosts || !revenueData.adjustedEBITDA || 
        !revenueData.periodStart || !revenueData.periodEnd) {
      throw new Error('Missing required revenue fields: grossRevenue, operatingCosts, adjustedEBITDA, periodStart, periodEnd');
    }

    // Validate date formats
    if (isNaN(Date.parse(revenueData.periodStart)) || isNaN(Date.parse(revenueData.periodEnd))) {
      throw new Error('Invalid date format for periodStart or periodEnd');
    }

    // Convert values
    const grossRevenue = dollarToWei(revenueData.grossRevenue);
    const operatingCosts = dollarToWei(revenueData.operatingCosts);
    const adjustedEBITDA = dollarToWei(revenueData.adjustedEBITDA);
    const periodStart = dateToTimestamp(revenueData.periodStart);
    const periodEnd = dateToTimestamp(revenueData.periodEnd);

    console.log(`Converted values:
      Gross Revenue: ${grossRevenue}
      Operating Costs: ${operatingCosts}
      Adjusted EBITDA: ${adjustedEBITDA}
      Period Start: ${periodStart}
      Period End: ${periodEnd}`);

    // Setup provider and signer
    const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
    const signer = new ethers.Wallet(process.env.ORACLE_PRIVATE_KEY, provider);
    
    // Initialize contract
    const contract = new ethers.Contract(
      process.env.REVENUE_ORACLE_ADDRESS,
      REVENUE_ORACLE_ABI,
      signer
    );

    let txHash, gasUsed;

    // Execute with retry logic
    const tx = await retryWithBackoff(async () => {
      return await contract.pushRevenue(
        grossRevenue,
        operatingCosts,
        adjustedEBITDA,
        periodStart,
        periodEnd
      );
    });

    txHash = tx.hash;
    console.log(`Transaction submitted: ${txHash}`);

    // Wait for confirmation
    const receipt = await tx.wait();
    gasUsed = receipt.gasUsed.toString();
    console.log(`Transaction confirmed. Gas used: ${gasUsed}`);

    // Send Slack notification
    const quarter = Math.floor((new Date(revenueData.periodStart).getMonth()) / 3) + 1;
    const year = new Date(revenueData.periodStart).getFullYear();
    const slackMessage = `✅ Revenue reported: $${revenueData.grossRevenue.toLocaleString()} gross, $${revenueData.adjustedEBITDA.toLocaleString()} EBITDA for Q${quarter} ${year}`;
    await sendSlackNotification(slackMessage, true);

    // Return success response
    res.json({
      success: true,
      txHash,
      gasUsed,
      blockNumber: receipt.blockNumber
    });

  } catch (error) {
    console.error('Oracle error:', error.message);
    
    // Send Slack failure notification
    const slackMessage = `🚨 Oracle push failed: ${error.message}`;
    await sendSlackNotification(slackMessage, false);

    // Return error response
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};
