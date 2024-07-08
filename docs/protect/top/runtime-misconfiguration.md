---
sidebar_position: 2
slug: /xcm-misconfiguration
---

# Runtime Misconfiguration

Even if a pallet is correctly implemented, if its configuration and integration in the runtime is not properly defined, unexpected behavior can occur. This issue happen commonly with systems composed from multiple pallets and runtime modules such as XCM or bridges.

As there are many ways to misconfigure a runtime, this category is divided into subcategories.

## Subcategories

### XCM Misconfiguration

Configuring correctly XCM needs a lot of attention! XCM requires configuration across various pallets and settings. Determining the appropriate access control for the XCM pallet and managing incoming queues is crucial. For new parachains, it can be challenging to discern which XCM messages are necessary and which are not. Incorrect configurations can leave the chain vulnerable to attacks, turn it into a spam target if incoming XCM messages are not treated as untrusted or sanitized properly, or even be used as a bridge to attack other parachains by not enforcing robust Access Control on send operations.

#### Details

- **Related Vulnerabilities**: [CWE-284: Improper Access Control](https://cwe.mitre.org/data/definitions/284.html)
- **Components at Risk**: XCM configuration settings, message handling, and access control mechanisms within the parachain infrastructure.

#### Risks

The primary risks include:

- Unauthorized manipulation of the blockchain state, compromising the network's integrity.
- Execution of unauthorized transactions, potentially leading to financial losses.
- Utilization of the parachain as an attack channel against other parachains.

#### Mitigation

To mitigate the risks associated with XCM misconfiguration:

- Regularly verify all configurations and compare with successful implementations in other chains.
- In the XCM pallet, restrict the use of **execute** and **send** operations until XCM security guarantees can be fully ensured.
- Ensure robust access control in your XCM configuration:
  - Allow only trusted sources. Filter origins with `OriginConverter`.
  - Accept only specific message structures that your parachain needs. Use filters like `Barrier` for general messages, `SafeCallFilter` for transactions, `IsReserve` for reserves, `IsTeleporter` for teleportation, `MessageExporter` for message export, and `XcmSender` for sending messages.
- In the XCMP queue, ensure that only trusted channels are open and active.

## Additional Resources

- **Link to Official Documentation**: [XCM Docs](https://paritytech.github.io/xcm-docs/)
- **Substrate Stack Exchange**: [XCM Tag](https://substrate.stackexchange.com/questions/tagged/xcm)

## Case Studies

### Rococo Bridge Hub

#### Description

The `MessageExporter` type (`BridgeHubRococoOrBridgeHubWococoSwitchExporter`) in the Rococo's Bridge Hub `XcmConfig` used the `unimplemented!()` macro in `validate` and `deliver` methods, equivalent to the `panic!()` macro. This exposed the Rococo Bridge Hub runtime to a non-skippable panic reachable by any parachain allowed to send messages to it.

The following code snippet demonstrates the vulnerable `MessageExporter` type in the Rococo Bridge Hub:

```rust
/// cumulus/parachains/runtimes/bridge-hubs/bridge-hub-rococo/src/xcm_config.rs
pub struct BridgeHubRococoOrBridgeHubWococoSwitchExporter;
impl ExportXcm for BridgeHubRococoOrBridgeHubWococoSwitchExporter {
  type Ticket = (NetworkId, (sp_std::prelude::Vec<u8>, XcmHash));

  fn validate(
    network: NetworkId,
    channel: u32,
    universal_source: &mut Option<InteriorMultiLocation>,
    destination: &mut Option<InteriorMultiLocation>,
    message: &mut Option<Xcm<()>>,
  ) -> SendResult<Self::Ticket> {
    match network {
      Rococo => ToBridgeHubRococoHaulBlobExporter::validate(
        network,
        channel,
        universal_source,
        destination,
        message,
      )
      .map(|result| ((Rococo, result.0), result.1)),
      Wococo => ToBridgeHubWococoHaulBlobExporter::validate(
        network,
        channel,
        universal_source,
        destination,
        message,
      )
      .map(|result| ((Wococo, result.0), result.1)),
      _ => unimplemented!("Unsupported network: {:?}", network),
    }
  }
}
```

This issue was resolved by replacing the `unimplemented!()` macro with a more robust error handling mechanism.