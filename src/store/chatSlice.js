import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getReply } from "../services/assistant";

const welcome = {
  id: "welcome",
  role: "bot",
  text:
    "Hi, I'm KeyBot 👋 I can help you find a vehicle, work out prices, " +
    "plan a shared ride or list your own car. What would you like to do?",
  actions: [],
  cards: [],
};

let nextId = 1;
const makeId = () => `m${nextId++}`;

// createAsyncThunk gives us three automatic action types:
// chat/send/pending, chat/send/fulfilled and chat/send/rejected.
// The slice below reacts to each one, which is how we show the typing
// indicator (loading) and an error message when something goes wrong.
export const sendChatMessage = createAsyncThunk(
  "chat/send",
  async ({ text, context }, { getState, rejectWithValue }) => {
    try {
      const history = getState().chat.messages;
      return await getReply(text, context, history);
    } catch (error) {
      return rejectWithValue(error.message || "Something went wrong.");
    }
  },
);

const chatSlice = createSlice({
  name: "chat",
  initialState: { open: false, status: "idle", messages: [welcome], lastError: "" },
  reducers: {
    toggleChat(state) {
      state.open = !state.open;
    },
    openChat(state) {
      state.open = true;
    },
    closeChat(state) {
      state.open = false;
    },
    clearChat(state) {
      state.messages = [welcome];
      state.status = "idle";
      state.lastError = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendChatMessage.pending, (state, action) => {
        state.status = "loading";
        state.lastError = "";
        state.messages.push({ id: makeId(), role: "user", text: action.meta.arg.text });
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.status = "idle";
        state.messages.push({ id: makeId(), role: "bot", ...action.payload });
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.status = "error";
        state.lastError = action.payload || "Something went wrong.";
        state.messages.push({
          id: makeId(),
          role: "bot",
          error: true,
          text: "Sorry, I couldn't answer that just now. Please try again.",
          actions: [],
          cards: [],
        });
      });
  },
});

export const { toggleChat, openChat, closeChat, clearChat } = chatSlice.actions;
export default chatSlice.reducer;
