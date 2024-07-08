---
sidebar_position: 7
slug: /replay-issues
---

# Replay Issues

Replay issues, most commonly arising from unsigned extrinsics, can lead to spamming and, in certain scenarios, double-spending attacks. This often occurs when nonces are not managed correctly, enabling transactions to be replayed.

## Details

- **Related Vulnerabilities**: [CWE-294: Authentication Bypass by Capture-replay](https://cwe.mitre.org/data/definitions/294.html)
- **Components at Risk**: Transaction handling mechanisms in blockchain systems, specifically those that do not effectively use nonce management or signature verification.

## Risks

The primary risks include:

- Spamming the network with repeated transactions, leading to congestion and reduced performance.
- Potential for double-spending attacks, which can significantly compromise the integrity of the blockchain.

## Mitigation

To mitigate replay issues effectively:

- Implement a robust nonces mechanism to ensure that each transaction is unique and cannot be replayed.
- Verify the authenticity and intended destination of the data your system receives by checking identifiers such as IDs, hashes, and chain-specific details.

## Additional Resources

- **Link to Official Documentation**: [Substrate Transaction Format](https://docs.substrate.io/reference/transaction-format/)

## Case Studies

### Frontier STF

The [CVE-2021-41138](https://github.com/paritytech/frontier/security/advisories/GHSA-vj62-g63v-f8mf) details security issues that arose from changes made in [Frontier #482](https://github.com/paritytech/frontier/pull/482). Initially, the function `validate_unsigned` was used to verify transaction validity within the **State Transition Function** (STF), which is crucial during block production. After the update, a new function, `validate_self_contained`, was introduced but not integrated into the STF. This oversight allowed malicious validators to submit invalid transactions or reuse transactions from different chains.

The following code snippet demonstrates the vulnerability in the Frontier STF:

```rust
fn on_initialize(_: T::BlockNumber) -> Weight {
  Pending::<T>::kill();
  // If the digest contain an existing ethereum block(encoded as PreLog), If contains,
  // execute the imported block firstly and disable transact dispatch function.
  if let Ok(log) = fp_consensus::find_pre_log(&frame_system::Pallet::<T>::digest()) {
    let PreLog::Block(block) = log;
    for transaction in block.transactions {
      let source = Self::recover_signer(&transaction).expect(
        "pre-block transaction signature invalid; the block cannot be built",
      );

      Self::do_transact(source, transaction).expect(
        "pre-block transaction verification failed; the block cannot be built",
      );
    }
  }

  0
}
```

In this case, before the `do_transact` function, a more secure and comprehensive function that validates and executes transactions should have been added. This oversight allowed malicious actors to exploit the system by replaying transactions from other chains.

The issue was resolved by integrating the `validate_transaction_common` function into the STF (called by `validate_transaction_in_block`), ensuring that all transactions are verified and executed correctly.

```rust
fn on_initialize(_: T::BlockNumber) -> Weight {
  Pending::<T>::kill();
  // If the digest contain an existing ethereum block(encoded as PreLog), If contains,
  // execute the imported block firstly and disable transact dispatch function.
  if let Ok(log) = fp_consensus::find_pre_log(&frame_system::Pallet::<T>::digest()) {
    let PreLog::Block(block) = log;
    for transaction in block.transactions {
      let source = Self::recover_signer(&transaction).expect(
        "pre-block transaction signature invalid; the block cannot be built",
      );

      Self::validate_transaction_in_block(source, &transaction).expect(
        "pre-block transaction verification failed; the block cannot be built",
      );
      Self::apply_validated_transaction(source, transaction).expect( // do_transact
        "pre-block transaction execution failed; the block cannot be built",
      );
    }
  }

  0
}

// Common controls to be performed in the same way by the pool and the
// State Transition Function (STF).
// This is the case for all controls except those concerning the nonce.
fn validate_transaction_common(
  origin: H160,
  transaction: &Transaction,
) -> Result<U256, TransactionValidityError> {
  // ...
  if let Some(chain_id) = transaction.signature.chain_id() {
    if chain_id != T::ChainId::get() {
      return Err(InvalidTransaction::Custom(
        TransactionValidationError::InvalidChainId as u8,
      )
      .into());
    }
  }
  // ...
}
```
