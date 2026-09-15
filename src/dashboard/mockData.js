import cretaImg from "../assets/car_hyundai_creta.jpg";
import cityImg from "../assets/car_honda_city.jpg";
import nexonImg from "../assets/car_tata_nexon.jpg";
import swiftImg from "../assets/car_maruti_swift.jpg";

export const vehicles = [
  {
    id: 1,
    name: "Hyundai Creta",
    type: "SUV",
    location: "Koramangala · 1.2 km",
    price: 1800,
    rating: "4.9",
    trips: 42,
    color: "blue",
    image: cretaImg,
  },
  {
    id: 2,
    name: "Honda City",
    type: "Sedan",
    location: "Indiranagar · 2.1 km",
    price: 1600,
    rating: "4.8",
    trips: 31,
    color: "violet",
    image: cityImg,
  },
  {
    id: 3,
    name: "Tata Nexon",
    type: "SUV",
    location: "HSR Layout · 2.8 km",
    price: 1500,
    rating: "4.7",
    trips: 28,
    color: "cyan",
    image: nexonImg,
  },
  {
    id: 4,
    name: "Maruti Swift",
    type: "Hatchback",
    location: "Domlur · 3.4 km",
    price: 1300,
    rating: "4.8",
    trips: 55,
    color: "orange",
    image: swiftImg,
  },
];
export const historyItems = [
  {
    id: 1,
    vehicle: "Hyundai Creta",
    date: "12 Aug 2026",
    detail: "Booked vehicle · 2 days",
    amount: "₹3,600",
    status: "Completed",
    type: "booking",
  },
  {
    id: 2,
    vehicle: "Tata Nexon",
    date: "05 Aug 2026",
    detail: "Your listing · 4 bookings",
    amount: "₹7,200 earned",
    status: "Active",
    type: "listing",
  },
  {
    id: 3,
    vehicle: "Honda City",
    date: "28 Jul 2026",
    detail: "Booked vehicle · 1 day",
    amount: "₹1,800",
    status: "Completed",
    type: "booking",
  },
  {
    id: 4,
    vehicle: "Royal Enfield Classic 350",
    date: "19 Jul 2026",
    detail: "Your listing · 2 bookings",
    amount: "₹2,800 earned",
    status: "Active",
    type: "listing",
  },
];
