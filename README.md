# Auth Service

A TypeScript and Express service for user authentication and user management. It uses PostgreSQL through TypeORM and issues authentication tokens for API access.

## Continuous integration and delivery

GitHub Actions runs the workflow in `.github/workflows/ci.yml` for pull requests targeting `master`, pushes to `master`, and manual dispatches.

The quality job runs on Ubuntu with Node.js 22 and performs these checks in order:

1. Installs the locked dependencies with `npm ci`.
2. Generates test keys with `npm run generate:keys`.
3. Checks code style and rules with `npm run lint`.
4. Compiles the TypeScript project with `npm run build`.
5. Submits source analysis to SonarQube Cloud.
6. Runs the Jest suite with coverage using `npm run test:coverage`.
7. Uploads the `coverage/` directory as a workflow artifact when available. Artifacts are retained for 14 days.

A production container is built and pushed only after the quality job succeeds on a push to `master`. The image is published to Docker Hub with both `latest` and commit SHA tags. Pull request runs do not publish images.

## Required GitHub Actions secrets

Configure these in **Settings → Secrets and variables → Actions**. Do not commit secret values to the repository.

| Secret | Used for |
| --- | --- |
| `SONAR_TOKEN` | SonarQube Cloud analysis authentication |
| `SUPABASE_TEST_DB_HOST` | PostgreSQL test database host |
| `SUPABASE_TEST_DB_PORT` | PostgreSQL test database port |
| `SUPABASE_TEST_DB_NAME` | PostgreSQL test database name |
| `SUPABASE_TEST_DB_USER` | PostgreSQL test database user |
| `SUPABASE_TEST_DB_PASSWORD` | PostgreSQL test database password |
| `TEST_JWKS_URI` | JWKS endpoint configured for CI tests |
| `DOCKERHUB_USERNAME` | Docker Hub account used to publish the image |
| `DOCKERHUB_TOKEN` | Docker Hub credential used by the publish job |

The workflow configures the SonarQube project key from the GitHub repository name and the organization from the repository owner. These values must correspond to the project and organization configured in SonarQube Cloud. GitHub does not expose repository secrets to workflows triggered by pull requests from forks, so Sonar analysis may require a trusted same-repository run or a separately secured workflow policy.

## Local quality checks

Install dependencies and run the same core checks locally:

```bash
npm ci
npm run generate:keys
npm run lint
npm run build
npm run test:coverage
```

Tests require the environment variables described by `.env.example` and a reachable PostgreSQL test database. Use dedicated test credentials; never point automated tests at production data.

## Project layout

- `src/controller` — HTTP request handlers
- `src/routes` — API route definitions
- `src/services` — authentication and user-management logic
- `src/entity` — TypeORM entities
- `src/middleware` — request authentication and access control
- `src/validators` — request validation rules
- `src/tests` — automated tests
- `.github/workflows/ci.yml` — CI checks and production image publishing
- `Dockerfile` — multi-stage production image build
