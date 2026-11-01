# Surplus Food Saver

Surplus Food Saver is a MERN application for sharing surplus food with people and organizations that can use it. Donors publish food donations, receivers discover available donations by city and reserve them, and administrators review reports and monitor platform activity.

> **Project status:** The backend has been manually tested and debugged. The frontend is at the Vite starter stage; full donor, receiver, and admin interfaces and frontend-to-backend integration are still to be built.

## Features

- Role-based accounts for Donors, Receivers, and Admins.
- Donation creation, editing, cancellation, and public listing with optional city and category filters.
- City-based donation discovery; the application does not use maps or geolocation.
- Receiver reservation and cancellation of reservations.
- Pickup initiation with emailed OTP and OTP verification to complete pickup.
- Reports submitted by receivers and reviewed by administrators.
- In-app notifications, unread count, and mark-one/mark-all-as-read actions.
- Admin dashboard totals and donation summaries by category and creation date.
- Donation expiry processing on a five-minute schedule, plus an admin expiry-check route.
- JWT access and refresh tokens, Cloudinary image upload utility, and Nodemailer email delivery.

## Technology

- **Frontend:** React 19, Vite 8, Tailwind CSS 4
- **Backend:** Node.js (ES modules), Express 5, MongoDB, Mongoose 9
- **Authentication:** JSON Web Tokens and bcrypt
- **Uploads and email:** Cloudinary, Multer, Nodemailer
- **Scheduling:** node-cron

The checked-in client currently contains the Vite starter app. Tailwind and React are installed, but a completed product UI, client-side routing, and API integration are not present yet.

## Project layout

```text
Surplus_Food_Saver/
├── src/                         # Vite/React frontend source
├── public/                      # Frontend static files
├── package.json                 # Frontend scripts and dependencies
├── vite.config.js
└── server/
    ├── index.js                 # Loads environment, connects DB, starts API/scheduler
    ├── app.js                   # Express middleware and API route mounts
    ├── constants.js             # Database name constant
    └── src/
        ├── controllers/
        ├── db/
        ├── middlewares/
        ├── models/
        ├── routes/
        └── utils/
```

## Requirements

- Node.js and npm
- A MongoDB instance reachable by the server
- Cloudinary credentials for donation image uploads
- Gmail credentials suitable for Nodemailer email sending

Versions of Node.js and MongoDB are not pinned in the repository; use versions compatible with the dependencies in `package.json` and `server/package.json`.

## Setup and run

### 1. Configure the backend

Create `server/.env` using the verified variable names below. Do not commit real credentials.

```dotenv
PORT=8000
CORS_ORIGIN=http://localhost:5173
MONGO_URL=mongodb://127.0.0.1:27017
ACCESS_TOKEN_SECRET=<generate-a-long-random-secret>
ACCESS_TOKEN_EXPIRY=<for-example-15m>
REFRESH_TOKEN_SECRET=<generate-a-different-long-random-secret>
REFRESH_TOKEN_EXPIRY=<for-example-7d>
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>
EMAIL_USER=<your-gmail-address>
EMAIL_PASS=<your-gmail-app-password>
```

`MONGO_URL` is combined with the database name defined in `server/constants.js`. Token expiry values must use formats accepted by `jsonwebtoken`. The examples above are placeholders, not project defaults.

### 2. Install and start the backend

```bash
cd server
npm install
npm run dev
```

The server uses port `8000` when `PORT` is unset. Once MongoDB connects, the expiry scheduler runs every five minutes. There is no separate backend build or test script defined in `server/package.json`.

### 3. Install and start the frontend

From the repository root:

```bash
npm install
npm run dev
```

Vite prints the local frontend URL (normally `http://localhost:5173`). The frontend does not currently define an API base URL or connect to the backend.

### Other frontend scripts

```bash
npm run build
npm run preview
npm run lint
```

## Environment variables

| Variable | Used for |
|---|---|
| `PORT` | Backend listening port; defaults to `8000` in `server/index.js`. |
| `CORS_ORIGIN` | Allowed browser origin for credentialed CORS. |
| `MONGO_URL` | MongoDB connection prefix; the code appends the database name from `server/constants.js`. |
| `ACCESS_TOKEN_SECRET` | Signs access JWTs. |
| `ACCESS_TOKEN_EXPIRY` | Access JWT lifetime. |
| `REFRESH_TOKEN_SECRET` | Signs refresh JWTs. |
| `REFRESH_TOKEN_EXPIRY` | Refresh JWT lifetime. |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account name. |
| `CLOUDINARY_API_KEY` | Cloudinary API key. |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret. |
| `EMAIL_USER` | Gmail sender and Nodemailer login. |
| `EMAIL_PASS` | Gmail/Nodemailer password or app password. |

## API

All API routes are mounted under `/api/v1`. Protected endpoints require the access JWT accepted by the authentication middleware (normally sent as a bearer token; login also sets HTTP-only cookies). Role restrictions are shown below. Error responses use the shape `{ statuscode, message, data, success, errors }`; successful responses use the project `ApiResponse` wrapper.

### Users — `/users`

