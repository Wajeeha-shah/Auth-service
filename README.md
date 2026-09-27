# Auth Service

A TypeScript and Express service for user authentication and user management. It uses PostgreSQL through TypeORM and issues authentication tokens for API access.

## Continuous integration and delivery

GitHub Actions runs the workflow in `.github/workflows/ci.yml` for pull requests targeting `master`, pushes to `master`, and manual dispatches.

The quality job runs on Ubuntu with Node.js 22 and performs these checks in order:

1. Installs the locked dependencies with `npm ci`.
2. Starts a temporary PostgreSQL 16 service for the test run.
3. Generates test keys with `npm run generate:keys`.
4. Checks code style with `npm run lint` and compiles TypeScript with `npm run build`.
5. Validates the SonarQube Cloud token and submits source analysis.
6. Runs the Jest suite with coverage using `npm run test:coverage`.
7. Uploads the `coverage/` directory when available. Artifacts are retained for 14 days.

The test database is created inside the GitHub Actions runner and is discarded when the job ends. CI tests do not connect to the production Supabase database.

### Running and checking the workflow

The workflow starts automatically for pull requests targeting `master` and for pushes to `master`. To run it for a README change, commit and push the change to the branch used by an open pull request targeting `master`. Open the repository's **Actions** tab and select the newest **CI** run to follow its jobs and logs. You can also start a run manually with **Actions > CI > Run workflow**.

A production container is built and pushed only after the quality job succeeds on a push to `master`. The image is published to Docker Hub with both `latest` and commit SHA tags. Pull request runs do not publish images.

## Required GitHub Actions secrets

The workflow uses the GitHub Environment named `TEST_DB_NAME`. Add these as **environment secrets** under **Settings > Environments > TEST_DB_NAME**. Do not commit secret values.

| Secret | Used for |
| --- | --- |
| `SONAR_TOKEN` | SonarQube Cloud analysis authentication |
| `DOCKERHUB_USERNAME` | Docker Hub account used to publish the image on `master` |
| `DOCKERHUB_TOKEN` | Docker Hub credential used by the publish job |

The SonarQube project key and organization are set in `.github/workflows/ci.yml` and must match the SonarQube Cloud project. CI tests use the temporary PostgreSQL service, not Supabase database secrets.

## Local quality checks

Install dependencies and run the same core checks locally:

```bash
npm ci
npm run generate:keys
npm run lint
npm run build
npm run test:coverage
```

For local tests, provide a disposable PostgreSQL database using the settings in `.env.test`. Tests clear and recreate database tables, so never point them at production data.

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
