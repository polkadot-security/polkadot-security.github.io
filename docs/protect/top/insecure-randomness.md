---
sidebar_position: 3
slug: /insecure-randomness
---

# Insecure Randomness

On-chain randomness on any public, decentralized, and deterministic system like a blockchain is difficult. The use of weak cryptographic algorithms or insecure randomness in the system can compromise the integrity of critical functionalities, allowing attackers to predict or manipulate outcomes of features that rely on secure randomness.

## Details

- **Related Vulnerabilities**: [CWE-330: Use of Insufficiently Random Values](https://cwe.mitre.org/data/definitions/330.html)
- **Components at Risk**: Randomness generation mechanisms in pallets, specifically those utilized in environments requiring secure, unpredictable outcomes such as a Raffle in a Casino.

## Risks

The main risks include manipulation or prediction of critical functionalities, leading to compromised integrity and security. This vulnerability could potentially allow attackers to gain an unfair advantage, undermining trust in the system.

## Mitigation

The security of randomness can be enhanced by:

- Implementing trusted solutions like Oracles, Multi-Party Computation (MPC), or Commit-Reveal schemes where all validators cannot be trusted and the potential profit from exploiting randomness significantly exceeds the gains from block production.
- Using VRF where all validators can be trusted or when the profit from exploiting randomness doesn't exceeds the gains from block production.

## Additional Resources

- **Link to Official Documentation**: [Substrate Randomness](https://docs.substrate.io/build/randomness/)
- **Substrate Stack Exchange**: [Randomness Tag](https://substrate.stackexchange.com/questions/tagged/randomness)

## Case Studies

### Randomness Collective Flip

The Randomness Collective Flip pallet from Substrate offers a function that generates random values with low influence by utilizing block hashes from the previous 81 blocks. While this mechanism can defend against relatively weak adversaries, it is primarily recommended for low-security situations such as testing, not production environments.

The following code snippet demonstrates the use of block hashes to generate randomness in the Randomness Collective Flip pallet:

```rust
/// substrate/frame/insecure-randomness-collective-flip/src/lib.rs
fn on_initialize(block_number: BlockNumberFor<T>) -> Weight {
    let parent_hash = <frame_system::Pallet<T>>::parent_hash();
    /// ...
    <RandomMaterial<T>>::mutate(|ref mut values| {
        if values.try_push(parent_hash).is_err() {
            let index = block_number_to_index::<T>(block_number);
            values[index] = parent_hash;
        }
    });
    /// ...
}
/// ...
fn random(subject: &[u8]) -> (T::Hash, BlockNumberFor<T>) {
    let block_number = <frame_system::Pallet<T>>::block_number();
    let index = block_number_to_index::<T>(block_number);
    /// ...
    let hash_series = <RandomMaterial<T>>::get();
    let seed = if !hash_series.is_empty() {
        // Always the case after block 1 is initialized.
        hash_series
            .iter()
            .cycle()
            .skip(index)
          // RANDOM_MATERIAL_LEN = 81
            .take(RANDOM_MATERIAL_LEN as usize)
            .enumerate()
            .map(|(i, h)| 
              (i as i8, subject, h)
              .using_encoded(T::Hashing::hash)
          ).triplet_mix()
    } else {
        T::Hash::default()
    };
    (seed, block_number.saturating_sub(RANDOM_MATERIAL_LEN.into()))
}
```

The Randomness Collective Flip pallet is not recommended for production environments due to its susceptibility to manipulation by adversaries with significant control over block production. This can be noticed in the snippet since the randomness is generated from the last 81 blocks, which can be influenced by adversaries controlling block production.

### VRF

Polkadot employs Verifiable Random Functions (VRF) for secure blockchain randomness. VRFs provide a random number along with a proof of authenticity, ensuring the number was generated by the submitter and can be verified by any challenger.

#### Randomness Options in Babe Pallet

1. **Randomness From Two Epochs Ago**
   - **Use Case**: Needed for consensus protocols that require finality.
   - **Risks**: Potential bias from adversaries controlling block production at specific times.

2. **Randomness From One Epoch Ago** (Used in Polkadot Parachain Auctions)
   - **Use Case**: Suitable for on-chain actions that do not require finality.
   - **Risks**: Bias if adversaries control block production at the end/start of an epoch.

3. **Current Block Randomness**
   - **Use Case**: Necessary for actions requiring fresh randomness.
   - **Risks**: Weakest form, susceptible to bias if adversaries delay block announcements.

Randomness is affected by other inputs, like external randomness sources.

The following code snippet demonstrates the use of VRF in the Babe pallet:

```rust
/// substrate/frame/babe/src/lib.rs
/// Compute randomness for a new epoch. rho is the concatenation of all
/// VRF outputs in the prior epoch.
/// an optional size hint as to how many VRF outputs there were may be provided.
fn compute_randomness(
 last_epoch_randomness: BabeRandomness,
 epoch_index: u64,
 rho: impl Iterator<Item = BabeRandomness>,
 rho_size_hint: Option<usize>,
) -> BabeRandomness {
 let mut s = Vec::with_capacity(
      40 + rho_size_hint.unwrap_or(0) * RANDOMNESS_LENGTH);
 s.extend_from_slice(&last_epoch_randomness);
 s.extend_from_slice(&epoch_index.to_le_bytes());
 for vrf_output in rho {
  s.extend_from_slice(&vrf_output[..]);
 }
 sp_io::hashing::blake2_256(&s)
}
/// ...
/// Call this function exactly once when an epoch changes, to update the
/// randomness. Returns the new randomness.
fn randomness_change_epoch(next_epoch_index: u64) -> BabeRandomness {
    let this_randomness = NextRandomness::<T>::get();
    let segment_idx: u32 = SegmentIndex::<T>::mutate(|s| sp_std::mem::replace(s, 0));
    // overestimate to the segment being full.
    let rho_size = (segment_idx.saturating_add(1) * UNDER_CONSTRUCTION_SEGMENT_LENGTH) as usize;
    let next_randomness = compute_randomness(
        this_randomness,
        next_epoch_index,
        (0..segment_idx).flat_map(|i| UnderConstruction::<T>::take(&i)), // VRF (From Digest)
        Some(rho_size),
    );
    NextRandomness::<T>::put(&next_randomness);
    this_randomness // -> Randomness::<T>::put(..);
}
/// substrate/frame/babe/src/randomness.rs
impl<T: Config> RandomnessT<T::Hash, BlockNumberFor<T>> for RandomnessFromOneEpochAgo<T> {
  fn random(subject: &[u8]) -> (T::Hash, BlockNumberFor<T>) {
    let mut subject = subject.to_vec();
    subject.reserve(RANDOMNESS_LENGTH);
    subject.extend_from_slice(&NextRandomness::<T>::get()[..]); 

    (T::Hashing::hash(&subject[..]), EpochStart::<T>::get().1)
  }
}
```

The VRF implementation in Polkadot is recommended for production environments, where the profits don't exceed the gains from block production, due to its less manipulable randomness generation mechanism. The VRF implementation ensures that the randomness is generated by a trusted source and cannot be manipulated by adversaries directly.