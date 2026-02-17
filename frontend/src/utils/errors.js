// Map contract error messages to user-friendly text
const ERROR_MESSAGES = {
  'RYG: holder not KYC\'d': 'Please complete KYC verification with our broker-dealer before investing.',
  'RYG: not accredited for Reg D': 'Reg D notes require accredited investor status.',
  'RYG: Reg D lockup active': 'Your tokens are in a 12-month lockup period.',
  'RYG: exceeds max supply': 'The offering is fully subscribed.',
  'RYG: no yield to claim': 'No yield available to claim at this time.',
  'RYG: no balance': 'You don\'t hold any Ryegate Notes.',
  'RYG: paused': 'Trading is currently paused.',
  'user rejected transaction': 'Transaction was rejected by user.',
  'insufficient funds': 'Insufficient funds to complete this transaction.',
  'execution reverted': 'Transaction failed. Please check the details and try again.',
};

export function parseError(error) {
  if (!error) return 'An unknown error occurred.';
  
  const errorString = error.message || error.toString();
  
  // Check for known error messages
  for (const [key, message] of Object.entries(ERROR_MESSAGES)) {
    if (errorString.toLowerCase().includes(key.toLowerCase())) {
      return message;
    }
  }
  
  // Check for revert reason
  const revertMatch = errorString.match(/reverted with reason string '(.+?)'/);
  if (revertMatch && revertMatch[1]) {
    return ERROR_MESSAGES[revertMatch[1]] || revertMatch[1];
  }
  
  // Default error message
  return 'Transaction failed. Please try again.';
}

export function getErrorType(error) {
  if (!error) return 'unknown';
  
  const errorString = error.message || error.toString();
  
  if (errorString.includes('user rejected')) return 'rejected';
  if (errorString.includes('insufficient funds')) return 'insufficient_funds';
  if (errorString.includes('not KYC')) return 'kyc_required';
  if (errorString.includes('not accredited')) return 'accreditation_required';
  if (errorString.includes('lockup active')) return 'lockup';
  
  return 'contract_error';
}
