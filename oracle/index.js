const express = require('express');
const axios = require('axios');
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/YOUR_PROJECT_ID'));

const app = express();

app.get('/yield-rates', async (req, res) => {
    try {
        const yieldRates = await axios.get('https://api.example.com/yield-rates');
        res.json(yieldRates.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching yield rates' });
    }
});

app.listen(3000, () => {
    console.log('Oracle service listening on port 3000');
});