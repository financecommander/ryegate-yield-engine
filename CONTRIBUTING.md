# Contributing to Ryegate Yield Engine

Thank you for your interest in contributing to the Ryegate Yield Engine! This document provides guidelines and instructions for contributing to this project.

## 🎯 Code of Conduct

By participating in this project, you agree to maintain a respectful and collaborative environment. We expect all contributors to:

- Be respectful and inclusive
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards other contributors

## 🚀 Getting Started

### Prerequisites

- Node.js v16 or higher
- npm v8 or higher
- Git
- Basic understanding of Solidity and Ethereum
- Familiarity with Hardhat framework

### Setup Development Environment

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/ryegate-yield-engine.git
   cd ryegate-yield-engine
   ```

2. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/financecommander/ryegate-yield-engine.git
   ```

3. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

4. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your development values
   ```

5. **Verify setup**
   ```bash
   npm run compile
   npm test
   ```

## 📝 Development Workflow

### 1. Create a Feature Branch

```bash
# Update your fork
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

#### For Smart Contracts

- Follow the Solidity Style Guide
- Add NatSpec documentation for all public functions
- Include comprehensive unit tests
- Consider gas optimization
- Run security checks

#### For Tests

- Write clear, descriptive test names
- Cover success cases, failure cases, and edge cases
- Aim for >90% code coverage
- Use descriptive error messages

#### For Documentation

- Update README.md if adding new features
- Update SECURITY.md for security-related changes
- Add inline comments for complex logic
- Update architecture diagrams if needed

### 3. Commit Your Changes

```bash
# Stage your changes
git add .

# Commit with descriptive message
git commit -m "feat: add yield distribution mechanism"
```

#### Commit Message Convention

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Examples:
```
feat: implement ERC-1400 partition transfers
fix: resolve reentrancy vulnerability in yield distribution
docs: update deployment instructions
test: add edge cases for KYC whitelist
```

### 4. Run Quality Checks

Before pushing, ensure your code passes all checks:

```bash
# Compile contracts
npm run compile

# Run tests
npm test

# Check coverage
npm run coverage

# Lint code
npm run lint

# Run security analysis (if available)
npm run slither
```

### 5. Push and Create Pull Request

```bash
# Push to your fork
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub:
1. Go to your fork on GitHub
2. Click "New Pull Request"
3. Select your feature branch
4. Fill out the PR template
5. Submit for review

## 🧪 Testing Guidelines

### Test Structure

```javascript
describe("ContractName", function () {
  let contract, owner, addr1, addr2;

  beforeEach(async function () {
    // Setup before each test
  });

  describe("Function Name", function () {
    it("should handle normal case", async function () {
      // Test normal operation
    });

    it("should revert on invalid input", async function () {
      // Test error cases
    });

    it("should handle edge cases", async function () {
      // Test boundary conditions
    });
  });
});
```

### Test Coverage Requirements

- **Minimum:** 80% overall coverage
- **Target:** 90%+ coverage
- **Critical functions:** 100% coverage

### What to Test

- ✅ All public and external functions
- ✅ Access control restrictions
- ✅ Input validation
- ✅ State changes
- ✅ Event emissions
- ✅ Error conditions
- ✅ Edge cases (zero values, max values, etc.)
- ✅ Integration between contracts

## 🔒 Security Guidelines

### Security Best Practices

1. **Follow checks-effects-interactions pattern**
   ```solidity
   function withdraw(uint256 amount) external {
       // Checks
       require(balance[msg.sender] >= amount);
       
       // Effects
       balance[msg.sender] -= amount;
       
       // Interactions
       payable(msg.sender).transfer(amount);
   }
   ```

2. **Use OpenZeppelin contracts** for standard functionality
   ```solidity
   import "@openzeppelin/contracts/access/AccessControl.sol";
   import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
   ```

3. **Validate all inputs**
   ```solidity
   require(address != address(0), "Zero address");
   require(amount > 0, "Amount must be positive");
   ```

4. **Emit events for state changes**
   ```solidity
   event Transfer(address indexed from, address indexed to, uint256 value);
   emit Transfer(from, to, amount);
   ```

5. **Add access control**
   ```solidity
   modifier onlyAdmin() {
       require(hasRole(ADMIN_ROLE, msg.sender), "Not admin");
       _;
   }
   ```

### Security Checklist

Before submitting a PR with contract changes:

- [ ] No reentrancy vulnerabilities
- [ ] Proper access control on all functions
- [ ] Input validation on all parameters
- [ ] No integer overflow/underflow (Solidity 0.8+)
- [ ] Events emitted for state changes
- [ ] Gas optimization considered
- [ ] No hardcoded addresses or values
- [ ] Error messages are descriptive
- [ ] NatSpec documentation complete

## 📐 Code Style

### Solidity Style Guide

Follow the [official Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html):

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/**
 * @title ContractName
 * @notice Brief description
 * @dev Detailed technical description
 */
contract ContractName {
    // State variables
    uint256 public constant MAX_SUPPLY = 1_000_000;
    mapping(address => uint256) private _balances;

    // Events
    event BalanceUpdated(address indexed account, uint256 newBalance);

    // Modifiers
    modifier onlyPositive(uint256 amount) {
        require(amount > 0, "Amount must be positive");
        _;
    }

    // Constructor
    constructor() {
        // Initialization
    }

    // External functions
    /**
     * @notice Updates user balance
     * @dev Emits BalanceUpdated event
     * @param account The account to update
     * @param amount The new balance amount
     */
    function updateBalance(address account, uint256 amount)
        external
        onlyPositive(amount)
    {
        _balances[account] = amount;
        emit BalanceUpdated(account, amount);
    }

    // Public functions
    
    // Internal functions
    
    // Private functions
}
```

