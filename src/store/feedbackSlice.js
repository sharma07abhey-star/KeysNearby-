import { createSlice } from "@reduxjs/toolkit";

// Start from whatever was saved in this browser so entries survive a refresh.
function loadSaved() {
  try {
    return JSON.parse(localStorage.getItem("keysNearbyFeedback") || "[]");
  } catch {
    return [];
  }
}

const feedbackSlice = createSlice({
  name: "feedback",
  initialState: { submissions: loadSaved() },
  reducers: {
    addFeedback(state, action) {
      state.submissions.unshift(action.payload);
    },
    clearFeedback(state) {
      state.submissions = [];
    },
  },
});

export const { addFeedback, clearFeedback } = feedbackSlice.actions;
export default feedbackSlice.reducer;
