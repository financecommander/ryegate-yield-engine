import React, { useState, useEffect } from 'react';
import { Shield, AlertCircle, Info } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useContract } from '../hooks/useContract';
import { CONTRACTS, RYEGATE_NOTES_ABI, KYC_WHITELIST_ABI

, USDC_ABI } from '../config/contracts';
import { REG_D, REG_A_PLUS, MIN_INVESTMENT_REG_D, MIN_INVESTMENT_REG_A, LOCKUP_DAYS, FIXED_RATE, KICKER_RATE } from '../config/constants';
import { parseUSDC, formatUSDC } from '../utils/format';
import { parseError } from '../utils/errors';
import PartitionBadge from '../components/PartitionBadge';
import TransactionStatus from '../components/TransactionStatus';
import ConnectWallet from '../components/ConnectWallet';
import { ethers } from 'ethers';

export default function Subscribe() {
  const { address, isConnected } = useWallet();
  const { contract: notesContract, contractWithSigner: notesWithSigner } = useContract(CONTRACTS.RYEGATE_NOTES, RYEGATE_NOTES_ABI);
  const { contract: kycContract } = useContract(CONTRACTS.KYC_WHITELIST, KYC_WHITELIST_ABI);
  const { contract: usdcContract, contractWithSigner: usdcWithSigner } = useContract(CONTRACTS.USDC, USDC_ABI);

  const [isWhitelisted, setIsWhitelisted] = useState(false);
  const [isAccredited, setIsAccredited] = useState(false);
  const [selectedPartition, setSelectedPartition] = useState(REG_D);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [txStatus, setTxStatus] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [error, setError] = useState(null);
  const [usdcBalance, setUsdcBalance] = useState(BigInt(0));
  const [paused, setPaused] = useState(false);

  // Fetch KYC status
  useEffect(() => {
    const fetchKYCStatus = async () => {
      if (!kycContract || !address) return;

      try {
        const [whitelisted, accredited] = await Promise.all([
          kycContract.isWhitelisted(address),
          kycContract.isAccredited(address),
        ]);
        setIsWhitelisted(whitelisted);
        setIsAccredited(accredited);

        // Default to REG_A_PLUS if not accredited
        if (!accredited) {
          setSelectedPartition(REG_A_PLUS);
        }
      } catch (err) {
        console.error('Error fetching KYC status:', err);
      }
    };

    fetchKYCStatus();
  }, [kycContract, address]);

  // Fetch USDC balance and paused status
  useEffect(() => {
    const fetchData = async () => {
      if (!usdcContract || !notesContract || !address) return;

      try {
        const [balance, isPaused] = await Promise.all([
          usdcContract.balanceOf(address),
          notesContract.paused(),
        ]);
        setUsdcBalance(balance);
        setPaused(isPaused);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, [usdcContract, notesContract, address]);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!notesWithSigner || !usdcWithSigner || !address) return;

    try {
      setLoading(true);
      setError(null);
      setTxStatus('pending');
      setTxHash(null);

      const amountWei = parseUSDC(amount);

      // Check minimum investment
      const minInvestment = selectedPartition === REG_D ? MIN_INVESTMENT_REG_D : MIN_INVESTMENT_REG_A;
      if (Number(amountWei) < minInvestment * 1_000_000) {
        throw new Error(`Minimum investment is $${minInvestment.toLocaleString()}`);
      }

      // Check USDC balance
      if (amountWei > usdcBalance) {
        throw new Error('Insufficient USDC balance');
      }

      // Approve USDC spend
      const allowance = await usdcContract.allowance(address, CONTRACTS.RYEGATE_NOTES);
      if (allowance < amountWei) {
        const approveTx = await usdcWithSigner.approve(CONTRACTS.RYEGATE_NOTES, amountWei);
        await approveTx.wait();
      }

      // Issue tokens
      const tx = await notesWithSigner.issueByPartition(
        selectedPartition,
        address,
        amountWei,
        '0x'
      );

      setTxHash(tx.hash);
      const receipt = await tx.wait();

      setTxStatus('success');
      setAmount('');

      // Refresh balances
      setTimeout(async () => {
        const newBalance = await usdcContract.balanceOf(address);
        setUsdcBalance(newBalance);
      }, 2000);

    } catch (err) {
      console.error('Subscribe error:', err);
      setError(parseError(err));
      setTxStatus('error');
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center card max-w-md">
          <h2 className="text-2xl font-bold text-white mb-4">Subscribe to Ryegate Notes</h2>
          <p className="text-gray-400 mb-6">
            Connect your wallet to subscribe to Ryegate security tokens.
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
          <AlertCircle className="w-16 h-16 text-amber-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-amber-400 mb-4">KYC Verification Required</h2>
          <p className="text-gray-400 mb-4">
            Before investing, you must complete KYC/AML verification through our registered broker-dealer.
          </p>
          <div className="p-4 bg-dark-bg rounded-lg text-left">
            <p className="text-sm text-gray-400 mb-2">Contact Information:</p>
            <p className="text-white">Email: compliance@ryegate.example.com</p>
            <p className="text-white">Phone: +1 (555) 123-4567</p>
          </div>
        </div>
      </div>
    );
  }

  if (paused) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center card max-w-md border-amber-600">
          <AlertCircle className="w-16 h-16 text-amber-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-amber-400 mb-4">Offering Paused</h2>
          <p className="text-gray-400">
            Token issuance is currently paused. Please check back later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          <Shield className="w-8 h-8 text-emerald-500" />
          <div>
            <h2 className="text-2xl font-bold text-white">Subscribe to Ryegate Notes</h2>
            <p className="text-gray-400">Institutional-grade power plant investment</p>
          </div>
        </div>

        <form onSubmit={handleSubscribe} className="space-y-6">
          {/* Partition Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">
              Investment Type
            </label>
            <div className="space-y-3">
              <button
                type="button"
                disabled={!isAccredited}
                onClick={() => setSelectedPartition(REG_D)}
                className={`w-full p-4 rounded-lg border-2 transition ${
                  selectedPartition === REG_D
                    ? 'border-blue-600 bg-blue-900/20'
                    : 'border-dark-border bg-dark-bg hover:border-blue-600/50'
                } ${!isAccredited && 'opacity-50 cursor-not-allowed'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <PartitionBadge partition={REG_D} />
                    <div className="text-left">
                      <p className="font-semibold text-white">Regulation D (506c)</p>
                      <p className="text-sm text-gray-400">Accredited investors only</p>
                    </div>
                  </div>
                  {!isAccredited && (
                    <span className="text-xs text-amber-400">Not Available</span>
                  )}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPartition(REG_A_PLUS)}
                className={`w-full p-4 rounded-lg border-2 transition ${
                  selectedPartition === REG_A_PLUS
                    ? 'border-green-600 bg-green-900/20'
                    : 'border-dark-border bg-dark-bg hover:border-green-600/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <PartitionBadge partition={REG_A_PLUS} />
                    <div className="text-left">
                      <p className="font-semibold text-white">Regulation A+</p>
                      <p className="text-sm text-gray-400">All investors (coming soon)</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">Coming Soon</span>
                </div>
              </button>
            </div>
          </div>

          {/* Investment Amount */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Investment Amount (USD)
            </label>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Minimum: $${(selectedPartition === REG_D ? MIN_INVESTMENT_REG_D : MIN_INVESTMENT_REG_A).toLocaleString()}`}
              className="input w-full text-lg"
              required
            />
            <p className="mt-2 text-sm text-gray-400">
              Your USDC Balance: {formatUSDC(usdcBalance)}
            </p>
          </div>

          {/* Terms & Info */}
          <div className="p-4 bg-emerald-900/10 border border-emerald-700/30 rounded-lg space-y-3">
            <div className="flex items-start space-x-2">
              <Info className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-300">
                <p className="font-semibold mb-2">Investment Terms:</p>
                <ul className="space-y-1 text-gray-400">
                  <li>• Fixed yield: {FIXED_RATE} annual rate</li>
                  <li>• EBITDA kicker: {KICKER_RATE} of quarterly adjusted EBITDA</li>
                  <li>• Quarterly distributions in USDC</li>
                  {selectedPartition === REG_D && (
                    <li>• Lockup period: {LOCKUP_DAYS} days from issuance</li>
                  )}
                  <li>• Backed by 30-year PPA with investment-grade offtaker</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !amount || selectedPartition === REG_A_PLUS}
            className="btn-primary w-full py-3 text-lg"
          >
            {loading ? 'Processing...' : 'Subscribe Now'}
          </button>

          {/* Disclaimer */}
          <p className="text-xs text-gray-500 text-center">
            Note: In production, subscriptions are processed through our broker-dealer. 
            This is a direct mint for testnet demonstration purposes only.
          </p>
        </form>

        <TransactionStatus txHash={txHash} status={txStatus} error={error} />
      </div>
    </div>
  );
}
