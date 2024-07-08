---
sidebar_position: 9
slug: /data-mishandling
---

# Data Mishandling

## Overview

The complexity of implementing entity existence logic in Substrate often leads to mishandling of consumer, provider, and sufficient reference counts, creating vulnerabilities. For instance, overloading the consumer count of a pre-computed asset-conversion pool account can prevent that pool from being established.

:::info Explanation of Reference Counts

### Consumers

Consumers represent the number of modules that currently depend on the existence of an account. An account cannot be reaped (removed) until all consumer references are relinquished. Incrementing the consumer reference is a declaration that an account is active and depended upon, preventing its removal.

### Providers

Providers denote the number of modules that validate the existence of an account independently of consumers. An account must maintain a non-zero provider count to be considered active and prevent reaping until both providers and sufficients are zero.

### Sufficients

Sufficients refer to the number of modules that require an account's existence for their specific purposes, independent of the account holding any native balance. This count must also reach zero, along with providers, before an account can be reaped.

:::

## Details

- **Related Vulnerabilities**: [CWE-362: Concurrent Execution using Shared Resource with Improper Synchronization](https://cwe.mitre.org/data/definitions/362.html)
- **Components at Risk**: Accounts that interact with multiple pallets within the Substrate framework which depend on precise management of reference counts.

## Risks

Improper handling of reference counts can lead to:

- The inability to create or delete accounts due to frozen consumer or provider counts.
- Vulnerabilities where accounts cannot be properly managed, potentially leading to resource exhaustion and unintended permission grants.

## Mitigation

- Verify that all increments of consumer, provider, or sufficient counters in account logic are matched by corresponding decrements.
- Regularly audit the code to ensure that cleanup functions effectively decrement these counters to deactivate accounts when no longer needed.
- Effective management of consumer, provider, and sufficient reference counts is essential to maintaining the integrity and operational efficiency of blockchain networks.
- Ensuring each increment in an account's life cycle is matched with a corresponding decrement is crucial to prevent design bugs and potential system vulnerabilities.

## Additional Resources

- **Link to Official Documentation**: [Substrate Account Data Structures](https://docs.substrate.io/reference/account-data-structures/)
- **Substrate Stack Exchange**: [FRAME System Tag](https://substrate.stackexchange.com/questions/tagged/frame-system)

## Case Studies

### Asset Pallet Dependency

In the context of an hypothetical asset pallet, if an account needs to be removed (i.e. no balance), it is critical to check consumers, providers and sufficients are equal to zero. Not doing so can lead to discrepancies or errors in other pallets that depend on the account's existence.

```rust
// Hypothetical Rust snippet showing balanced reference count management
fn remove_asset_account(origin: OriginFor<T>, ...) -> DispatchResult {
    let who = ensure_signed(origin)?;
    frame_system::Pallet::<T>::dec_consumers(&who);
    ...
    if frame_system::Pallet::<T>::consumers(&who) == 0 && 
        frame_system::Pallet::<T>::providers(&who) == 0 && 
        frame_system::Pallet::<T>::sufficients(&who) == 0 {
        // Account can now be safely reaped
        ...
    }
}
```
