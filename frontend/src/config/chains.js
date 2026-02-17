export const CHAINS = {
  80002: {
    chainId: '0x13882',
    chainName: 'Polygon Amoy Testnet',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: ['https://rpc-amoy.polygon.technology'],
    blockExplorerUrls: ['https://amoy.polygonscan.com'],
  },
  137: {
    chainId: '0x89',
    chainName: 'Polygon Mainnet',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: ['https://polygon-rpc.com'],
    blockExplorerUrls: ['https://polygonscan.com'],
  },
};

export const getChainConfig = (chainId) => {
  return CHAINS[chainId] || CHAINS[80002];
};

export const SUPPORTED_CHAIN_IDS = [80002, 137];
