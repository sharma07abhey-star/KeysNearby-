import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { useDemo } from "../hooks/useDemo";
import { clearChat, closeChat, sendChatMessage, toggleChat } from "../store/chatSlice";
import Icon from "./Icon";

const SUGGESTIONS = [
  "Show me an SUV under ₹2000",
  "Price of Creta for 3 days",
  "Rides from Rajpura to Chandigarh",
  "How much can I earn from my car?",
];

export default function ChatWidget() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { open, messages, status } = useSelector((state) => state.chat);
  const demo = useDemo();

  const [draft, setDraft] = useState("");
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const loading = status === "loading";

  // keep the newest message in view
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Esc closes the panel
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => event.key === "Escape" && dispatch(closeChat());
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, dispatch]);

  if (pathname === "/login") return null;

  function send(text) {
    const clean = text.trim();
    if (!clean || loading) return;
    // Only plain data is sent to the thunk (Redux actions must be serialisable)
    const context = {
      userName: demo.user?.name?.split(" ")[0] || "",
      vehicles: demo.vehicles,
      bookings: demo.bookings,
      rides: demo.rides,
      hostRequests: demo.hostRequests,
    };
    dispatch(sendChatMessage({ text: clean, context }));
    setDraft("");
  }

  function runAction(action) {
    if (action.prompt) return send(action.prompt);
    if (action.href) return (window.location.href = action.href);
    if (action.to) {
      if (!demo.user && action.to.startsWith("/dashboard")) return navigate("/login");
      navigate(action.to);
      if (window.innerWidth < 700) dispatch(closeChat());
    }
    return undefined;
  }

  return (
    <>
      <button
        type="button"
        className={`chat-launcher${open ? " is-open" : ""}`}
        onClick={() => dispatch(toggleChat())}
        aria-expanded={open}
        aria-label={open ? "Close KeyBot assistant" : "Open KeyBot assistant"}
      >
        <Icon name={open ? "close" : "sparkle"} size={22} />
        {!open && <span className="chat-launcher-label">Ask KeyBot</span>}
      </button>

      {open && (
        <section className="chat-panel-float" role="dialog" aria-label="KeyBot assistant">
          <header className="chat-top">
            <span className="chat-bot-avatar"><Icon name="sparkle" size={18} /></span>
            <div>
              <strong>KeyBot</strong>
              <small><i className="online-dot" /> AI assistant · online</small>
            </div>
            <button type="button" title="Start over" aria-label="Clear conversation" onClick={() => dispatch(clearChat())}>
              <Icon name="refresh" size={16} />
            </button>
            <button type="button" aria-label="Close" onClick={() => dispatch(closeChat())}>
              <Icon name="close" size={16} />
            </button>
          </header>

          <div className="chat-body" aria-live="polite">
            {messages.map((message) => (
              <div key={message.id} className={`msg msg-${message.role}${message.error ? " msg-error" : ""}`}>
                <div className="msg-bubble">{message.text}</div>

                {message.cards?.length > 0 && (
                  <div className="msg-cards">
                    {message.cards.map((card) => (
                      <button type="button" className="mini-card" key={card.id} onClick={() => runAction({ to: card.to })}>
                        {card.image ? <img src={card.image} alt="" /> : <span className="mini-art"><Icon name="car" size={22} /></span>}
                        <span>
                          <strong>{card.name}</strong>
                          <small>{card.meta}</small>
                          <em>{card.price} · ★ {card.rating}</em>
                        </span>
                        <Icon name="chevron" size={16} />
                      </button>
                    ))}
                  </div>
                )}

                {message.actions?.length > 0 && (
                  <div className="msg-actions">
                    {message.actions.map((action) => (
                      <button type="button" key={action.label} className="chip" onClick={() => runAction(action)}>
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="msg msg-bot">
                <div className="msg-bubble typing" aria-label="KeyBot is typing"><i /><i /><i /></div>
              </div>
            )}

            {messages.length === 1 && !loading && (
              <div className="chat-suggestions">
                {SUGGESTIONS.map((text) => (
                  <button type="button" className="chip chip-soft" key={text} onClick={() => send(text)}>
                    {text}
                  </button>
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form className="chat-input" onSubmit={(event) => { event.preventDefault(); send(draft); }}>
            <input
              ref={inputRef}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ask about vehicles, rides, prices…"
              aria-label="Message KeyBot"
              maxLength={300}
            />
            <button type="submit" disabled={!draft.trim() || loading} aria-label="Send">
              <Icon name="send" size={18} />
            </button>
          </form>
          <p className="chat-disclaimer">KeyBot can make mistakes. Check details before booking.</p>
        </section>
      )}
    </>
  );
}
