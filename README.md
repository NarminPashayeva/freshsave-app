# FreshSave Customer App

React Native + Expo mobile app for iOS and Android.

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Set your backend IP address
Open `src/services/api.ts` and update `API_BASE_URL`:

```ts
// Find your Windows IP: run `ipconfig` in CMD, look for IPv4 Address
export const API_BASE_URL = 'http://192.168.1.XX:8000';
```

> Your phone and computer must be on the same WiFi network.

### 3. Make sure the backend is running
```bash
# In your freshsave backend folder:
docker-compose up
```

### 4. Start the app
```bash
npm start
```

This opens Expo DevTools in your browser and shows a QR code in the terminal.

### 5. Open on your phone
- Open **Expo Go** on your phone
- Scan the QR code shown in the terminal
- The app loads on your phone instantly

## Screens

| Screen | Path | Description |
|--------|------|-------------|
| Welcome | `/(auth)/welcome` | Splash / onboarding |
| Login | `/(auth)/login` | Email + password login |
| Register | `/(auth)/register` | Create account |
| Home | `/(tabs)/home` | Store feed with search & filters |
| Store detail | `/store/[id]` | Store info + listings + add to cart |
| Cart | `/(tabs)/cart` | Cart items + checkout |
| Orders | `/(tabs)/orders` | Order history |
| Order detail | `/order/[id]` | Order status + pickup info |
| Profile | `/(tabs)/profile` | User info + logout |
| Notifications | `/notifications` | Push notification inbox |

## Project structure

```
freshsave-app/
├── app/                    # Expo Router screens
│   ├── _layout.tsx         # Root layout + auth guard
│   ├── index.tsx           # Entry redirect
│   ├── (auth)/             # Login, register, welcome
│   ├── (tabs)/             # Bottom tab screens
│   ├── store/[id].tsx      # Store detail
│   ├── order/[id].tsx      # Order detail
│   └── notifications.tsx   # Notifications inbox
├── src/
│   ├── services/api.ts     # Axios API client
│   ├── store/
│   │   ├── authStore.ts    # Auth state (Zustand)
│   │   └── cartStore.ts    # Cart state (Zustand)
│   └── utils/theme.ts      # Colors, spacing, typography
├── assets/                 # Icons and images
└── app.json                # Expo config
```

## Tech stack

| Library | Purpose |
|---------|---------|
| Expo Router | File-based navigation |
| TanStack Query | API data fetching & caching |
| Zustand | Global state (auth, cart) |
| Axios | HTTP client with auto token refresh |
| Expo SecureStore | Secure JWT token storage |
| React Native Toast Message | In-app notifications |
| dayjs | Date formatting |
