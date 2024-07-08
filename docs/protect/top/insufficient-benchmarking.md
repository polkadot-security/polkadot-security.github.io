---
sidebar_position: 1
slug: /insecure-benchmarking
---

# Insufficient Benchmarking

Benchmarking can be a difficult task. Incorrect or missing benchmarking can lead to overweight blocks, causing network congestion and affecting the overall performance of the blockchain. This typically occurs when the computational complexity or storage access is underestimated, resulting in inaccurately assigned weights for extrinsics.

## Details

- **Related Vulnerabilities**: [CWE-400: Uncontrolled Resource Consumption](https://cwe.mitre.org/data/definitions/400.html)
- **Components at Risk**: Blockchain network operations, particularly those involving transaction processing and block creation.

## Risks

The risks associated with insufficient benchmarking include:

- **Overweight extrinsics** which can slow down the network, leading to delays in transaction processing and negatively affecting user experience.
- **Underweight extrinsics** which can be exploited to spam the network, potentially leading to a Denial of Service (DoS) attack.

## Mitigation

To address the challenges of insufficient benchmarking:

- Run benchmarks under worst-case scenario conditions to ensure the runtime remains safe and maximizes throughput. This might include simulating the maximum possible amount of database reads and writes that could occur within an extrinsic.
- The primary goal of benchmarking should always be to keep the runtime safe, while the secondary goal is to achieve accuracy in weight calculations to optimize network throughput.
- For code that does not meet hard deadlines, consider using techniques like **metering** to measure and control resource use dynamically.

## Additional Resources

- **Link to Official Documentation**: [Substrate Benchmark](https://docs.substrate.io/test/benchmark/)
- **Substrate Stack Exchange**: [Benchmark Tag](https://substrate.stackexchange.com/questions/tagged/benchmark)

## Case Studies

### Benchmark Input Length

In the following example, the benchmarking test suite for the `store` function in the `Remark` pallet is missing the input length parameter. This can lead to inaccurate weight calculations, potentially causing network congestion.

```rust [0|9-10|27-29]
/// substrate/frame/remark/src/lib.rs (modified)
#[frame_support::pallet]
pub mod pallet {
 /// ...
 #[pallet::call]
 impl<T: Config> Pallet<T> {
  /// Index and store data off chain.
  #[pallet::call_index(0)]
  #[pallet::weight(T::WeightInfo::store())]
  pub fn store(origin: OriginFor<T>, remark: Vec<u8>) -> DispatchResultWithPostInfo {
   ensure!(!remark.is_empty(), Error::<T>::Empty);
   let sender = ensure_signed(origin)?;
   let content_hash = sp_io::hashing::blake2_256(&remark);
   let extrinsic_index = <frame_system::Pallet<T>>::extrinsic_index()
    .ok_or_else(|| Error::<T>::BadContext)?;
   sp_io::transaction_index::index(extrinsic_index, remark.len() as u32, content_hash);
   Self::deposit_event(Event::Stored { sender, content_hash: content_hash.into() });
   Ok(().into())
  }
 }
 /// ...
}

/// substrate/frame/remark/src/benchmarking.rs (modified)
benchmarks! {
 store {
  let caller: T::AccountId = whitelisted_caller();
 }: _(RawOrigin::Signed(caller.clone()), vec![])
 verify {
  assert_last_event::<T>(Event::Stored { sender: caller, content_hash: sp_io::hashing::blake2_256(&vec![0u8; l as usize]).into() }.into());
 }

 impl_benchmark_test_suite!(Remark, crate::mock::new_test_ext(), crate::mock::Test);
}
```

To mitigate this issue, ensure that the benchmarking test suite includes the input length parameter for the `store` function, as shown below:

```rust [0|9-10|27-30]
/// substrate/frame/remark/src/lib.rs
#[frame_support::pallet]
pub mod pallet {
 /// ...
 #[pallet::call]
 impl<T: Config> Pallet<T> {
  /// Index and store data off chain.
  #[pallet::call_index(0)]
  #[pallet::weight(T::WeightInfo::store(remark.len() as u32))]
  pub fn store(origin: OriginFor<T>, remark: Vec<u8>) -> DispatchResultWithPostInfo {
   ensure!(!remark.is_empty(), Error::<T>::Empty);
   let sender = ensure_signed(origin)?;
   let content_hash = sp_io::hashing::blake2_256(&remark);
   let extrinsic_index = <frame_system::Pallet<T>>::extrinsic_index()
    .ok_or_else(|| Error::<T>::BadContext)?;
   sp_io::transaction_index::index(extrinsic_index, remark.len() as u32, content_hash);
   Self::deposit_event(Event::Stored { sender, content_hash: content_hash.into() });
   Ok(().into())
  }
 }
 /// ...
}

/// substrate/frame/remark/src/benchmarking.rs
benchmarks! {
 store {
  let l in 1 .. 1024*1024;
  let caller: T::AccountId = whitelisted_caller();
 }: _(RawOrigin::Signed(caller.clone()), vec![0u8; l as usize])
 verify {
  assert_last_event::<T>(Event::Stored { sender: caller, content_hash: sp_io::hashing::blake2_256(&vec![0u8; l as usize]).into() }.into());
 }

 impl_benchmark_test_suite!(Remark, crate::mock::new_test_ext(), crate::mock::Test);
}
```

In this example, the `store` function in the `Remark` pallet now includes the input length parameter in the benchmarking test suite, ensuring accurate weight calculations and preventing network congestion.