| Method | Path | Access | Purpose |
|---|---|---|---|
| `POST` | `/register` | Public | Create an account. Controller reads `name`, `email`, `phone`, `password`, `role`, `organization`, `profileImg`, `city`, `area`, and `citiesServed`. |
| `POST` | `/login` | Public | Authenticate using `email` and `password`; returns access/refresh tokens and sets cookies. |
| `POST` | `/refresh-token` | Refresh token | Issue rotated access and refresh tokens. Refresh token can be supplied by cookie or `RefreshToken` request-body property. |
| `POST` | `/logout` | Authenticated | Clear stored refresh token and auth cookies. |
| `POST` | `/changepass` | Authenticated | Change password with `oldpass` and `newpass`. |
| `GET` | `/current-user` | Authenticated | Return the authenticated user. |
| `GET` | `/admindash` | Admin | Return the admin user record. |
| `PATCH` | `/update` | Authenticated | Update allowed profile fields: `name`, `phone`, `organization`, `city`, `area`, `citiesServed`. |

### Donations and pickups — `/donations`

| Method | Path | Access | Purpose |
|---|---|---|---|
| `POST` | `/` | Donor | Create a donation. Fields read by the controller: `foodName`, `category`, `description`, `quantity`, `unit`, `image`, `preparedAt`, `expiryAt`, `city`, `pickupArea`, `pickupAddress`, `specialInstructions`. |
| `GET` | `/` | Public | List available donations; optional query parameters: `city` and `category`. |
| `GET` | `/:id` | Public | Fetch a donation by ID. |
| `PATCH` | `/update/:id` | Donor | Update the donor's available donation. Accepted fields: `foodName`, `category`, `description`, `quantity`, `unit`, `preparedAt`, `expiryAt`, `pickupArea`, `pickupAddress`, `specialInstructions`. |
| `PATCH` | `/cancel/:id` | Donor | Cancel a donation. |
| `PATCH` | `/reserve/:id` | Receiver | Reserve a donation. |
| `PATCH` | `/cancelreserve/:id` | Receiver | Cancel a reservation. |
| `POST` | `/pickup/initiate/:id` | Receiver | Initiate pickup and send the OTP email. |
| `POST` | `/pickup/verify/:id` | Receiver | Verify pickup using the `otp` body field. The path parameter is used as the Pickup ID, as returned by `/pickup/initiate/:id`. |
| `POST` | `/expirycheck` | Admin | Manually run donation expiry processing. Scheduler also runs automatically every five minutes. |

Image handling utility and Cloudinary integration exist in the backend. Confirm the upload request format and route wiring before implementing client uploads; the donation router currently uses JSON controller inputs and does not attach the Multer middleware to the create route.

### Reports — `/reports`

| Method | Path | Access | Purpose |
|---|---|---|---|
| `POST` | `/:id` | Receiver | Report the donation identified by `:id`; body fields are `reason` and `description`. |
| `GET` | `/fetch` | Admin | Fetch pending reports. |
| `GET` | `/fetch/:id` | Admin | Fetch a report by ID. |
| `PATCH` | `/fetch/review/:id` | Admin | Review a report with `status` and `resolutionNote`. |

Report status values in the schema are `Pending`, `UnderReview`, `Resolved`, and `Rejected`.

### Notifications — `/notifications`

All endpoints require authentication and return only the current user's notification data.

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/` | List notifications. |
| `GET` | `/unread-count` | Get unread notification count. |
| `PATCH` | `/:id/read` | Mark one notification as read. |
| `PATCH` | `/read-all` | Mark all notifications as read. |

### Admin analytics — `/admin`

All endpoints require an authenticated Admin account.

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/dash` | Return user, donation-status, and report totals. |
| `GET` | `/category` | Count donations grouped by category. |
| `GET` | `/creation-date` | Count donations grouped by creation date. |

## Data models

- **User:** name, email, phone, hashed password, role, organization, profile image URL, city/area, cities served, verification status, refresh token, timestamps.
- **Donation:** donor reference, food name/category/description, quantity/unit, image URL, preparation and expiry times, city and pickup details, status, priority fields, optional receiver reference, timestamps.
- **Pickup:** donation/donor/receiver references, optional scheduled time, status, OTP and expiry, verification time, attempt count, timestamps.
- **Report:** donation and reporter references, reason/description, review status, reviewer, review time, resolution note, timestamps.
- **Notification:** recipient, type/title/message, optional related donation, read flag/time, timestamps.

See `server/src/models/` for field constraints and enum values. Registration accepts a `role` value, including `Admin`; there is no separate admin provisioning flow in the checked-in routes.

## Testing

The project currently has no automated test script or test suite configured. Backend behavior has been manually tested by the project author. To repeat manual checks, start MongoDB and the backend, then exercise the routes above with an API client using separate Donor, Receiver, and Admin accounts. Keep the API base URL at `http://localhost:8000/api/v1` unless you change `PORT`, and use the actual token/cookie behavior implemented by the authentication middleware.

Frontend checks available from the root package are `npm run lint` and `npm run build`. They check the current starter frontend and do not verify API integration.

## Future improvements

- Build the role-specific React interfaces and connect them to the existing API.
- Add a documented upload endpoint/request format for Cloudinary-backed images.
- Add automated backend tests for authentication, role authorization, donation lifecycle, OTP pickup, reports, notifications, expiry, and admin analytics.
- Add request validation, API examples, and consistent documented response schemas.
- Add pagination and search controls for donation and notification lists if needed.
