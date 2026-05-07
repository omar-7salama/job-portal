# Job Portal Frontend

React UI for the three Spring Boot services in this repository.

## Run

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Service URLs

The Vite dev server proxies API calls to the backend ports already used by the services:

- `/api/users` -> `http://localhost:8081`
- `/api/jobs` -> `http://localhost:8082`
- `/api/applications` -> `http://localhost:8083`

Start the backend services before using the UI.
