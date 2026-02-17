// Contract addresses from environment variables
export const CONTRACTS = {
  RYEGATE_NOTES: import.meta.env.VITE_RYEGATE_NOTES_ADDRESS,
  REVENUE_ORACLE: import.meta.env.VITE_REVENUE_ORACLE_ADDRESS,
  KYC_WHITELIST: import.meta.env.VITE_KYC_WHITELIST_ADDRESS,
  USDC: import.meta.env.VITE_USDC_ADDRESS,
};

// RyegateNotes ABI fragments
export const RYEGATE_NOTES_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function balanceOfByPartition(bytes32, address) view returns (uint256)',
  'function partitionsOf(address) view returns (bytes32[])',
  'function totalSupply() view returns (uint256)',
  'function currentPeriod() view returns (uint256)',
  'function pendingYield(address) view returns (uint256)',
  'function claimYield() external',
  'function issueByPartition(bytes32 partition, address to, uint256 amount, bytes data) external',
  'function getDocument(bytes32) view returns (string, bytes32, uint256)',
  'function getAllDocuments() view returns (bytes32[])',
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function lockupStart(address, bytes32) view returns (uint256)',
  'function paused() view returns (bool)',
  'event YieldClaimed(address indexed holder, uint256 indexed period, uint256 amount)',
  'event IssuedByPartition(bytes32 indexed partition, address indexed operator, address indexed to, uint256 amount, bytes data)',
];

// KYCWhitelist ABI fragments
export const KYC_WHITELIST_ABI = [
  'function isWhitelisted(address) view returns (bool)',
  'function isAccredited(address) view returns (bool)',
];

// RevenueOracle ABI fragments
export const REVENUE_ORACLE_ABI = [
  'function getLatestReport() view returns (tuple(uint256 grossRevenue, uint256 operatingCosts, uint256 adjustedEBITDA, uint256 periodStart, uint256 periodEnd, uint256 timestamp))',
  'function getReportCount() view returns (uint256)',
];

// USDC ABI fragments
export const USDC_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
];
