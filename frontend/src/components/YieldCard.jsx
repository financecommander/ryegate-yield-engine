import React from 'react';
import { DollarSign, TrendingUp } from 'lucide-react';
import { formatUSDC } from '../utils/format';
import { FIXED_RATE, KICKER_RATE } from '../config/constants';

export default function YieldCard({ pendingYield, onClaim, loading }) {
  const hasPendingYield = pendingYield && pendingYield > BigInt(0);

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-300 mb-4">Pending Yield</h3>
      
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <DollarSign className="w-6 h-6 text-emerald-500" />
          <p className="text-3xl font-bold text-white">
            {formatUSDC(pendingYield || BigInt(0))}
          </p>
        </div>
        <p className="text-sm text-gray-400">Available to claim in USDC</p>
      </div>

      <button
        onClick={onClaim}
        disabled={!hasPendingYield || loading}
        className="btn-primary w-full mb-4"
      >
        {loading ? 'Processing...' : 'Claim Yield'}
      </button>

      <div className="border-t border-dark-border pt-4">
        <p className="text-sm font-semibold text-gray-400 mb-2">Yield Structure</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Fixed Rate:</span>
            <span className="text-white font-semibold">{FIXED_RATE} APR</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-1">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-gray-400">EBITDA Kicker:</span>
            </div>
            <span className="text-emerald-400 font-semibold">{KICKER_RATE}</span>
          </div>
        </div>

        <div className="mt-4 p-3 bg-emerald-900/20 border border-emerald-700/30 rounded-lg">
          <p className="text-xs text-emerald-300">
            Next distribution: End of current quarter
          </p>
        </div>
      </div>
    </div>
  );
}
