# Keys Nearby

Peer-to-peer **vehicle rental + ride pooling** built with React, React Router, Context API and Redux Toolkit.
Rent a vehicle from someone nearby, list your own, or share a ride and split the fuel cost. An AI assistant (KeyBot) helps with all of it.

## Run it

```bash
npm install
npm run dev        # Starts both API (port 3001) & Vite (port 5173)
```
Click **"Explore with a demo account"** on the login page for an instant tour.

## What's inside

| Area | What it does |
| --- | --- |
| **Renting** | Search + filters (type, fuel, seats, price, sort) kept in the URL, save favourites, booking form with live price breakdown, 10% weekly discount, protection add-on, confirm dialog |
| **Hosting** | List a vehicle (live preview, price suggestion, earnings estimate, photo upload), **My Garage** (edit price, pause listing, accept/decline requests), earnings chart |
| **Ride pooling** | BlaBlaCar-style search (from / to / date, swap, women-only), ride timeline cards, request seats, offer a ride with a fair-fare cap |
| **KeyBot (AI)** | Floating assistant on every page: finds vehicles, quotes prices, searches rides, explains policies, estimates host income, deep-links into the app |
| **Extras** | Nearby map with radius, messages with auto-replies, notifications, safety checklist + trusted contact, profile verification, feedback, help centre |

## Syllabus map (Front End Engineering-II, PE-II)

| Topic | Where to find it |
| --- | --- |
| **Navigation layout & page structure** | `src/App.jsx` - nested routes (`/dashboard/*` share the `Dashboard` layout via `<Outlet />`), `RequireAuth` route guard, `React.lazy` + `Suspense` code-splitting, redirects, `NavLink` active states, URL query params (`useSearchParams`) |
| **Context API / state architecture** | `src/context/DemoContext.jsx` holds shared **app data** (user, vehicles, bookings, rides, chats). Page-only state (filters, form fields) stays local with `useState`. Global vs local state is a deliberate split |
| **Redux Toolkit** | `src/store/` - `chatSlice` (with `createAsyncThunk` + pending/fulfilled/rejected), `uiSlice` (toasts, `prepare` callback), `feedbackSlice` |
| **Async state, loading & error handling** | `src/services/api.js` (fake API), `AsyncState` component: skeleton -> error + retry -> content. Chat thunk shows a typing indicator and an error bubble |
| **Form handling & validation** | `src/hooks/useForm.js` (controlled inputs, touched/submit logic), `src/utils/validators.js` (composable rules), reusable `src/components/form/Field.jsx`. Used by login, booking, listing, offer-a-ride, profile, feedback, help, safety |

## KeyBot setup

KeyBot works **offline out of the box** using a rule-based engine over the app's own data (`src/services/assistant.js`).

To use a real language model instead, run the small proxy so your API key never reaches the browser:

```bash
ANTHROPIC_API_KEY=your-key node server/chat-proxy.mjs
# then in .env:  VITE_CHAT_API_URL=http://localhost:8787/api/chat
```
If the proxy is unreachable the app silently falls back to the offline engine.

## Demo tips

- Switch between **Renting / Hosting** in the top bar - the overview changes.
- Show the error state: run `localStorage.setItem("kn_fail","1")` in the console and reload; remove it to recover.
- Try asking KeyBot: *"SUV under 2000"*, *"price of Creta for a week"*, *"rides from Rajpura to Chandigarh"*, *"how much can I earn from my car"*.

## Notes

This is a front-end prototype: data lives in memory (a refresh resets bookings), login is simulated, and payments are not connected.
