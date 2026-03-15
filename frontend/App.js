import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import './App.css';

function App() {
    const [yieldRates, setYieldRates] = useState({});
    const [liquidityProviders, setLiquidityProviders] = useState({});

    useEffect(() => {
        // Fetch the yield rates and liquidity providers from the oracle contract
        fetch('/yield-rates')
            .then(response => response.json())
            .then(data => setYieldRates(data));
        fetch('/liquidity-providers')
            .then(response => response.json())
            .then(data => setLiquidityProviders(data));
    }, []);

    return (
        <div>
            <h1>Ryegate Yield Engine</h1>
            <p>Yield Rates: {JSON.stringify(yieldRates)}</p>
            <p>Liquidity Providers: {JSON.stringify(liquidityProviders)}</p>
        </div>
    );
}

export default App;