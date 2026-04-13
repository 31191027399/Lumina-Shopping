# Local SonarQube

This repo includes a local SonarQube setup for inspecting frontend and backend code quality.

## Start SonarQube

```bash
npm run sonar:up
```

Open `http://localhost:9000`.

On first login, use:

- username: `admin`
- password: `admin`

SonarQube will ask you to change the password the first time you sign in.

## Create a token

After logging in:

1. Open your profile in the top-right corner.
2. Go to **My Account** -> **Security**.
3. Create a token for local scans.

## Run a scan

```bash
SONAR_TOKEN=your_token_here npm run sonar:scan
```

The scan uses [`sonar-project.properties`](/Users/finn/Desktop/Testing website/sonar-project.properties) and currently includes:

- `FE/src`
- `FE/api`
- `BE/src`
- `api`

Excluded paths include `node_modules`, build output, coverage, Supabase assets, SQL files, and the static UI mock HTML.

## Useful commands

```bash
npm run sonar:logs
npm run sonar:down
```
