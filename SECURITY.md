# Security Policy

## Overview

The Ryegate Yield Engine is an institutional-grade security token platform built on Polygon for power plant revenue tokenization. Security is our highest priority.

## Supported Versions

| Version | Supported          | Network        |
| ------- | ------------------ | -------------- |
| 1.0.x   | :white_check_mark: | Polygon Mainnet |
| 0.x.x   | :x:                | Testnet only   |

## Security Architecture

### Smart Contract Security

#### Access Control
- **Multi-signature Wallet**: All critical admin functions require multisig approval (3-of-5)
- **Role-Based Access Control (RBAC)**: OpenZeppelin AccessControl for granular permissions
- **Time-locks**: 24-hour delay for critical parameter changes
- **Emergency Pause**: Circuit breaker pattern for incident response

#### Roles and Permissions

| Role | Contracts | Capabilities |
|------|-----------|--------------|
| `DEFAULT_ADMIN_ROLE` | All | Grant/revoke roles, update critical parameters |
| `OPERATOR_ROLE` | RyegateNotes | Issue/redeem tokens, manage partitions |
| `ORACLE_ROLE` | RevenueOracle | Push revenue reports |
| `COMPLIANCE_ROLE` | KYCWhitelist | Add/remove investors, update accreditation status |

#### Audit Trail
- All state changes emit events
- Immutable revenue report history on-chain
- ERC-1643 document management with content hashes

### Compliance & KYC

- **KYC/AML Integration**: Investor addresses must be whitelisted
- **Accreditation Verification**: REG_D partition requires accredited investor status
- **Transfer Restrictions**: 
  - REG_D: 12-month lockup period
  - REG_A_PLUS: No lockup, non-accredited allowed
- **Document Management**: ERC-1643 for disclosure requirements

### Oracle Security

- **Trusted Signer**: Revenue reports require ORACLE_ROLE signature
- **Duplicate Prevention**: Cannot push same period twice
- **Data Validation**: EBITDA ≤ Revenue, Distribute Amount ≤ EBITDA
- **Retry Logic**: Exponential backoff (1s, 3s, 9s) for transient failures
- **Monitoring**: Slack notifications on errors

## Vulnerability Disclosure

### Reporting a Vulnerability

We take all security reports seriously. If you discover a vulnerability:

**DO:**
- Email: security@ryegate.io (PGP key available on request)
- Include detailed steps to reproduce
- Allow 90 days for responsible disclosure before public announcement
- Encrypt sensitive information

**DO NOT:**
- Exploit the vulnerability beyond proof-of-concept
- Access user data or funds
- Publicly disclose before coordinated release

### Response Timeline

| Stage | Timeline |
|-------|----------|
| Acknowledgment | Within 24 hours |
| Initial assessment | Within 72 hours |
| Fix development | 1-2 weeks (critical), 2-4 weeks (high) |
| Deployment | Based on severity |
| Public disclosure | After fix deployed + 7 days |

### Bug Bounty Program

- **Critical** (contract takeover, fund theft): Up to $50,000
- **High** (privilege escalation, oracle manipulation): Up to $10,000
- **Medium** (DoS, incorrect calculations): Up to $2,500
- **Low** (informational, gas optimization): Up to $500

Rewards determined by severity (CVSS 3.1), impact, and quality of report.

## Security Measures Implemented

### Smart Contracts

- [x] OpenZeppelin battle-tested libraries (v5.0.0)
- [x] Reentrancy protection (ReentrancyGuard)
- [x] Integer overflow protection (Solidity 0.8.24 built-in)
- [x] Comprehensive test coverage (>95%)
- [x] Slither static analysis
- [x] Formal verification (key functions)
- [x] External audit by [Audit Firm] (report: [link])

### Infrastructure

- [x] Multi-signature wallet for admin operations
- [x] Contract upgrade mechanism (only if needed, via governance)
- [x] Rate limiting on oracle submissions
- [x] Monitoring and alerting (Tenderly, OpenZeppelin Defender)
- [x] Front-running protection (commit-reveal for sensitive operations)

### Development Practices

- [x] CI/CD with automated testing
- [x] Code review requirement (2 approvals minimum)
- [x] Dependency scanning (Dependabot)
- [x] Secret management (Google Secret Manager, no .env in repos)
- [x] Testnet deployment before mainnet
- [x] Incident response playbook

## Emergency Procedures

### Pause Protocol

If a critical vulnerability is discovered:

1. **Immediate**: Call `pause()` on affected contracts (multisig or designated emergency role)
2. **Notify**: Alert investors via email, website banner, social media
3. **Investigate**: Assess scope, impact, affected users
4. **Fix**: Develop and test patch
5. **Deploy**: Upgrade contracts (if upgradeable) or migrate (if not)
6. **Resume**: Call `unpause()` after verification
7. **Post-mortem**: Publish incident report within 7 days

### Contact Information

- **Security Team**: security@ryegate.io
- **Emergency Hotline**: +1-XXX-XXX-XXXX (24/7)
- **Status Page**: https://status.ryegate.io
- **Incident Updates**: https://twitter.com/RyegateYield

## Audits

| Auditor | Date | Report | Status |
|---------|------|--------|--------|
| [To be scheduled] | Q2 2024 | [Link TBD] | Pending |

## Insurance

- **Smart Contract Coverage**: $X million policy via [Nexus Mutual / InsurAce]
- **Custodial Insurance**: USDC holdings insured via institutional custody partner

## Responsible Disclosure Examples

Good report:
```
Subject: [CRITICAL] Reentrancy in claimYield() function

Description: The claimYield() function in RyegateNotes.sol updates balance 
after external call to USDC.transfer(), allowing reentrancy attack.

Steps to reproduce:
1. Deploy malicious contract with fallback function
2. Call claimYield() from malicious contract
3. Re-enter claimYield() during USDC transfer
4. Drain yield pool

Proof of concept: [Gist link]

Suggested fix: Move balance update before external call (checks-effects-interactions)
```

## Additional Resources

- [Technical Documentation](https://docs.ryegate.io)
- [Smart Contract Addresses](https://docs.ryegate.io/contracts)
- [Security Best Practices](https://docs.ryegate.io/security)
- [Investor FAQ](https://docs.ryegate.io/faq)

---

**Last Updated**: 2024-01-15  
**Version**: 1.0
