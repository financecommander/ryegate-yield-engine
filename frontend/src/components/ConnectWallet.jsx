import React from 'react';
import { Wallet, ChevronDown, LogOut, AlertCircle } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { formatAddress } from '../utils/format';
import { getChainConfig } from '../config/chains';

export default function ConnectWallet() {
  const { address, isConnected, connect, disconnect, switchChain, targetChainId, isCorrectChain, chainId, error } = useWallet();

  if (!isConnected) {
    return (
      <button
        onClick={connect}
        className="btn-primary flex items-center space-x-2"
      >
        <Wallet className="w-4 h-4" />
        <span>Connect Wallet</span>
      </button>
    );
  }

  const currentChainConfig = chainId ? getChainConfig(chainId) : null;
  const targetChainConfig = getChainConfig(targetChainId);

  if (!isCorrectChain) {
    return (
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2 px-3 py-2 bg-yellow-900/30 border border-yellow-600 rounded-lg text-yellow-500 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>Wrong Network</span>
        </div>
        <button
          onClick={() => switchChain(targetChainId)}
          className="btn-primary"
        >
          Switch to {targetChainConfig.chainName}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      {/* Chain Indicator */}
      <div className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-emerald-900/30 border border-emerald-600 rounded-lg text-emerald-400 text-sm">
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
        <span>{currentChainConfig?.chainName || 'Unknown'}</span>
      </div>

      {/* Address Display with Dropdown */}
      <div className="relative group">
        <button className="flex items-center space-x-2 px-4 py-2 bg-dark-card border border-dark-border rounded-lg hover:border-emerald-600 transition">
          <Wallet className="w-4 h-4 text-emerald-500" />
          <span className="font-mono text-sm">{formatAddress(address)}</span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>

        {/* Dropdown Menu */}
        <div className="absolute right-0 mt-2 w-48 bg-dark-card border border-dark-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
          <button
            onClick={disconnect}
            className="flex items-center space-x-2 w-full px-4 py-3 text-left text-red-400 hover:bg-dark-bg transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Disconnect</span>
          </button>
        </div>
      </div>
    </div>
  );
}
