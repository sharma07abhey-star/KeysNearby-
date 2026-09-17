import { useState } from "react";
const people = [
  {
    id: 1,
    name: "Arjun Mehta",
    initials: "AM",
    vehicle: "Hyundai Creta",
    preview: "Is the car available for tomorrow?",
    messages: [
      ["them", "Hi! Is the car available for tomorrow?"],
      ["me", "Yes, it is available. What time would you like to pick it up?"],
    ],
  },
  {
    id: 2,
    name: "Priya Sharma",
    initials: "PS",
    vehicle: "Honda City",
    preview: "Thanks! I will pick it up at 9 AM.",
    messages: [
      ["them", "Hi, can I confirm the pickup time?"],
      ["me", "Yes, 9 AM works perfectly."],
    ],
  },
  {
    id: 3,
    name: "Rahul Verma",
    initials: "RV",
    vehicle: "Tata Nexon",
    preview: "Can we extend the booking by one day?",
    messages: [["them", "Can we extend the booking by one day?"]],
  },
];
export default function Messages() {
  const [selected, setSelected] = useState(1);
  const [draft, setDraft] = useState("");
  const [sent, setSent] = useState([]);
  const person = people.find((p) => p.id === selected);
  const submit = (e) => {
    e.preventDefault();
    if (draft.trim()) {
      setSent([...sent, { id: Date.now(), text: draft }]);
      setDraft("");
    }
  };
  return (
    <div className="page-content">
      <h1 className="page-title">Messages</h1>
      <p className="page-subtitle">
        Communicate with vehicle owners and renters.
      </p>
      <section className="messages">
        <aside className="conversation-list">
          {people.map((p) => (
            <button
              className={`conversation ${selected === p.id ? "selected" : ""}`}
              onClick={() => setSelected(p.id)}
              key={p.id}
            >
              <span className="conversation-avatar">{p.initials}</span>
              <div>
                <strong>{p.name}</strong>
                <small>{p.vehicle}</small>
                <span>{p.preview}</span>
              </div>
            </button>
          ))}
        </aside>
        <section className="chat-panel">
          <header className="chat-header">
            <span className="conversation-avatar">{person.initials}</span>
            <div>
              <h2>{person.name}</h2>
              <p>{person.vehicle} · Available</p>
            </div>
          </header>
          <div className="chat-thread">
            {person.messages.map(([from, text], i) => (
              <div key={i} className={`bubble ${from === "me" ? "me" : ""}`}>
                {text}
              </div>
            ))}
            {sent.map((message) => (
              <div className="bubble me" key={message.id}>
                {message.text}
              </div>
            ))}
          </div>
          <form className="composer" onSubmit={submit}>
            <input
              className="dash-input"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type a message..."
              aria-label="Message text"
            />
            <button className="dash-button">Send</button>
          </form>
        </section>
      </section>
    </div>
  );
}