### JavaScript/TypeScript Style

- Use 2 spaces for indentation
- Use semicolons
- Use camelCase for variables and functions
- Use PascalCase for contract instances
- Use descriptive variable names

## 🔄 Pull Request Process

### PR Checklist

Before submitting your PR, ensure:

- [ ] Code compiles without errors
- [ ] All tests pass
- [ ] Coverage meets requirements (>80%)
- [ ] Linter passes without errors
- [ ] Documentation updated
- [ ] CHANGELOG updated (if applicable)
- [ ] Security considerations addressed
- [ ] Gas optimization considered
- [ ] PR description is clear and complete

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing performed

## Security
- [ ] Security implications considered
- [ ] Access control verified
- [ ] Input validation added

## Checklist
- [ ] Code compiles
- [ ] Tests pass
- [ ] Linter passes
- [ ] Documentation updated
```

### Review Process

1. **Automated checks run** (CI/CD)
2. **Code review by maintainers**
3. **Changes requested** (if needed)
4. **Approval** after addressing feedback
5. **Merge to main branch**

## 🐛 Reporting Bugs

### Before Reporting

- Check existing issues
- Verify bug on latest version
- Reproduce consistently

### Bug Report Template

```markdown
**Description**
Clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Deploy contract X
2. Call function Y with params Z
3. Observe error

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- Node version:
- Hardhat version:
- Network:
- Solidity version:

**Additional Context**
Any other relevant information
```

## 💡 Suggesting Features

### Feature Request Template

```markdown
**Problem**
What problem does this solve?

**Proposed Solution**
How should it work?

**Alternatives Considered**
What other solutions did you consider?

**Additional Context**
Any other relevant information
```

## 📚 Resources

### Learning Resources

- [Solidity Documentation](https://docs.soliditylang.org/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [ERC-1400 Standard](https://github.com/ethereum/EIPs/issues/1400)
- [Smart Contract Security Best Practices](https://consensys.github.io/smart-contract-best-practices/)

### Tools

- [Remix IDE](https://remix.ethereum.org/) - Online Solidity IDE
- [Etherscan](https://etherscan.io/) - Blockchain explorer
- [Tenderly](https://tenderly.co/) - Smart contract monitoring
- [Slither](https://github.com/crytic/slither) - Static analyzer

## 🙏 Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation (for significant contributions)

## ❓ Questions?

- Open an issue with the `question` label
- Join our community discussions
- Review existing documentation

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Ryegate Yield Engine! 🚀
