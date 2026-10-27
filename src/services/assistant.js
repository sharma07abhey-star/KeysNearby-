import { cities, maxFare, routeKm } from "../data/rides";
import { addDaysISO, inr, prettyDate, todayISO } from "../utils/format";
import { estimateMonthly, quote, suggestedRange } from "../utils/pricing";

/*
  KeyBot brain.

  getReply() is the only function the rest of the app calls. It works in two modes:

  1. Remote mode  – if VITE_CHAT_API_URL is set (see README / server/chat-proxy.mjs)
                    the question is sent to a real language model.
  2. Local mode   – otherwise a small rule-based engine answers using the
                    app's own data (vehicles, bookings, rides). It needs no
                    internet or API key, so the demo always works.
*/

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const has = (text, pattern) => pattern.test(text);

export async function getReply(text, ctx, history = []) {
  const remoteUrl = import.meta.env.VITE_CHAT_API_URL;

  if (remoteUrl) {
    try {
      return await askRemote(remoteUrl, text, ctx, history);
    } catch {
      // fall through to the local engine if the server is unreachable
    }
  }

  await wait(450 + Math.random() * 450); // feels like "thinking"
  return localReply(text, ctx);
}

async function askRemote(url, text, ctx, history) {
  const messages = history
    .filter((m) => m.id !== "welcome" && !m.error)
    .slice(-8)
    .map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.text }));
  messages.push({ role: "user", content: text });

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, context: summarise(ctx) }),
  });
  if (!response.ok) throw new Error(`Server replied ${response.status}`);
  const data = await response.json();
  return { text: data.reply, actions: data.actions || [], cards: [] };
}

// Only send what the model needs - never the whole app state.
function summarise(ctx) {
  return {
    user: ctx.userName,
    vehicles: ctx.vehicles
      .filter((v) => !v.mine)
      .map((v) => ({
        name: v.name, type: v.type, fuel: v.fuel, transmission: v.transmission,
        seats: v.seats, pricePerDay: v.price, rating: v.rating, location: v.location,
      })),
    upcomingBookings: ctx.bookings
      .filter((b) => b.status === "Confirmed")
      .map((b) => ({ vehicle: b.vehicle, start: b.start, end: b.end, total: b.total })),
    rides: ctx.rides.map((r) => ({
      from: r.from, to: r.to, date: r.date, time: r.time, seats: r.seats, price: r.price,
    })),
  };
}

// ---------------------------------------------------------------------
//  Local engine
// ---------------------------------------------------------------------
const PAGES = [
  [/find|rent|browse|vehicles?\b/, "/dashboard/find-vehicle", "Find a Vehicle"],
  [/list|garage|my (car|vehicle|bike)s?/, "/dashboard/my-vehicles", "My Garage"],
  [/map|nearby/, "/dashboard/nearby-map", "Nearby Map"],
  [/pool|carpool|ride/, "/dashboard/carpool", "Ride Pooling"],
  [/safe/, "/dashboard/safety", "Women's Safety"],
  [/message|chat|inbox/, "/dashboard/messages", "Messages"],
  [/history|booking|trip/, "/dashboard/history", "History"],
  [/profile|verif|account/, "/dashboard/profile", "Profile & Verification"],
  [/feedback/, "/dashboard/feedback", "Feedback"],
  [/help|support|faq/, "/dashboard/help", "Help & Support"],
];

const TYPES = [
  [/\bsuv\b/, "SUV"], [/\bsedan\b/, "Sedan"], [/hatch/, "Hatchback"],
  [/\bmpv\b|\bvan\b|family car|innova/, "MPV"], [/scooter|scooty|activa/, "Scooter"],
  [/\bbikes?\b|motorcycle|enfield/, "Bike"],
];

