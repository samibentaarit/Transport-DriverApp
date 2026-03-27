# School Transport Driver App

Production-oriented Expo/React Native mobile app for school bus drivers, aligned to the Laravel backend in `C:\Projects\School Transport — Laravel Backend`.

## Stack

- Expo Router + TypeScript
- TanStack Query for server state
- Zustand for local state
- React Hook Form + Zod for forms
- Expo SecureStore for tokens
- Encrypted AsyncStorage for offline cache/queue payloads
- Pusher-compatible realtime client for Laravel broadcasting
- React Native Maps for live trip maps

## What is implemented

- Secure email/password login with secure session storage
- Optional QR enrollment screen with scanner support
- Today's trips, trip history, notifications, messages, profile, queue review
- Active trip execution screen with large driver actions
- Stop detail screen with boarding, missed, and drop-off actions
- Incident reporting with optional photo attachment and current location
- Emergency confirmation modal mapped to a critical incident alert
- Offline queue for trip actions, telemetry, incidents, and notification reads
- Location sharing during active trips
- Mock mode for local/demo development

## Backend alignment

Base API target: `EXPO_PUBLIC_API_URL=http://<backend>/api/v1`

Implemented against the Laravel routes/controllers currently present in the backend repo:

- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/refresh`
- `GET /auth/me`
- `PUT /auth/me`
- `GET /trips`
- `GET /trips/{trip}`
- `GET /trips/{trip}/live`
- `POST /trips/{trip}/start`
- `POST /trips/{trip}/end`
- `POST /trips/{trip}/stops/{stopInstance}/arrive`
- `POST /trips/{trip}/stops/{stopInstance}/depart`
- `POST /telemetry/batch`
- `POST /telemetry/boarding`
- `POST /incidents`
- `GET /notifications`
- `POST /notifications/{notification}/read`
- `POST /notifications/read-all`

## Important backend notes

The mobile repo is aligned to the actual Laravel codebase, not just the requested feature list. During integration review I found these server-side gaps:

1. `POST /telemetry/boarding` is currently broken in the Laravel backend.
The request validator requires `entries`, but `TelemetryController::boardingBatch()` iterates `events`, and `AssignmentService::recordBoarding()` has a different signature again. The mobile app surfaces this clearly and keeps the action queueable, but full live boarding sync needs a backend patch before production rollout.

2. There is no dedicated driver messages endpoint in the current Laravel backend.
The Messages screen works in mock mode or when `EXPO_PUBLIC_MESSAGES_PATH` is configured.

3. There is no device enrollment endpoint in the current Laravel backend routes.
The enrollment screen is implemented, but live enrollment requires `EXPO_PUBLIC_DEVICE_ENROLLMENT_PATH` to point at a real backend endpoint.

4. There is no explicit emergency endpoint in the current Laravel backend.
The emergency button maps to a critical incident using `type=safety_violation`, which preserves an audit trail and works with the existing incidents controller.

## Suggested Laravel patch for boarding

To make boarding production-ready, update the backend so the controller, request class, service, and OpenAPI spec agree on one payload shape. The simplest fix is:

- Keep `events` as documented in `docs/openapi.yaml`
- Change `BoardingBatchRequest` to validate `events.*`
- Update `TelemetryController::boardingBatch()` to pass the exact fields expected by `AssignmentService`
- Normalize the service signature so it can handle board vs alight explicitly

## Environment

Copy `.env.example` to `.env` and adjust:

```bash
EXPO_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1
EXPO_PUBLIC_BROADCAST_HOST=127.0.0.1
EXPO_PUBLIC_BROADCAST_PORT=6001
EXPO_PUBLIC_BROADCAST_SCHEME=http
EXPO_PUBLIC_BROADCAST_KEY=school-transport-key
EXPO_PUBLIC_USE_MOCKS=true
```

## Run

```bash
npm install
npx expo install --fix
npm start
```

For push notifications on Android, use a development build instead of Expo Go.

## Tests

Included initial tests cover:

- trip state selectors
- response normalization
- offline queue replay
- login screen submit flow
- trip card rendering

Run:

```bash
npm test
```

## Repo structure

```text
src/
  app/
  components/
  constants/
  hooks/
  i18n/
  mocks/
  offline/
  services/
  store/
  types/
  utils/
```

## Assumptions

- The backend remains the source of truth for assignments and trip lifecycle.
- Offline data is encrypted before storage, since Expo AsyncStorage is unencrypted by default.
- Student QR payloads are assumed to encode the backend `student_id`.
- Arabic and French support is provided through a lightweight translation layer; full RTL polishing can continue iteratively.
