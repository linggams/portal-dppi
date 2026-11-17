# IT Management (ITMS)

Primary IT module in Portal DPPI. Legacy IT Support has been removed.

## Routes

| Area | Path | Access flag |
|------|------|-------------|
| Portal (requester) | `/itms/portal/*` | `accessItms` |
| Console (agent) | `/itms/console/*` | `manageItms` |
| API | `/api/itms/*` | same capability checks |

UI label: **IT Management**. Technical routes/API remain under `/itms`. UI copy is **English**.

### Document libraries

| Kind | Console | Portal | Purpose |
|------|---------|--------|---------|
| SOP | `/itms/console/sop` | `/itms/portal/sop` | Controlled procedures (number, effective/review dates, acknowledgment) |
| NIST Mapping | `/itms/console/nist` | `/itms/portal/nist` | Mapping IT offerings to NIST CSF 2.0 |

Legacy `/itms/*/knowledge` URLs redirect to SOP.

API filter: `GET /api/itms/knowledge?kind=sop`.

Initial SOP content can be (re)imported from `D:\dev\sop-it`:

```bash
pnpm db:import-sop-it
```

## Features

- Ticketing + SLA (Impact × Urgency), comments, CSAT
- Links to assets and SOP documents
- SOP register (versioning, publish, acknowledge)
- NIST CSF mapping
- Asset registry (assign / return / My Assets)
- Console dashboard (MTTR, SLA %, trends, near-breach)
- In-app notifications

## Enable for a user

Platform → Data User → check **IT Management**. Re-login after change.
