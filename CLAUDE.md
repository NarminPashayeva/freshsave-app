# FreshSave Mobile App

## Project overview
React Native + Expo mobile app (iOS & Android) for the FreshSave food waste reduction app.
Customers browse nearby bakeries/cafés and buy discounted end-of-day food.

## Tech stack
- React Native 0.81, Expo SDK 54
- Expo Router (file-based navigation)
- TanStack Query (data fetching & caching)
- Zustand (global state — auth, cart)
- Axios (HTTP client with auto token refresh)
- Expo SecureStore (JWT token storage)
- TypeScript

## Project structure
- `app/` — screens (Expo Router file-based routing)
  - `(auth)/` — welcome, login, register
  - `(tabs)/` — home, cart, orders, profile (bottom tab bar)
  - `store/[id].tsx` — store detail + add to cart
  - `order/[id].tsx` — order status + pickup info
  - `notifications.tsx` — notification inbox
- `src/services/api.ts` — Axios API client, all API calls
- `src/store/authStore.ts` — auth state (Zustand)
- `src/store/cartStore.ts` — cart state (Zustand)
- `src/utils/theme.ts` — colors, spacing, typography

## Running locally
```bash
npm install --legacy-peer-deps
npm start
```
Then scan QR code with Expo Go on your phone.

## Backend connection
Update `src/services/api.ts`:
```ts
export const API_BASE_URL = 'http://YOUR_LOCAL_IP:8000';
```
Find your IP with `ipconfig` on Windows.
Your phone and computer must be on the same WiFi.

## Key business rules
- Cart only allows items from one store at a time
- JWT tokens stored securely in Expo SecureStore
- Access token auto-refreshes on 401 via Axios interceptor
- Order status polls every 15 seconds for real-time updates

## Navigation flow
Welcome → Login/Register → Home (tabs)
Home → Store Detail → Add to Cart → Cart → Checkout → Order Detail

## User roles
Only `customer` role is used in this app.
Store owners use the separate web dashboard.
