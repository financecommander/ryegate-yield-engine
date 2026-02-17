import React from 'react';
import { Lock, Unlock } from 'lucide-react';
import { formatUSDC } from '../utils/format';
import { PARTITION_NAMES } from '../config/constants';
import PartitionBadge from './PartitionBadge';

export default function BalanceCard({ totalBalance, partitions, lockupInfo }) {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-300 mb-4">Your Holdings</h3>
      
      <div className="mb-6">
        <p className="text-sm text-gray-400 mb-1">Total Balance</p>
        <p className="text-3xl font-bold text-white">{formatUSDC(totalBalance)}</p>
      </div>

      {partitions && partitions.length > 0 ? (
        <div className="space-y-4">
          <p className="text-sm font-semibold text-gray-400">By Partition</p>
          {partitions.map((partition, index) => {
            const isLocked = lockupInfo && lockupInfo[partition.name];
            const lockupEnd = isLocked ? new Date(isLocked * 1000) : null;
            const isCurrentlyLocked = lockupEnd && lockupEnd > new Date();

            return (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-dark-bg rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <PartitionBadge partition={partition.name} />
                  <div>
                    <p className="font-medium text-white">{formatUSDC(partition.balance)}</p>
                    <p className="text-xs text-gray-400">
                      {PARTITION_NAMES[partition.name] || 'Unknown Partition'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {isCurrentlyLocked ? (
                    <div className="flex items-center space-x-1 text-amber-500">
                      <Lock className="w-4 h-4" />
                      <span className="text-xs">
                        Locked until {lockupEnd.toLocaleDateString()}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 text-emerald-500">
                      <Unlock className="w-4 h-4" />
                      <span className="text-xs">Transferable</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-gray-400 text-center py-4">
          No holdings yet. Visit the Subscribe page to invest.
        </p>
      )}
    </div>
  );
}
