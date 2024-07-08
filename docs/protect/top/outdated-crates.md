---
sidebar_position: 8
slug: /outdated-crates
---

# Outdated Crates

Dependencies can become a nightmare! Using outdated or known vulnerable components, such as pallets or libraries, in a Substrate runtime can expose the system to a broad range of security risks and exploits.

## Details

- **Related Vulnerabilities**: [CWE-937: Using Components with Known Vulnerabilities](https://cwe.mitre.org/data/definitions/937.html)
- **Components at Risk**: Blockchain network operations, particularly those involving the use of third-party libraries and dependencies within a Substrate runtime.

## Risks

The primary risks include:

- Exposure to known vulnerabilities that could be exploited by attackers, potentially leading to compromised network integrity and security.
- This could result in significant data breaches or financial losses due to the exploitation of these outdated components.

## Mitigation

To effectively manage the risk of using outdated crates:

- Always use the latest stable versions of dependencies such as Polkadot, Substrate, Cumulus, and any third-party crates. You can use [PSVM](https://github.com/paritytech/psvm) to update your dependencies.
- Minimize the use of external crates to reduce potential attack surfaces.
- Employ tools like `cargo audit` or `cargo vet` to continuously monitor and evaluate the security state of the system’s dependencies.
- Avoid dependencies that ship with precompiled binaries, as these can introduce unverifiable components into a trustless system.
- It is essential not to use the latest version of a crate in production until it has been declared stable and secure.

## Additional Resources

- **Official Releases**: [Polkadot SDK Releases](https://github.com/paritytech/polkadot-sdk/releases)
- **Useful Tooling**: [PSVM](https://github.com/paritytech/psvm);

## Case Studies

### Serde Precompiled Binary

Polkadot uses the `serde` crate with the `derive` feature as a dependency.

Serde developers decided to ship it as a precompiled binary, raising security concerns within the community due to the trustless nature of systems like Polkadot. [Read the article on this issue](https://www.bleepingcomputer.com/news/security/rust-devs-push-back-as-serde-project-ships-precompiled-binaries/).

The dependency was fixed to a version of `serde` that does not include the precompiled binary to maintain the integrity of the trustless environment.
