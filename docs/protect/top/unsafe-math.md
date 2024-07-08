---
sidebar_position: 4
slug: /unsafe-math
---

# Unsafe Math

Incorrect arithmetic operations in the codebase can lead to integer overflows/underflows, divisions by zero, conversion truncation/overflow, and incorrect end results. These issues can be exploited by attackers to manipulate calculations and gain an unfair advantage, primarily involving the use of primitive arithmetic operations.

## Details

- **Related Vulnerabilities**: [CWE-682: Incorrect Calculation](https://cwe.mitre.org/data/definitions/682.html)
- **Components at Risk**: Any part of the blockchain system that uses arithmetic calculations for managing balances, transaction fees, or any other quantitative attributes.

## Risks

The primary risks include:

- Manipulation of account balances, leading to unauthorized transfers or artificial inflation of balances.
- Potential disruption of network functionalities that rely on accurate arithmetic calculations.
- Incorrect calculations, leading to unintended consequences such as incorrect account balances or transaction fees.
- Potential for attackers to exploit the vulnerability to manipulate outcomes in their favor.

## Mitigation

To address the issues related to unsafe math operations:

- **Arithmetic**: Use checked or saturated functions like `checked_div` to prevent overflows and ensure safe arithmetic operations.
- **Conversions**: Avoid downcasting values. When necessary, use methods like `unique_saturated_into` instead of `low_u64` to ensure safe conversions. Design systems to avoid the need for downcasting.

## Additional Resources

- **Link to Official Documentation**: [Substrate Helper Functions](https://docs.substrate.io/reference/how-to-guides/basics/use-helper-functions/)
- **Useful Substrate Crates**: [sp-arithmetic](https://crates.parity.io/sp_arithmetic/index.html)

## Case Studies

### Frontier Balances

#### Description

Frontier's [CVE-2022-31111](https://github.com/paritytech/frontier/security/advisories/GHSA-hc8w-mx86-9fcj) describes issues in converting balances from EVM to Substrate. The pallet did not properly handle conversions, causing the transferred amount to appear differently, which could lead to a possible overflow.

#### Issue

```rust
/// substrate/frame/evm/src/lib.rs
#[pallet::genesis_build]
impl<T: Config> GenesisBuild<T> for GenesisConfig {
    fn build(&self) {
        for (address, account) in &self.accounts {
            let account_id = T::AddressMapping::into_account_id(*address);

            // ASSUME: in one single EVM transaction, the nonce will not increase more than
            // `u128::max_value()`.
            for _ in 0..account.nonce.low_u128() {
                frame_system::Pallet::<T>::inc_account_nonce(&account_id);
            }

            T::Currency::deposit_creating(
                &account_id,
                account.balance.low_u128().unique_saturated_into(),
            );
        }
    }
}
```

#### Solution

```rust
/// substrate/frame/evm/src/lib.rs
#[pallet::genesis_build]
impl<T: Config> GenesisBuild<T> for GenesisConfig
where
    U256: UniqueSaturatedInto<BalanceOf<T>>,
{
    fn build(&self) {
        const MAX_ACCOUNT_NONCE: usize = 100;

        for (address, account) in &self.accounts {
            let account_id = T::AddressMapping::into_account_id(*address);

            // ASSUME: in one single EVM transaction, the nonce will not increase more than
            // `u128::max_value()`.
            for _ in 0..min(
                MAX_ACCOUNT_NONCE,
                UniqueSaturatedInto::<usize>::unique_saturated_into(account.nonce),
            ) {
                frame_system::Pallet::<T>::inc_account_nonce(&account_id);
            }

            T::Currency::deposit_creating(
                &account_id, 
                account.balance.unique_saturated_into()
            );
        }
    }
}
```
