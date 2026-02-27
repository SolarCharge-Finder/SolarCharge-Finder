# API Documentation (brief)

This document summarizes the main API endpoints and expected request/response shapes.

Base URL: `/api`

Authentication: Bearer token in `Authorization` header: `Authorization: Bearer <token>`

User
- POST `/users/register`
  - Body: `{ name?, email, password }`
  - Success: `201` `{ success: true, message: 'User registered', data: { _id, email, ... } }`
- POST `/users/login`
  - Body: `{ email, password }`
  - Success: `200` `{ success: true, data: { token, user } }`
- GET `/users/profile` (protected)
  - Success: `200` `{ success: true, data: user }`

Stations
- GET `/stations` - list stations (query params: city, rating, chargerType, lat,lng,radius)
  - Success: `200` `{ success: true, count, data: [ ... ] }`
- POST `/stations` (protected)
  - Body: station fields
  - Success: `201` `{ success: true, data: station }`
- GET `/stations/:id`
  - Success: `200` `{ success: true, data: station }`

Reviews
- POST `/reviews` (protected)
  - Body: `{ stationId, rating, comment }`
  - Success: `201` `{ success: true, message: 'Review added', data: review }`
- GET `/reviews/:stationId`
  - Success: `200` `{ success: true, count, data: [ ... ] }`
- PUT `/reviews/:id` (protected)
  - Body: `{ rating?, comment? }`
  - Success: `200` `{ success: true, data: review }`
- DELETE `/reviews/:id` (protected)
  - Success: `200` `{ success: true, message: 'Review deleted' }`

Errors
- Standard error envelope: `{ success: false, message: 'Reason' }` with appropriate HTTP status codes.

Notes
- Make sure to populate `JWT_SECRET` in `.env`.
- Consider exporting a Postman collection from this doc for manual testing.
