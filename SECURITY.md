# Security

## Audit Status
- [ ] Internal review complete
- [ ] Slither static analysis: 0 high/medium findings
- [ ] MythX deep analysis scheduled
- [ ] External audit (firm TBD)

## Architecture Security
- All state-changing functions use AccessControl roles
- Yield claims protected by ReentrancyGuard
- Transfer restrictions enforced at contract level (not frontend)
- Oracle data validated on-chain (EBITDA <= revenue, valid periods)
- Pull-based yield prevents gas griefing attacks
- 12-month REG_D lockup enforced in contract, not by convention

## Key Roles
| Role | Purpose | Holder |
|------|---------|--------|
| DEFAULT_ADMIN_ROLE | Pause, role mgmt, config | Multisig |
| ISSUER_ROLE | Mint tokens | Broker-dealer |
| OPERATOR_ROLE | Forced transfers | Compliance |
| DISTRIBUTOR_ROLE | Yield distribution | Admin/automated |
| ORACLE_ROLE | Revenue reporting | GCF wallet |
| KYC_ADMIN_ROLE | Whitelist mgmt | Broker-dealer |

## Reporting Vulnerabilities
Email: security@ryegateyield.com
Do NOT open public issues for security vulnerabilities.

## Emergency Procedures
1. Call pause() from admin multisig
2. Assess impact
3. Deploy fix or use operator functions for compliance actions
4. Unpause after resolution
