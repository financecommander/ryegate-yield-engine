import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useContract } from '../hooks/useContract';
import { useYield } from '../hooks/useYield';
import { CONTRACTS, RYEGATE_NOTES_ABI } from '../config/contracts';
import { formatUSDC, formatDate } from '../utils/format';
import { parseError } from '../utils/errors';
import TransactionStatus from '../components/TransactionStatus';
import ConnectWallet from '../components/ConnectWallet';

export default function Claim() {
  const { address, isConnected } = useWallet();
  const { contractWithSigner: notesWithSigner } = useContract(CONTRACTS.RYEGATE_NOTES, RYEGATE_NOTES_ABI);
  const { contract: notesContract } = useContract(CONTRACTS.RYEGATE_NOTES, RYEGATE_NOTES_ABI);
  const { pendingYield, currentPeriod, refresh } = useYield();

  const [claiming, setClaiming] = useState(false);
  const [txStatus, setTxStatus] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [error, setError] = useState(null);
  const [claimHistory, setClaimHistory] = useState([]);
  const [claimedBalance, setClaimedBalance] = useState(null);

  // Fetch claim history
  useEffect(() => {
    const fetchClaimHistory = async () => {
      if (!notesContract || !address) return;

      try {
        const filter = notesContract.filters.YieldClaimed(address);
        const events = await notesContract.queryFilter(filter, -10000);

        const history = await Promise.all(
          events.map(async (event) => {
            const block = await event.getBlock();
            return {
              period: Number(event.args[1]),
              amount: event.args[2],
              blockNumber: event.blockNumber,
              txHash: event.transactionHash,
              timestamp: block.timestamp,
            };
          })
        );

        setClaimHistory(history.reverse());
      } catch (err) {
        console.error('Error fetching claim history:', err);
      }
    };

    fetchClaimHistory();
  }, [notesContract, address]);

  const handleClaim = async () => {
    if (!notesWithSigner || !address) return;

    try {
      setClaiming(true);
      setError(null);
      setTxStatus('pending');
      setTxHash(null);
      setClaimedBalance(null);

      const tx = await notesWithSigner.claimYield();
      setTxHash(tx.hash);

      const receipt = await tx.wait();

      // Parse the claimed amount from events
      const yieldClaimedEvent = receipt.logs
        .map(log => {
          try {
            return notesContract.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find(event => event && event.name === 'YieldClaimed');

      if (yieldClaimedEvent) {
        setClaimedBalance(yieldClaimedEvent.args[2]);
      }

      setTxStatus('success');

      // Refresh data
      setTimeout(() => {
        refresh();
      }, 2000);

    } catch (err) {
      console.error('Claim error:', err);
      setError(parseError(err));
      setTxStatus('error');
    } finally {
      setClaiming(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center card max-w-md">
          <h2 className="text-2xl font-bold text-white mb-4">Claim Your Yield</h2>
          <p className="text-gray-400 mb-6">
            Connect your wallet to view and claim available yield distributions.
          </p>
          <ConnectWallet />
        </div>
      </div>
    );
  }

  const hasPendingYield = pendingYield && pendingYield > BigInt(0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Pending Yield Card */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <DollarSign className="w-8 h-8 text-emerald-500" />
            <div>
              <h2 className="text-2xl font-bold text-white">Claim Yield</h2>
              <p className="text-gray-400">Your pending USDC distributions</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Current Period</p>
            <p className="text-xl font-bold text-emerald-400">Period {currentPeriod}</p>
          </div>
        </div>

        <div className="mb-8 p-6 bg-gradient-to-r from-emerald-900/20 to-blue-900/20 border border-emerald-700/30 rounded-lg">
          <p className="text-sm text-gray-400 mb-2">Available to Claim</p>
          <p className="text-5xl font-bold text-white mb-4">
            {formatUSDC(pendingYield || BigInt(0))}
          </p>
          
          <button
            onClick={handleClaim}
            disabled={!hasPendingYield || claiming}
            className="btn-primary w-full md:w-auto px-8 py-3 text-lg"
          >
            {claiming ? 'Processing...' : 'Claim All Yield'}
          </button>
        </div>

        {/* Breakdown */}
        {hasPendingYield && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-dark-bg rounded-lg">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">Includes</p>
                <p className="font-semibold text-white">Fixed yield + EBITDA kicker</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">Distribution</p>
                <p className="font-semibold text-white">Quarterly in USDC</p>
              </div>
            </div>
          </div>
        )}

        <TransactionStatus txHash={txHash} status={txStatus} error={error} />

        {txStatus === 'success' && claimedBalance && (
          <div className="mt-4 p-4 bg-emerald-900/20 border border-emerald-700 rounded-lg text-center">
            <p className="text-emerald-400 font-semibold">
              Successfully claimed {formatUSDC(claimedBalance)}!
            </p>
          </div>
        )}
      </div>

      {/* Info Card */}
      {!hasPendingYield && (
        <div className="card border-blue-700/30">
          <div className="text-center py-8">
            <DollarSign className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No Yield Available</h3>
            <p className="text-gray-400 mb-4">
              You don't have any yield to claim at this time.
            </p>
            <p className="text-sm text-gray-500">
              Yield distributions are calculated and made available quarterly based on the power plant's revenue performance.
            </p>
          </div>
        </div>
      )}

      {/* Claim History */}
      {claimHistory.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-300 mb-4">Claim History</h3>
          <div className="space-y-3">
            {claimHistory.map((claim, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-dark-bg rounded-lg hover:bg-dark-border transition"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-emerald-900/30 rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Period {claim.period}</p>
                    <p className="text-sm text-gray-400">{formatDate(claim.timestamp)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-400">{formatUSDC(claim.amount)}</p>
                  <a
                    href={`https://amoy.polygonscan.com/tx/${claim.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-400 hover:text-emerald-400"
                  >
                    View Tx
                  </a>
                </div>
              </div>
            ))}
          </div>

          {claimHistory.length > 10 && (
            <p className="text-center text-sm text-gray-400 mt-4">
              Showing last 10 claims
            </p>
          )}
        </div>
      )}
    </div>
  );
}
