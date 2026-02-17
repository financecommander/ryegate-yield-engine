import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '../context/WalletContext';
import { useContract } from './useContract';
import { CONTRACTS, RYEGATE_NOTES_ABI, REVENUE_ORACLE_ABI } from '../config/contracts';
import { TOKEN_DECIMALS } from '../config/constants';

export function useYield() {
  const { address, isConnected } = useWallet();
  const { contract: notesContract } = useContract(CONTRACTS.RYEGATE_NOTES, RYEGATE_NOTES_ABI);
  const { contract: oracleContract } = useContract(CONTRACTS.REVENUE_ORACLE, REVENUE_ORACLE_ABI);

  const [pendingYield, setPendingYield] = useState(BigInt(0));
  const [currentPeriod, setCurrentPeriod] = useState(0);
  const [totalSupply, setTotalSupply] = useState(BigInt(0));
  const [latestReport, setLatestReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchYieldData = useCallback(async () => {
    if (!notesContract || !oracleContract) return;

    try {
      setLoading(true);
      const promises = [];

      // Fetch current period and total supply
      promises.push(notesContract.currentPeriod());
      promises.push(notesContract.totalSupply());

      // Fetch pending yield if connected
      if (isConnected && address) {
        promises.push(notesContract.pendingYield(address));
      } else {
        promises.push(Promise.resolve(BigInt(0)));
      }

      // Fetch latest oracle report
      try {
        promises.push(oracleContract.getLatestReport());
      } catch {
        promises.push(Promise.resolve(null));
      }

      const [period, supply, yield_, report] = await Promise.all(promises);

      setCurrentPeriod(Number(period));
      setTotalSupply(supply);
      setPendingYield(yield_);
      
      if (report) {
        setLatestReport({
          grossRevenue: report[0],
          operatingCosts: report[1],
          adjustedEBITDA: report[2],
          periodStart: report[3],
          periodEnd: report[4],
          timestamp: report[5],
        });
      }
    } catch (error) {
      console.error('Error fetching yield data:', error);
    } finally {
      setLoading(false);
    }
  }, [notesContract, oracleContract, address, isConnected]);

  // Initial fetch
  useEffect(() => {
    fetchYieldData();
  }, [fetchYieldData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchYieldData, 30000);
    return () => clearInterval(interval);
  }, [fetchYieldData]);

  return {
    pendingYield,
    currentPeriod,
    totalSupply,
    latestReport,
    loading,
    refresh: fetchYieldData,
  };
}
