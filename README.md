# Picker Wheel

## Frontend Environment Variables

The frontend uses environment variables for configuration. Create a `.env` file in the `client/` directory for local development, or set these variables in your deployment platform (e.g., Vercel).

### VITE_API_BASE_URL
- **Purpose:** Sets the base URL for backend API requests.
- **Local development:** Defaults to `http://localhost:5001` if not set.
- **Production:** Defaults to `https://internal.picklewheel.com` if not set.
- **Override:** You can set `VITE_API_BASE_URL` to any backend URL you want to use.

Example for local development:
```
VITE_API_BASE_URL=http://localhost:5001
```
Example for production:
```
VITE_API_BASE_URL=https://internal.picklewheel.com
```

### VITE_FRONTEND_SECRET
- **Purpose:** Secret key required for secure API access. Must match the backend's expected value.
- **Required:** Yes, for all environments.

Example:
```
VITE_FRONTEND_SECRET=your-secret-here
```

---

## Sample API Endpoints (curl)

### 1. List all wheels
```sh
curl http://localhost:5001/api/wheels
```

### 2. Create a new wheel
```sh
curl -X POST http://localhost:5001/api/wheels \
  -H "Content-Type: application/json" \
  -d '{"name":"My Test Wheel","options":["A","B","C"]}'
```

### 3. Get a wheel by ID (replace <id> with the actual wheel ID)
```sh
curl http://localhost:5001/api/wheels/<id>
```

### 4. Spin a wheel (replace <id> with the actual wheel ID)
```sh
curl -X POST http://localhost:5001/api/wheels/<id>/spin
```

### 5. Delete a wheel (replace <id> with the actual wheel ID)
```sh
curl -X DELETE http://localhost:5001/api/wheels/<id>
```
