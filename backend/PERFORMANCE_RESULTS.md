# Artillery Run Summary

- Command: `npx artillery run artillery.yml -o artillery_report.json`
- Target: http://localhost:5001
- Duration: 60s
- Arrival rate: 10 rps

Key metrics (aggregate):

- Total requests: 600
- Successful (2xx): 600
- Failed requests: 0
- Mean latency: 210 ms
- Median (p50): 98.5 ms
- p95 latency: 820.7 ms
- p99 latency: 1436.8 ms
- Max latency: 2554 ms

Notes:
- No errors observed during the run (vusers.failed = 0).
- The p95 (~821 ms) suggests occasional higher-latency responses; investigate slow database queries or heavy payloads for those samples.
- Artillery JSON report saved at `backend/artillery_report.json`.

Next steps:
- Run the mixed-auth + read scenario and compare metrics.
- Run on a staging environment with realistic dataset and increase load to find the service limits.
