import React from 'react';
import { Loader2, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { getChainConfig } from '../config/chains';

export default function TransactionStatus({ txHash, status, error }) {
  const chainId = parseInt(import.meta.env.VITE_CHAIN_ID || '80002');
  const chainConfig = getChainConfig(chainId);

  if (!status) return null;

  const renderStatus = () => {
    switch (status) {
      case 'pending':
        return (
          <div className="flex items-center space-x-3 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
            <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
            <div>
              <p className="font-semibold text-blue-400">Transaction Pending</p>
              <p className="text-sm text-gray-400">Please wait for confirmation...</p>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="flex items-center justify-between p-4 bg-emerald-900/20 border border-emerald-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="font-semibold text-emerald-400">Transaction Confirmed</p>
                <p className="text-sm text-gray-400">Your transaction was successful</p>
              </div>
            </div>
            {txHash && (
              <a
                href={`${chainConfig.blockExplorerUrls[0]}/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-emerald-400 hover:text-emerald-300 text-sm"
              >
                <span>View</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        );

      case 'error':
      case 'failed':
        return (
          <div className="flex items-center space-x-3 p-4 bg-red-900/20 border border-red-700 rounded-lg">
            <XCircle className="w-5 h-5 text-red-400" />
            <div className="flex-1">
              <p className="font-semibold text-red-400">Transaction Failed</p>
              <p className="text-sm text-gray-400 mt-1">
                {error || 'Transaction failed. Please try again.'}
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return <div className="mt-4">{renderStatus()}</div>;
}
