import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

function App() {
    const [yieldRates, setYieldRates] = useState([]);
    const [liquidity, setLiquidity] = useState([]);

    useEffect(() => {
        // TODO: implement logic to fetch yield rates and liquidity
    }, []);

    return (
        <div>
            <h1>Yield Rates:</h1>
            <ul>
                {yieldRates.map((yieldRate, index) => (
                    <li key={index}>{yieldRate}</li>
                ))}
            </ul>
            <h1>Liquidity:</h1>
            <ul>
                {liquidity.map((liquidityAmount, index) => (
                    <li key={index}>{liquidityAmount}</li>
                ))}
            </ul>
        </div>
    );
}

export default App;
