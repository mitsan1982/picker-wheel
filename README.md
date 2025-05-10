# Picker Wheel

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
