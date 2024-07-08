---
sidebar_position: 2
slug: /verbosity-issues
---

# Verbosity Issues

Lack of detailed logs from collators, nodes, or RPC can make it difficult to diagnose issues, particularly in cases of crashes or network halts. This lack of verbosity can hinder efforts to maintain system health and resolve issues promptly.

## Details

- **Related Vulnerabilities**: [CWE-778: Insufficient Logging](https://cwe.mitre.org/data/definitions/778.html)
- **Components at Risk**: System logging mechanisms across nodes, collators, and RPC interfaces in a blockchain network.

## Risks

The primary risks include:

- Difficulty in diagnosing and resolving system issues, potentially leading to extended periods of downtime.
- Reduced capacity to identify and mitigate security threats, compromising network integrity.

## Mitigation

To mitigate the risks associated with verbosity issues:

- Regularly review log outputs to identify any suspicious activities and determine if current logging levels are sufficient.
- Implement comprehensive logging in critical parts of your blockchain pallets to ensure all significant events are captured.
- Deploy monitoring dashboards such as Grafana to detect anomaly patterns in logs and metrics, which can help node maintainers stay aware of recent issues and system performance.

## Additional Resources

- **Link to Official Documentation**: [Substrate Debug](https://docs.substrate.io/test/debug/)
- **Link to Official Documentation**: [Substrate Monitor](https://docs.substrate.io/maintain/monitor/)

## Case Studies

### Kusama Network Incident

During a significant issue referenced in [Kusama Referendum 263](https://kusama.polkassembly.io/referenda/263), the Kusama network experienced a halt in block production that lasted several hours. Engineers needed to sift through extensive logs to pinpoint the cause of the stoppage.

The logging system was instrumental in identifying that a dispute in a finalized block was the trigger for the network halt. Although consensus systems are complex and rarely experience halts, when they do occur, recreating the scenario that led to the halt can be challenging. Effective logging was key in quickly identifying the problem, thus helping to minimize downtime.
