import { createSlice } from "@reduxjs/toolkit";

// Toast notifications ("Booking confirmed", "Saved", ...) live in Redux so
// any component can show one without passing props around.
let nextId = 1;

const uiSlice = createSlice({
  name: "ui",
  initialState: { toasts: [] },
  reducers: {
    pushToast: {
      reducer(state, action) {
        state.toasts.push(action.payload);
      },
      // "prepare" builds the payload (adds an id and a default type)
      prepare({ type = "success", title, message = "" }) {
        return { payload: { id: nextId++, type, title, message } };
      },
    },
    dismissToast(state, action) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
  },
});

export const { pushToast, dismissToast } = uiSlice.actions;
export default uiSlice.reducer;
