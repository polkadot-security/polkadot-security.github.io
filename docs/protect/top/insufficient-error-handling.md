---
sidebar_position: 10
slug: /insufficient-error-handling
---

# Inconsistent Error Handling

Errors and exceptions need to be handled consistently to avoid creating attack vectors in critical parts of the system. In scenarios where processing a collection of items involves handling one or more failures, the entire batch could fail. This situation can be exploited by an attacker aiming to block execution, especially if the processing is occurring in a privileged extrinsic like a hook.

## Details

- **Related Vulnerabilities**: [CWE-703: Improper Check or Handling of Exceptional Conditions](https://cwe.mitre.org/data/definitions/703.html)
- **Components at Risk**: System components that handle batches of operations, particularly those in privileged extrinsics which may be susceptible to Denial of Service (DoS) attacks if error handling is inconsistent.

## Risks

The primary risks include:

- Privileged extrinsics being susceptible to Denial of Service (DoS) attacks.
- Unexpected behavior in the system due to inconsistent handling of operations that encounter errors.

## Mitigation

To mitigate the risks associated with inconsistent error handling:

- Ensure that error handling is uniformly implemented according to the logic of each extrinsic.
- For batch processing:
  - If it is critical that all items must be processed, propagate errors directly to stop batch processing immediately upon failure.
  - If processing can continue despite some items failing, handle the error locally within the batch and continue processing the rest of the items.

## Additional Resources

- **Link to Official Documentation**: [Substrate Events and Errors](https://docs.substrate.io/build/events-and-errors/)
- **Link to Official Documentation**: [Substrate Maintain Errors](https://wiki.polkadot.network/docs/maintain-errors)

## Case Studies

### Decode Concatenated Data

During the decoding of concatenated extrinsics, a failure in decoding one extrinsic led to the failure of the entire batch, potentially causing a system halt if executed within a critical context.

```rust
fn decode_concatenated_extrinsics(
  data: &mut &[u8],
) -> Result<Vec<<T as Config>::RuntimeCall>, ()> {
  let mut decoded_extrinsics = Vec::new();
  while !data.is_empty() {
    let extrinsic =
      <T as Config>::RuntimeCall::decode_with_depth_limit(
        sp_api::MAX_EXTRINSIC_DEPTH, 
        data
      ).map_err(|_| ())?;
    decoded_extrinsics.push(extrinsic);
  }
  Ok(decoded_extrinsics)
}
```

The revised approach involves handling errors within the loop, allowing the processing of subsequent extrinsics in the batch even if one fails, thus preventing a complete halt of the batch processing.

```rust
fn decode_concatenated_extrinsics(
  data: &mut &[u8],
) -> Result<Vec<<T as Config>::RuntimeCall>, ()> {
  let mut decoded_extrinsics = Vec::new();
  while !data.is_empty() {
    if let Ok(extrinsic) =
      <T as Config>::RuntimeCall::decode_with_depth_limit(
        sp_api::MAX_EXTRINSIC_DEPTH, 
        data
      ) {
        decoded_extrinsics.push(extrinsic);
    } else {
      /// Handle corrupted extrinsic...
    } 
  }
  Ok(decoded_extrinsics)
}
```
