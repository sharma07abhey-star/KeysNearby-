import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Icon from "../../components/Icon";
import PageHeader from "../../components/PageHeader";
import { useDemo } from "../../hooks/useDemo";

const QUICK = ["Is it available?", "What time works for pickup?", "Thanks!", "Can I extend by a day?"];

// A fake "owner" reply so the demo feels alive.
function autoReply(text) {
  const t = text.toLowerCase();
  if (/available|free/.test(t)) return "Yes, it's available for those dates.";
  if (/time|pickup|pick up/.test(t)) return "Anytime after 9 AM works. I'll share the exact spot.";
  if (/extend|extra|another day/.test(t)) return "Sure, I can extend it by a day. I'll update the booking.";
  if (/thank/.test(t)) return "You're welcome! Drive safe 🚗";
  if (/price|discount|cheaper/.test(t)) return "The listed price is fair, but I can offer 10% off for 5+ days.";
  return "Got it, thanks for letting me know!";
}

export default function Messages() {
  const { conversations, sendMessage, receiveMessage, markRead } = useDemo();
  const [params, setParams] = useSearchParams();
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);
  const timers = useRef([]);

  const selectedId = params.get("c");
  // On wide screens open the first chat by default; on phones show the list first.
  const wide = typeof window !== "undefined" && window.matchMedia("(min-width: 900px)").matches;
  const person = conversations.find((c) => c.id === selectedId) || (wide ? conversations[0] : null) || null;

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => { if (person && person.unread) markRead(person.id); }, [person, markRead]);
  useEffect(() => { endRef.current?.scrollIntoView({ block: "end" }); }, [person?.messages.length, typing]);

  function submit(text) {
    const clean = text.trim();
    if (!clean || !person) return;
    sendMessage(person.id, clean);
    setDraft("");
    setTyping(true);
    const id = person.id;
    timers.current.push(
      setTimeout(() => {
        setTyping(false);
        receiveMessage(id, autoReply(clean));
      }, 1400),
    );
  }

  return (
    <div className="page page-tight">
      <PageHeader eyebrow="Activity" title="Messages" subtitle="Chat with vehicle owners and renters." />

      <section className={`messages${selectedId && person ? " chat-open" : ""}`}>
        <aside className="conversation-list" aria-label="Conversations">
          {conversations.length === 0 && <p className="muted pad">No conversations yet.</p>}
          {conversations.map((c) => {
            const last = c.messages[c.messages.length - 1];
            return (
              <button
                type="button"
                key={c.id}
                className={`conversation${person?.id === c.id ? " selected" : ""}`}
                onClick={() => setParams({ c: c.id })}
              >
                <span className="avatar">{c.initials}</span>
                <span className="conversation-text">
                  <strong>{c.name}</strong>
                  <small>{c.vehicle}</small>
                  <em>{last ? last.text : "Say hello 👋"}</em>
                </span>
                {c.unread > 0 && <b className="nav-badge">{c.unread}</b>}
              </button>
            );
          })}
        </aside>

        <section className="chat-panel">
          {person ? (
            <>
              <header className="chat-header">
                <button type="button" className="icon-btn chat-back" aria-label="Back to conversations" onClick={() => setParams({})}>
                  <Icon name="arrow-left" size={18} />
                </button>
                <span className="avatar">{person.initials}</span>
                <div>
                  <h2>{person.name}</h2>
                  <p><i className="online-dot" /> {person.vehicle}</p>
                </div>
              </header>

              <div className="chat-thread">
                {person.messages.length === 0 && <p className="muted center">Start the conversation with {person.name.split(" ")[0]}.</p>}
                {person.messages.map((m, i) => (
                  <div key={i} className={`bubble${m.from === "me" ? " me" : ""}`}>
                    {m.text}
                    <small>{m.time}</small>
                  </div>
                ))}
                {typing && <div className="bubble typing"><i /><i /><i /></div>}
                <div ref={endRef} />
              </div>

              <div className="quick-replies">
                {QUICK.map((q) => <button type="button" className="chip chip-soft" key={q} onClick={() => submit(q)}>{q}</button>)}
              </div>

              <form className="composer" onSubmit={(e) => { e.preventDefault(); submit(draft); }}>
                <input className="ui-control" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Type a message…" aria-label="Message text" />
                <button type="submit" className="btn btn-primary" disabled={!draft.trim()}><Icon name="send" size={16} /> Send</button>
              </form>
            </>
          ) : (
            <div className="state-box flat">
              <Icon name="message" size={30} />
              <h2>Select a conversation</h2>
              <p>Pick a chat on the left to read and reply.</p>
            </div>
          )}
        </section>
      </section>
    </div>
  );
}
