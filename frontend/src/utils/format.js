import { TOKEN_DECIMALS } from '../config/constants';

// Format USDC amount (6 decimals) to dollar string
export function formatUSDC(amount) {
  if (!amount) return '$0.00';
  try {
    const value = Number(amount) / Math.pow(10, TOKEN_DECIMALS);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch (error) {
    return '$0.00';
  }
}

// Format Ethereum address to truncated form
export function formatAddress(address) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Format Unix timestamp to readable date
export function formatDate(timestamp) {
  if (!timestamp) return '';
  try {
    const date = new Date(Number(timestamp) * 1000);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch (error) {
    return '';
  }
}

// Format partition bytes32 to readable name
export function formatPartitionName(bytes32, partitionNames) {
  return partitionNames[bytes32] || bytes32.slice(0, 10) + '...';
}

// Parse dollar string to USDC amount (6 decimals)
export function parseUSDC(dollarString) {
  try {
    const cleaned = dollarString.replace(/[$,]/g, '');
    const value = parseFloat(cleaned);
    if (isNaN(value)) return BigInt(0);
    return BigInt(Math.floor(value * Math.pow(10, TOKEN_DECIMALS)));
  } catch (error) {
    return BigInt(0);
  }
}

// Format percentage
export function formatPercent(value) {
  if (!value) return '0%';
  return `${(Number(value) * 100).toFixed(2)}%`;
}

// Format large numbers with K/M suffix
export function formatCompact(value) {
  if (!value) return '0';
  const num = Number(value);
  if (num >= 1_000_000) {
    return `$${(num / 1_000_000).toFixed(2)}M`;
  }
  if (num >= 1_000) {
    return `$${(num / 1_000).toFixed(1)}K`;
  }
  return `$${num.toFixed(0)}`;
}