function parseQuery(text, vehicles) {
  const t = text.toLowerCase();
  const filters = {};

  const type = TYPES.find(([re]) => re.test(t));
  if (type) filters.type = type[1];
  if (/\bev\b|electric/.test(t)) filters.fuel = "Electric";
  else if (/diesel/.test(t)) filters.fuel = "Diesel";
  else if (/petrol/.test(t)) filters.fuel = "Petrol";
  if (/automatic|\bauto\b/.test(t)) filters.transmission = "Automatic";
  else if (/manual/.test(t)) filters.transmission = "Manual";

  const seats = t.match(/(\d)\s*[- ]?\s*(?:seater|seats?|people|persons|passengers|friends)/);
  if (seats) filters.seats = Number(seats[1]);

  const budget = t.match(/(?:under|below|less than|within|upto|up to|max(?:imum)?|budget(?: of)?)\s*(?:rs\.?|inr|₹)?\s*(\d[\d,]*)/);
  if (budget) filters.max = Number(budget[1].replace(/,/g, ""));

  const days = t.match(/(\d+)\s*(?:day|days)\b/);
  if (days) filters.days = Number(days[1]);
  else if (/weekend/.test(t)) filters.days = 2;
  else if (/\bweek\b/.test(t)) filters.days = 7;

  filters.vehicle = vehicles.find((v) => {
    const model = v.model.toLowerCase();
    return new RegExp(`\\b${model.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(t);
  });
  return filters;
}

function toCard(v) {
  return {
    id: v.id,
    name: v.name,
    image: v.image,
    type: v.type,
    meta: `${v.type} · ${v.fuel} · ${v.seats} seats`,
    price: `${inr(v.price)}/day`,
    rating: v.rating,
    to: `/dashboard/rent-vehicle?vehicle=${v.id}`,
  };
}

function searchLink(f, sort) {
  const params = new URLSearchParams();
  if (f.type) params.set("type", f.type);
  if (f.fuel) params.set("fuel", f.fuel);
  if (f.transmission) params.set("trans", f.transmission);
  if (f.max) params.set("max", f.max);
  if (f.seats) params.set("seats", f.seats);
  if (sort) params.set("sort", sort);
  const qs = params.toString();
  return `/dashboard/find-vehicle${qs ? `?${qs}` : ""}`;
}

function reply(text, extra = {}) {
  return { text, actions: [], cards: [], ...extra };
}

function localReply(raw, ctx) {
  const t = raw.toLowerCase().trim();
  const rentable = ctx.vehicles.filter((v) => !v.mine && v.available !== false);
  const f = parseQuery(t, ctx.vehicles);

  // 1. safety first
  if (has(t, /unsafe|emergency|\bsos\b|danger|harass|scared|following me|threat/)) {
    return reply(
      "I'm sorry you're feeling unsafe. If you are in immediate danger, call 112 now. " +
        "Then move to a public, well-lit place and share your live location with someone you trust. " +
        "KeyBot cannot contact emergency services for you.",
      { actions: [{ label: "Open Safety tools", to: "/dashboard/safety" }, { label: "Call 112", href: "tel:112" }] },
    );
  }

  // 2. small talk
  if (has(t, /^(hi|hello|hey|namaste|hii+)\b|good (morning|afternoon|evening)/)) {
    return reply(`Hello ${ctx.userName || "there"}! Ask me things like “SUV under ₹2000”, “price of Creta for 3 days” or “rides from Rajpura to Chandigarh”.`);
  }
  if (has(t, /^(thanks|thank you|thx|ty)\b/)) return reply("Happy to help! Anything else?");
  if (has(t, /^(bye|goodbye|see you)/)) return reply("Safe travels! 🚗");

  // 3. navigation ("open messages", "take me to the map")
  if (has(t, /^(open|go to|take me|navigate|show me the)\b/)) {
    const page = PAGES.find(([re]) => re.test(t));
    if (page) return reply(`Sure, here is ${page[2]}.`, { actions: [{ label: `Open ${page[2]}`, to: page[1] }] });
  }

  // 4. price quote
  if (f.vehicle && has(t, /price|cost|how much|quote|total|charge|rent for|for \d+ days?|weekend|week/)) {
    const v = f.vehicle;
    const days = f.days || 1;
    const q = quote(v, todayISO(), addDaysISO(todayISO(), days));
    const lines = [
      `${v.name} for ${q.days} day${q.days > 1 ? "s" : ""}:`,
      `• Rental ${inr(q.base)}${q.discount ? ` (− ${inr(q.discount)} weekly discount)` : ""}`,
      `• Service fee ${inr(q.serviceFee)}`,
      `• Total ${inr(q.total)}`,
      `A refundable deposit of ${inr(q.deposit)} is held at pickup. Optional protection is ₹149/day.`,
    ];
    return reply(lines.join("\n"), {
      cards: [toCard(v)],
      actions: [{ label: `Book ${v.model}`, to: `/dashboard/rent-vehicle?vehicle=${v.id}` }],
    });
  }

  // 5. compare two vehicles
  if (has(t, /compare|\bvs\b|versus|difference between/)) {
    const named = ctx.vehicles.filter((v) => !v.mine && new RegExp(`\\b${v.model.toLowerCase()}\\b`).test(t));
    if (named.length >= 2) {
      const [a, b] = named;
      const cheaper = a.price <= b.price ? a : b;
      const better = a.rating >= b.rating ? a : b;
      return reply(
        `${a.name}: ${inr(a.price)}/day, ${a.fuel}, ${a.transmission}, ${a.seats} seats, ★${a.rating}.\n` +
          `${b.name}: ${inr(b.price)}/day, ${b.fuel}, ${b.transmission}, ${b.seats} seats, ★${b.rating}.\n` +
          `${cheaper.model} is cheaper by ${inr(Math.abs(a.price - b.price))}/day; ${better.model} is rated higher.`,
        { cards: [toCard(a), toCard(b)] },
      );
    }
  }

  // 5b. "how do I ..." questions go to the FAQ before anything else
  if (has(t, /\bhow (do|can|to|does)\b/)) {
    const faqFirst = answerFaq(t);
    if (faqFirst) return faqFirst;
  }

  // 6. hosting / earnings
  if (has(t, /earn|income|make money|rent out|list my|host|idle|parked|how much can i/)) {
    const type = f.type || "Sedan";
    const [low, high] = suggestedRange(type);
    const typed = t.match(/(?:₹|rs\.?\s*)(\d[\d,]*)/);
    const price = typed ? Number(typed[1].replace(/,/g, "")) : Math.round((low + high) / 2 / 50) * 50;
    return reply(
      `A ${type.toLowerCase()} priced around ${inr(price)}/day, booked about 40% of the month, could bring in roughly ${inr(estimateMonthly(price))} per month after the 5% service fee. ` +
        `Typical ${type.toLowerCase()} prices on Keys Nearby are ${inr(low)}–${inr(high)}/day. This is only an estimate; real income depends on demand.`,
      { actions: [{ label: "List my vehicle", to: "/dashboard/list-vehicle" }, { label: "My Garage", to: "/dashboard/my-vehicles" }] },
    );
  }

  // 7. ride pooling
  if (has(t, /\bpool|carpool|\blift\b|\brides?\b|travel together/)) {
    return poolingReply(t, ctx);
  }

  // 8. my bookings / requests
  if (has(t, /my booking|upcoming|my trip|reservation|\bbooked\b/)) {
    const upcoming = ctx.bookings.filter((b) => b.status === "Confirmed");
    if (!upcoming.length) {
      return reply("You have no upcoming bookings right now.", { actions: [{ label: "Find a vehicle", to: "/dashboard/find-vehicle" }] });
    }
    const list = upcoming.map((b) => `• ${b.vehicle}: ${prettyDate(b.start)} → ${prettyDate(b.end)} (${inr(b.total)})`).join("\n");
    return reply(`You have ${upcoming.length} upcoming booking${upcoming.length > 1 ? "s" : ""}:\n${list}`, { actions: [{ label: "Open History", to: "/dashboard/history" }] });
  }
  if (has(t, /request|pending|approve/)) {
    const pending = ctx.hostRequests.filter((r) => r.status === "Pending");
    return reply(
      pending.length
        ? `You have ${pending.length} pending booking request${pending.length > 1 ? "s" : ""} for your vehicles. Review them in My Garage.`
        : "No pending requests for your vehicles right now.",
      { actions: [{ label: "Open My Garage", to: "/dashboard/my-vehicles" }] },
    );
  }

  // 9. policy / FAQ answers
  const faq = answerFaq(t);
  if (faq) return faq;

  // 10. vehicle search (the main use case)
  const wantsSearch =
    f.type || f.fuel || f.transmission || f.seats || f.max || f.vehicle ||
    has(t, /find|show|need|want|looking|suggest|recommend|cheap|best|nearest|closest|rent|car|vehicle|drive|trip/);

  if (wantsSearch) {
    let results = rentable.filter(
      (v) =>
        (!f.type || v.type === f.type) &&
        (!f.fuel || v.fuel === f.fuel) &&
        (!f.transmission || v.transmission === f.transmission) &&
        (!f.seats || v.seats >= f.seats) &&
        (!f.max || v.price <= f.max),
    );
    let sort = "";
    if (has(t, /cheap|lowest|affordable|budget/)) { results = [...results].sort((a, b) => a.price - b.price); sort = "price"; }
    else if (has(t, /near|closest/)) { results = [...results].sort((a, b) => a.distance - b.distance); sort = "distance"; }
    else { results = [...results].sort((a, b) => b.rating - a.rating); sort = "rating"; }

    if (!results.length) {
      return reply("I couldn't find a vehicle matching all of that. Try a higher budget or fewer filters.", {
        actions: [{ label: "Browse all vehicles", to: "/dashboard/find-vehicle" }],
      });
    }
    const top = results.slice(0, 3);
    const label = [f.type, f.fuel, f.transmission].filter(Boolean).join(" ").toLowerCase();
    return reply(
      `I found ${results.length} ${label || "vehicle"}${results.length > 1 ? "s" : ""}${f.max ? ` under ${inr(f.max)}/day` : ""}. ` +
        `Here ${top.length > 1 ? "are my top picks" : "is the best match"}:`,
      {
        cards: top.map(toCard),
        actions: [{ label: "See all results", to: searchLink(f, sort) }],
      },
    );
  }

  // 11. fallback
  return reply("I'm not sure about that one yet. I can help with finding vehicles, price quotes, ride pooling, hosting and safety. Try one of these:", {
    actions: [
      { label: "SUV under ₹2000", prompt: "Show me an SUV under ₹2000" },
      { label: "Price of Creta for 3 days", prompt: "How much is the Creta for 3 days?" },
      { label: "How do I list my car?", prompt: "How do I list my car?" },
    ],
  });
}

function poolingReply(t, ctx) {
  const wantsOffer = has(t, /offer|post|publish|driving|i am driving|i'm driving/);
  const found = cities.filter((c) => t.includes(c.toLowerCase()));
  // order of appearance in the sentence decides from / to
  found.sort((a, b) => t.indexOf(a.toLowerCase()) - t.indexOf(b.toLowerCase()));
  const [from, to] = found;
  const womenOnly = has(t, /women|woman|female|ladies|girl/);

  if (wantsOffer) {
    const km = from && to ? routeKm(from, to) : null;
    return reply(
      km
        ? `${from} → ${to} is about ${km} km. To keep pooling cost-sharing, I'd keep the fare at or below ${inr(maxFare(km))} per seat.`
        : "To offer a ride, set your route, date, seats and a fair cost share per seat. Fares are meant to cover fuel and tolls, not make a profit.",
      { actions: [{ label: "Offer a ride", to: "/dashboard/carpool?offer=1" }] },
    );
  }

  let rides = ctx.rides.filter((r) => r.seats > 0);
  if (from) rides = rides.filter((r) => r.from.toLowerCase() === from.toLowerCase());
  if (to) rides = rides.filter((r) => r.to.toLowerCase() === to.toLowerCase());
  if (womenOnly) rides = rides.filter((r) => r.womenOnly);

  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  if (womenOnly) params.set("women", "1");
  const link = `/dashboard/carpool${params.toString() ? `?${params}` : ""}`;

  if (!rides.length) {
    return reply(
      `No matching rides${from && to ? ` from ${from} to ${to}` : ""} right now. You can offer your own ride or check again later.`,
      { actions: [{ label: "Offer a ride", to: "/dashboard/carpool?offer=1" }, { label: "Browse rides", to: link }] },
    );
  }
  const cheapest = [...rides].sort((a, b) => a.price - b.price)[0];
  const earliest = [...rides].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0];
  return reply(
    `${rides.length} ride${rides.length > 1 ? "s" : ""} found${womenOnly ? " (women-only)" : ""}. ` +
      `Cheapest: ${cheapest.from} → ${cheapest.to} at ${inr(cheapest.price)} per seat with ${cheapest.driver}. ` +
      `Earliest: ${prettyDate(earliest.date)} at ${earliest.time}.`,
    { actions: [{ label: "View rides", to: link }] },
  );
}

