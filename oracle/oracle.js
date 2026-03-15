const express = require('express');
const app = express();
const Web3 = require('web3');
const web3 = new Web3('https://mainnet.infura.io/v3/YOUR_PROJECT_ID');

// Define the oracle contract ABI
const oracleAbi = [...];

// Define the oracle contract address
const oracleAddress = '0x...';

// Create a new instance of the oracle contract
const oracleContract = new web3.eth.Contract(oracleAbi, oracleAddress);

// Define the API endpoint for fetching yield rates
app.get('/yield-rates', async (req, res) => {
    // Fetch the yield rates from the oracle contract
    const yieldRates = await oracleContract.methods.getYieldRates().call();
    res.json(yieldRates);
});

// Start the server
app.listen(3000, () => {
    console.log('Oracle server listening on port 3000');
});