# API Testing Flow for Lumina Site — Technical Guide

This document provides a developer-focused, technical workflow for testing Lumina’s API. It complements the non-technical scenario guide by offering concrete steps, tooling options, and example commands.

Audience
- Developers implementing API tests
- QA engineers building automated test suites
- DevOps engineers integrating tests into CI pipelines

Overview
- Goal: Validate API behavior against contracts, ensure authentication rules are enforced, and verify data integrity across endpoints.
- Approach: Discover endpoints, map authentication requirements, implement automated tests, and integrate tests into CI.

Prerequisites
- Access to Lumina API base URL (local or staging/production).
- Credentials or tokens for testing protected endpoints (user and admin tokens recommended).
- OpenAPI/Swagger spec (optional but recommended) and access to the API route definitions.
- Node.js environment (for Jest + Supertest examples) or your preferred test framework.
- A secure place to store and inject test secrets (CI secrets, env vars).

Auth concepts (quick recap)
- Public endpoints: No auth required.
- Bearer token: Use an Authorization header like: Authorization: Bearer <token>.
- Admin or privileged endpoints: May require a separate admin token or a specific scope.
- OpenAPI securitySchemes define the expected auth mechanism for each operation.

Endpoint discovery and auth classification
- Locate endpoints from your API spec or route files (for example, Next.js /pages/api or Express routes).
- For each endpoint, determine:
  - HTTP method (GET, POST, etc.)
  - Path
  - Auth requirement (Public, Bearer, Admin, Custom scope)
  - Expected response shape and status codes
- Produce an auth map (table) to guide tests. Example structure:

| Path | Method | Auth | Typical Use | Source |
|---|---|---|---|---|
| /api/v1/status | GET | Public | Health check | OpenAPI/Routes |
| /api/v1/users/me | GET | Bearer | Fetch current user | OpenAPI/Routes |
| /api/v1/admin/cleanup | POST | Admin | Maintenance task | OpenAPI/Routes |

Test plan
- Contract tests (OpenAPI/Schemas): Validate responses conform to the declared schema.
- Functional tests: Validate each authenticated path returns 200 with valid token and 401/403 with invalid or missing tokens.
- Negative tests: Wrong method, invalid payloads, missing required fields.
- Data tests: Use representative test data; clean up created data after tests run.
- Performance/volume tests (optional): Verify behavior under realistic load for critical endpoints.

Test harness choices (examples)
- Node.js: Jest + Supertest for API integration tests.
- Python: pytest + requests for lightweight API tests.
- API contract testing: Schemathesis or Dredd to validate responses against the OpenAPI spec.

Example: Jest + Supertest skeleton
```js
// tests/api/users.test.js
const request = require('supertest');
const app = require('../src/app'); // your Express app or a test harness

describe('Protected endpoints', () => {
  let token;
  beforeAll(async () => {
    // acquire token via login API or a pre-generated token for tests
    token = process.env.LUMINA_TEST_USER_TOKEN;
  });

  test('GET /api/v1/users/me returns user data with valid token', async () => {
    const res = await request(app)
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body).toHaveProperty('id');
  });
});
```

Alternative: curl-based quick checks
```
# Base URL and tokens come from environment:
BASE_URL=${LUMINA_API_BASE_URL}
TOKEN=${LUMINA_TEST_USER_TOKEN}

# Public endpoint
curl -sS "$BASE_URL/api/v1/status" -i

# Protected endpoint
curl -sS -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/v1/users/me" -i

# Admin endpoint (requires admin token)
ADMIN_TOKEN=${LUMINA_ADMIN_TOKEN:-$TOKEN}
curl -sS -H "Authorization: Bearer $ADMIN_TOKEN" "$BASE_URL/api/v1/admin/cleanup" -i
```

OpenAPI contract testing (optional but recommended)
- Tools: Schemathesis, Dredd, or custom test runners that validate responses against the OpenAPI spec.
- Approach: Generate test cases from the spec and run them against the running API.

CI integration
- Create a dedicated CI job (GitHub Actions, GitLab CI, CircleCI, etc.).
- Secrets (base URL, tokens) should be provided via the CI secret store.
- Run tests on every PR and push; treat failures as blockers for merge.
- Optionally, split tests into:
  - api-contract (OpenAPI-based tests)
  - integration (authenticated vs. unauthenticated flows)
  - smoke (fast checks for core endpoints)

Maintaining tests
- Update tests when endpoints change (paths, payloads, response formats).
- Keep a changelog of API changes that affect tests.

Mapping auth requirements to endpoints (how to keep it accurate)
- Use the OpenAPI security schemes to automatically tag endpoints.
- If your code uses middleware for auth, ensure tests cover cases for success and failure paths.
- Revisit the mapping when API docs are updated or new routes are added.

Notes
- This guide is intended to be a technical companion to the non-technical scenario guide. Both should be kept in sync as the API evolves.
