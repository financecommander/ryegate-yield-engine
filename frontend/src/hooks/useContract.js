import { useMemo } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../context/WalletContext';

export function useContract(address, abi) {
  const { provider, signer } = useWallet();

  const contract = useMemo(() => {
    if (!address || !abi || !provider) return null;
    return new ethers.Contract(address, abi, provider);
  }, [address, abi, provider]);

  const contractWithSigner = useMemo(() => {
    if (!address || !abi || !signer) return null;
    return new ethers.Contract(address, abi, signer);
  }, [address, abi, signer]);

  return { contract, contractWithSigner };
}