function answerFaq(t) {
  const rules = [
    [/cancel|refund/, "You can cancel an upcoming booking from History. Cancelling more than 24 hours before pickup is free in this demo; later cancellations may be charged by the owner's policy."],
    [/pay|upi|card|wallet/, "Online payments are not connected in this prototype. Bookings are requests only, and a real version would add a secure payment gateway."],
    [/licen|document|kyc|verif|id proof/, "You need a verified identity and a valid driving licence before your first rental. You can add both in Profile & Verification.", { label: "Open Profile", to: "/dashboard/profile" }],
    [/deposit/, "Cars have a refundable ₹3,000 deposit and bikes/scooters ₹1,000. It is held at pickup and returned after the vehicle is checked."],
    [/fuel|petrol|charge|charging/, "Return the vehicle with the same fuel level you received it with. Electric vehicles should be returned with at least the charge shown at pickup."],
    [/insur|damage|accident|breakdown|protect/, "Add the Protection plan (₹149/day) at checkout for damage cover and roadside help. Always photograph the vehicle at pickup and drop-off."],
    [/late|extend|extension/, "To extend a trip, message the owner before the return time. Late returns without notice may be charged an extra day."],
    [/how.*(book|rent)/, "Open Find a Vehicle, pick one, choose your dates and request the booking. The owner then confirms.", { label: "Find a vehicle", to: "/dashboard/find-vehicle" }],
    [/how.*(list|add).*(car|vehicle|bike)|list my car/, "Open List My Vehicle, fill in details, price and photos, and publish. Manage availability and requests in My Garage.", { label: "List my vehicle", to: "/dashboard/list-vehicle" }],
    [/safety|safe tips|stay safe/, "Verify the number plate and owner before you start, share your trip with a trusted contact, and meet in public places. Women-only rides are available in Ride Pooling.", { label: "Safety tools", to: "/dashboard/safety" }],
    [/pooling work|how.*pool/, "Drivers post a trip with spare seats. Passengers request seats and share the fuel cost. Fares are capped to a cost share, not profit."],
  ];
  for (const [re, answer, action] of rules) {
    if (re.test(t)) return reply(answer, { actions: action ? [action] : [] });
  }
  return null;
}
