import axios from "axios";

/**
 * src/services/http.js
 *
 * Single axios instance used by every API function.
 * baseURL points at json-server on port 3001.
 *
 * Request interceptor: if the demo "kn_fail" switch is on
 * (localStorage.setItem("kn_fail","1")), every request is aborted with a
 * friendly error so the UI can demonstrate the error/retry path.
 *
 * Response interceptor: maps all network / server failures to a single
 * friendly Error with a helpful message.
 */
const http = axios.create({
  baseURL: "http://localhost:3001",
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor: demo failure switch ──────────────────────────────────
http.interceptors.request.use(
  (config) => {
    if (localStorage.getItem("kn_fail") === "1") {
      // Cancel the request by returning a rejected promise
      return Promise.reject(
        new Error(
          "Could not reach the Keys Nearby server. Please ensure the app was started with `npm run dev`.",
        ),
      );
    }
    return config;
  },
  (err) => Promise.reject(err),
);

// ── Response interceptor: friendly error messages ────────────────────────────
http.interceptors.response.use(
  (res) => res,
  (err) => {
    // Already a friendly message (thrown by request interceptor above)
    if (err.message?.includes("Keys Nearby server")) {
      return Promise.reject(err);
    }
    const friendly =
      err.code === "ERR_NETWORK" || err.code === "ECONNREFUSED" || !err.response
        ? "Could not reach the Keys Nearby server. Please ensure the app was started with `npm run dev`."
        : err.response?.data?.message || err.message || "Something went wrong.";
    return Promise.reject(new Error(friendly));
  },
);

export default http;
