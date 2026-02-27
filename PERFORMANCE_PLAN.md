# Performance Testing Plan

Goal
- Verify API baseline throughput and latency for `/api/stations` and auth endpoints.

Environment
- Target: local dev server at `http://localhost:5001` (update `.env` PORT if needed)
- Artillery config: `backend/artillery.yml`

Scenarios
1. Baseline list stations
   - Duration: 60s
   - Arrival rate: 10 rps
   - Endpoint: GET `/api/stations`
2. Mixed auth + station reads
   - POST `/api/users/login` (to obtain token), then GET `/api/stations`
   - Simulate 5 rps login + 20 rps station reads

Metrics
- Latency: p50, p95, p99
- Throughput: requests/sec
- Error rate

Commands
- Run Artillery locally (install if needed):

```bash
# from repo root
cd backend
npx artillery run artillery.yml -o artillery_report.json
npx artillery report --input artillery_report.json --output artillery_report.html
```

Deliverables
- `artillery_report.json` and `artillery_report.html` saved to repo root or `backend/reports/`.
- Short summary with p95 latency and error rate.

Notes
- Ensure MongoDB is running locally or mock DB for isolated performance testing.
