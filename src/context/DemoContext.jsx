import { useMemo, useState } from "react";
import { initialVehicles } from "../data/vehicles";
import { DemoContext } from "./demoStore";

export { DemoContext } from "./demoStore";

const starterBookings = [
  {
    id: "booking-1",
    vehicleId: "creta",
    vehicle: "Hyundai Creta",
    dates: "12 Aug – 14 Aug 2026",
    location: "Koramangala, Bengaluru",
    total: 3600,
    status: "Completed",
  },
];

const starterMessages = [
  {
    id: "arjun",
    name: "Arjun Mehta",
    initials: "AM",
    vehicle: "Hyundai Creta",
    unread: 2,
    messages: [
      {
        from: "them",
        text: "Hi! Is the car available for tomorrow?",
        time: "10:40 AM",
      },
      {
        from: "me",
        text: "Yes, it is available. What time would you like to pick it up?",
        time: "10:41 AM",
      },
    ],
  },
  {
    id: "priya",
    name: "Priya Sharma",
    initials: "PS",
    vehicle: "Honda City",
    unread: 0,
    messages: [
      {
        from: "them",
        text: "Thanks! I will pick it up at 9 AM.",
        time: "Yesterday",
      },
    ],
  },
];

export function DemoProvider({ children }) {
  const [user, setUser] = useState({
    name: "Keys Nearby User",
    email: "demo@keysnearby.app",
    location: "Koramangala, Bengaluru",
  });
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [bookings, setBookings] = useState(starterBookings);
  const [favorites, setFavorites] = useState([]);
  const [conversations, setConversations] = useState(starterMessages);

  function toggleFavorite(vehicleId) {
    setFavorites((currentFavorites) =>
      currentFavorites.includes(vehicleId)
        ? currentFavorites.filter((id) => id !== vehicleId)
        : [...currentFavorites, vehicleId],
    );
  }

  function addVehicle(vehicle) {
    const id = `listing-${Date.now()}`;
    const newVehicle = {
      ...vehicle,
      id,
      name: `${vehicle.brand} ${vehicle.model}`,
      rating: 0,
      trips: 0,
      distance: 0.3,
      color: "blue",
      isListing: true,
    };

    setVehicles((currentVehicles) => [newVehicle, ...currentVehicles]);
  }

  function addBooking(booking) {
    setBookings((currentBookings) => [booking, ...currentBookings]);
  }

  function sendMessage(conversationId, text) {
    const message = {
      from: "me",
      text,
      time: "Now",
    };

    setConversations((currentConversations) =>
      currentConversations.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              unread: 0,
              messages: [...conversation.messages, message],
            }
          : conversation,
      ),
    );
  }

  const value = useMemo(
    () => ({
      user,
      setUser,
      vehicles,
      bookings,
      favorites,
      conversations,
      toggleFavorite,
      addVehicle,
      addBooking,
      sendMessage,
    }),
    [user, vehicles, bookings, favorites, conversations],
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}
