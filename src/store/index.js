import { configureStore } from "@reduxjs/toolkit";
import chatReducer from "./chatSlice";
import feedbackReducer from "./feedbackSlice";
import uiReducer from "./uiSlice";

export const store = configureStore({
  reducer: {
    feedback: feedbackReducer,
    chat: chatReducer,
    ui: uiReducer,
  },
});

// Reducers must stay pure, so saving to localStorage happens here instead:
// every time the store changes we keep a copy of the feedback list.
let lastSaved = store.getState().feedback.submissions;
store.subscribe(() => {
  const current = store.getState().feedback.submissions;
  if (current !== lastSaved) {
    lastSaved = current;
    localStorage.setItem("keysNearbyFeedback", JSON.stringify(current));
  }
});
