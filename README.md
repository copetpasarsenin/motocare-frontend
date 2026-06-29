# MotoCare Frontend

MotoCare Frontend is the React/Vite web app for the MotoCare motorcycle service booking dashboard. It includes the public landing page, authentication screens, service catalog, booking management, profile, and admin dashboard views.

## Requirements

- Node.js compatible with the installed Vite toolchain
- npm
- A running MotoCare backend API

## Environment

Create a local `.env` file and point the frontend to the backend API:

```bash
VITE_API_BASE_URL=http://localhost:8080
```

For deployed environments, set `VITE_API_BASE_URL` to the production backend URL.

## Install

```bash
npm install
```

## Development

```bash
npm run dev
```

The Vite dev server prints the local URL, usually `http://localhost:5173`.

## Build And Preview

```bash
npm run build
npm run preview
```

Use `preview` to smoke-test the production bundle locally before deployment.

## Quality Checks

```bash
npm run lint
npm test
npm audit --omit=dev
```

## Roles

The frontend uses the role returned by the backend session data:

- `admin`: dashboard, service create/edit/delete, booking status management, and exports.
- `user`: service browsing, booking creation, booking history, and profile.

Backend authorization remains the source of truth for protected operations.

## Deployment

This project includes `vercel.json` for SPA routing on Vercel. Configure `VITE_API_BASE_URL` in the Vercel project environment variables, then deploy the production build.
