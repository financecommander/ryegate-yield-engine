import { ethers } from 'ethers';

// Partition hashes (keccak256 of partition names)
export const REG_D = ethers.keccak256(ethers.toUtf8Bytes('REG_D'));
export const REG_A_PLUS = ethers.keccak256(ethers.toUtf8Bytes('REG_A_PLUS'));

export const PARTITION_NAMES = {
  [REG_D]: 'Reg D (Accredited)',
  [REG_A_PLUS]: 'Reg A+ (Retail)',
};

export const LOCKUP_DAYS = 365;
export const FIXED_RATE = '8.5%';
export const KICKER_RATE = '25%';
export const TOKEN_DECIMALS = 6;
export const MIN_INVESTMENT_REG_D = 25000; // $25,000
export const MIN_INVESTMENT_REG_A = 100; // $100
