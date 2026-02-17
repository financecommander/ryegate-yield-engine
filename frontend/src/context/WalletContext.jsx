import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { getChainConfig, SUPPORTED_CHAIN_IDS } from '../config/chains';

const WalletContext = createContext();

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
}

export function WalletProvider({ children }) {
  const [address, setAddress] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  const targetChainId = parseInt(import.meta.env.VITE_CHAIN_ID || '80002');

  // Initialize provider
  useEffect(() => {
    if (window.ethereum) {
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(web3Provider);
    }
  }, []);

  // Auto-reconnect on page load
  useEffect(() => {
    const autoConnect = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            await connect();
          }
        } catch (err) {
          console.error('Auto-reconnect failed:', err);
        }
      }
    };
    autoConnect();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          disconnect();
        } else {
          setAddress(accounts[0]);
        }
      };

      const handleChainChanged = (newChainId) => {
        setChainId(parseInt(newChainId, 16));
        window.location.reload(); // Recommended by MetaMask
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setError('Please install MetaMask to use this app');
      return;
    }

    try {
      setError(null);
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const userAddress = accounts[0];
      
      // Get network
      const network = await web3Provider.getNetwork();
      const currentChainId = Number(network.chainId);
      
      // Get signer
      const userSigner = await web3Provider.getSigner();
      
      setProvider(web3Provider);
      setSigner(userSigner);
      setAddress(userAddress);
      setChainId(currentChainId);
      setIsConnected(true);

      // Check if on correct chain
      if (currentChainId !== targetChainId) {
        setError(`Please switch to ${getChainConfig(targetChainId).chainName}`);
      }
    } catch (err) {
      console.error('Connection error:', err);
      setError(err.message || 'Failed to connect wallet');
    }
  }, [targetChainId]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setSigner(null);
    setIsConnected(false);
    setError(null);
  }, []);

  const switchChain = useCallback(async (newChainId) => {
    if (!window.ethereum) return;

    try {
      const chainConfig = getChainConfig(newChainId);
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainConfig.chainId }],
      });
    } catch (switchError) {
      // Chain doesn't exist in wallet, try adding it
      if (switchError.code === 4902) {
        try {
          const chainConfig = getChainConfig(newChainId);
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [chainConfig],
          });
        } catch (addError) {
          setError('Failed to add network to wallet');
        }
      } else {
        setError('Failed to switch network');
      }
    }
  }, []);

  const value = {
    address,
    chainId,
    provider,
    signer,
    isConnected,
    error,
    connect,
    disconnect,
    switchChain,
    targetChainId,
    isCorrectChain: chainId === targetChainId,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}
