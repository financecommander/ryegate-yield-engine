import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Calendar } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useContract } from '../hooks/useContract';
import { useYield } from '../hooks/useYield';
import { CONTRACTS, RYEGATE_NOTES_ABI, KYC_WHITELIST_ABI } from '../config/contracts';
import { REG_D, REG_A_PLUS, PARTITION_NAMES } from '../config/constants';
import { formatUSDC, formatAddress, formatDate } from '../utils/format';
import ConnectWallet from '../components/ConnectWallet';
import BalanceCard from '../components/BalanceCard';
import YieldCard from '../components/YieldCard';
import { parseError } from '../utils/errors';

export default function Dashboard() {
  const { address, isConnected } = useWallet();
  const { contract: notesContract } = useContract(CONTRACTS.RYEGATE_NOTES, RYEGATE_NOTES_ABI);
  const { contract: kycContract } = useContract(CONTRACTS.KYC_WHITELIST, KYC_WHITELIST_ABI);
  const { pendingYield, currentPeriod, totalSupply, latestReport, loading, refresh } = useYield();

  const [tokenInfo, setTokenInfo] = useState({ name: '', symbol: '' });
  const [balance, setBalance] = useState(BigInt(0));
  const [partitions, setPartitions] = useState([]);
  const [lockupInfo, setLockupInfo] = useState({});
  const [isWhitelisted, setIsWhitelisted] = useState(false);
  const [yieldHistory, setYieldHistory] = useState([]);
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState(null);

  // Fetch token info
  useEffect(() => {
    const fetchTokenInfo = async () => {
      if (!notesContract) return;
      try {
        const [name, symbol] = await Promise.all([
          notesContract.name(),
          notesContract.symbol(),
        ]);
        setTokenInfo({ name, symbol });
      } catch (error) {
        console.error('Error fetching token info:', error);
      }
    };
    fetchTokenInfo();
  }, [notesContract]);

  // Fetch user balance and partitions
  useEffect(() => {
    const fetchUserData = async () => {
      if (!notesContract || !address) return;

      try {
        const [totalBal, userPartitions, whitelisted] = await Promise.all([
          notesContract.balanceOf(address),
          notesContract.partitionsOf(address),
          kycContract ? kycContract.isWhitelisted(address) : false,
        ]);

        setBalance(totalBal);
        setIsWhitelisted(whitelisted);

        // Fetch balance for each partition
        const partitionData = await Promise.all(
          userPartitions.map(async (p) => {
            const bal = await notesContract.balanceOfByPartition(p, address);
            const lockup = await notesContract.lockupStart(address, p);
            return { name: p, balance: bal, lockup };
          })
        );

        setPartitions(partitionData);

        // Build lockup info map
        const lockupMap = {};
        partitionData.forEach((p) => {
          if (p.lockup && Number(p.lockup) > 0) {
            lockupMap[p.name] = Number(p.lockup) + (365 * 24 * 60 * 60); // Add 1 year
          }
        });
        setLockupInfo(lockupMap);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [notesContract, kycContract, address]);

  // Fetch yield history (YieldClaimed events)
  useEffect(() => {
    const fetchYieldHistory = async () => {
      if (!notesContract || !address) return;

      try {
        const filter = notesContract.filters.YieldClaimed(address);
        const events = await notesContract.queryFilter(filter, -10000); // Last ~10k blocks

        const history = events.map((event) => ({
          period: Number(event.args[1]),
          amount: event.args[2],
          blockNumber: event.blockNumber,
          txHash: event.transactionHash,
        }));

        setYieldHistory(history.reverse()); // Most recent first
      } catch (error) {
        console.error('Error fetching yield history:', error);
      }
    };

    fetchYieldHistory();
  }, [notesContract, address]);

  const handleClaim = async () => {
    if (!notesContract || !address) return;

    try {
      setClaiming(true);
      setClaimError(null);

      const tx = await notesContract.claimYield();
      await tx.wait();

      // Refresh data
      refresh();
    } catch (error) {
      console.error('Claim error:', error);
      setClaimError(parseError(error));
    } finally {
      setClaiming(false);
    }
  };

  const userOwnershipPercent = totalSupply > BigInt(0) 
    ? (Number(balance) / Number(totalSupply) * 100).toFixed(4) 
    : '0';

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center card max-w-md">
          <h2 className="text-2xl font-bold text-white mb-4">Welcome to Ryegate Yield Engine</h2>
          <p className="text-gray-400 mb-6">
            Connect your wallet to view your security token holdings and yield distribution.
          </p>
          <ConnectWallet />
        </div>
      </div>
    );
  }

  if (!isWhitelisted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center card max-w-md border-amber-600">
          <h2 className="text-2xl font-bold text-amber-400 mb-4">KYC Required</h2>
          <p className="text-gray-400 mb-4">
            Your wallet address is not whitelisted. Please complete KYC verification with our
            broker-dealer to invest in Ryegate Notes.
          </p>
          <p className="text-sm text-gray-500">
            Contact: compliance@ryegate.example.com
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              Welcome back, {formatAddress(address)}
            </h2>
            <p className="text-gray-400">
              {tokenInfo.name} ({tokenInfo.symbol})
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Current Period</p>
            <p className="text-xl font-bold text-emerald-400">Period {currentPeriod}</p>
          </div>
        </div>
      </div>

      {/* Main Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <BalanceCard 
          totalBalance={balance} 
          partitions={partitions}
          lockupInfo={lockupInfo}
        />

        <YieldCard 
          pendingYield={pendingYield}
          onClaim={handleClaim}
          loading={claiming}
        />

        {/* Status Card */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-300 mb-4">Portfolio Status</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-400">Current Period</span>
              </div>
              <span className="font-semibold text-white">{currentPeriod}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-400">Total Supply</span>
              </div>
              <span className="font-semibold text-white">{formatUSDC(totalSupply)}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-400">Your Ownership</span>
              </div>
              <span className="font-semibold text-emerald-400">{userOwnershipPercent}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Latest Oracle Report */}
      {latestReport && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-300 mb-4">Latest Performance Report</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-400">Gross Revenue</p>
              <p className="text-xl font-bold text-white">{formatUSDC(latestReport.grossRevenue)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Operating Costs</p>
              <p className="text-xl font-bold text-white">{formatUSDC(latestReport.operatingCosts)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Adjusted EBITDA</p>
              <p className="text-xl font-bold text-emerald-400">{formatUSDC(latestReport.adjustedEBITDA)}</p>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-400">
            Period: {formatDate(latestReport.periodStart)} - {formatDate(latestReport.periodEnd)}
          </div>
        </div>
      )}

      {/* Yield Claim Error */}
      {claimError && (
        <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg text-red-400">
          {claimError}
        </div>
      )}

      {/* Yield History */}
      {yieldHistory.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-300 mb-4">Yield History</h3>
          <div className="space-y-2">
            {yieldHistory.slice(0, 5).map((claim, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-dark-bg rounded-lg"
              >
                <div>
                  <p className="font-medium text-white">Period {claim.period}</p>
                  <p className="text-xs text-gray-400">Block #{claim.blockNumber}</p>
                </div>
                <p className="font-semibold text-emerald-400">{formatUSDC(claim.amount)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
