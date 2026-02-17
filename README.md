# Ryegate Yield Engine

Phase 1: ERC-1400 Security Token + Yield Engine

Power plant tokenization platform using ERC-1400 compliant security tokens with integrated yield engine for revenue distribution.

## 🚀 Project Status

**Current Phase:** Infrastructure Setup Complete  
**Implementation Status:** In Development  
**Test Coverage:** TBD  
**Security Audit:** Not Started

## 📋 Overview

Ryegate Yield Engine is a blockchain-based platform for tokenizing power plant assets and distributing revenue to token holders. The platform uses:

- **ERC-1400** security token standard for compliant tokenization
- **KYC/Whitelist** integration for regulatory compliance
- **Revenue Oracle** for verified yield data
- **Yield Distribution** mechanism for automated revenue sharing

## 🏗️ Architecture

```
┌─────────────────┐
│  KYCWhitelist   │──┐
└─────────────────┘  │
                     │
┌─────────────────┐  │    ┌──────────────────┐
│ RevenueOracle   │──┼───▶│  RyegateNotes    │──▶ Token Transfers
└─────────────────┘  │    │   (ERC-1400)     │    (with compliance)
                     │    └──────────────────┘
                     │            │
                     └────────────┘
                              ▼
                    Yield Distribution Engine
                    (Revenue → Token Holders)
```

## 🛠️ Technology Stack

- **Smart Contracts:** Solidity 0.8.24
- **Framework:** Hardhat
- **Testing:** Chai, Hardhat Network
- **Security:** OpenZeppelin Contracts v5
- **Networks:** Polygon, Base (Mainnet & Testnets)

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/financecommander/ryegate-yield-engine.git
cd ryegate-yield-engine

# Install dependencies
npm install --legacy-peer-deps

# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env
```

## ⚙️ Configuration

Edit `.env` file with your values:

```bash
# Deployment wallet private key
DEPLOYER_PRIVATE_KEY=your_private_key_here

# Network RPC URLs
AMOY_RPC_URL=https://rpc-amoy.polygon.technology
POLYGON_RPC_URL=https://polygon-rpc.com
BASE_RPC_URL=https://mainnet.base.org

# API Keys
POLYGONSCAN_API_KEY=your_polygonscan_api_key
BASESCAN_API_KEY=your_basescan_api_key

# Oracle Configuration
ORACLE_SIGNER_ADDRESS=your_oracle_signer_address
```

## 🧪 Development

### Compile Contracts

```bash
npm run compile
```

### Run Tests

```bash
# Run all tests
npm test

# Run with gas reporting
npm run gas-report

# Generate coverage report
npm run coverage
```

### Linting

```bash
# Lint Solidity files
npm run lint
```

### Static Analysis

```bash
# Run Slither security analysis
npm run slither
```

## 🚀 Deployment

### Testnet Deployment

```bash
# Deploy to Polygon Amoy testnet
npm run deploy:amoy

# Deploy to Base Sepolia testnet
npm run deploy:base-sepolia
```

### Mainnet Deployment

```bash
# Deploy to Polygon mainnet
npm run deploy:polygon

# Deploy to Base mainnet
npm run deploy:base
```

### Verify Contracts

```bash
# Verify on block explorer
npm run verify -- --network <network> <contract-address>
```

## 📚 Documentation

- [Code Review Report](CODE_REVIEW.md) - Comprehensive code analysis
- [Security Considerations](SECURITY.md) - Security guidelines and best practices
- [ERC-1400 Standard](https://github.com/ethereum/EIPs/issues/1400) - Security token standard

## 🔒 Security

This project handles financial assets and must meet high security standards:

1. **Security Audits Required** before mainnet deployment
2. **Multi-signature wallets** for admin functions
3. **Testnet deployment** and testing mandatory
4. **Access control** for all sensitive operations
5. **Emergency pause** mechanism implemented

See [SECURITY.md](SECURITY.md) for detailed security considerations.

## 🧪 Testing

Comprehensive test coverage is required:

- ✅ Unit tests for all functions
- ✅ Integration tests for cross-contract interactions
- ✅ Security tests for access control
- ✅ Edge case and failure mode tests
- ✅ Gas optimization tests

Target: >90% code coverage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow Solidity style guide
- Write comprehensive tests
- Add NatSpec documentation
- Run linter before committing
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Disclaimer

This software is provided "as is" without warranty of any kind. Use at your own risk. Always conduct thorough testing and security audits before deploying to mainnet.

## 🔗 Links

- **Repository:** https://github.com/financecommander/ryegate-yield-engine
- **Issues:** https://github.com/financecommander/ryegate-yield-engine/issues
- **Documentation:** [Coming Soon]

## 📞 Contact

For questions or support, please open an issue on GitHub.

---

**Built with ❤️ for decentralized finance and renewable energy**
