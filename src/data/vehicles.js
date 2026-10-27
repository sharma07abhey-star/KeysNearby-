import cretaImg from "../assets/car_hyundai_creta.jpg";
import cityImg from "../assets/car_honda_city.jpg";
import nexonImg from "../assets/car_tata_nexon.jpg";
import swiftImg from "../assets/car_maruti_swift.jpg";

// `mine: true` means the logged-in user owns (hosts) the vehicle.
// `pos` is the x/y percentage used to pin the vehicle on the stylised map.
// Vehicles without an `image` get a drawn silhouette (see VehicleArt).
export const initialVehicles = [
  {
    id: "creta", name: "Hyundai Creta", brand: "Hyundai", model: "Creta",
    type: "SUV", fuel: "Petrol", transmission: "Automatic", seats: 5, year: 2023,
    price: 1800, rating: 4.9, trips: 42, location: "Koramangala, Bengaluru",
    distance: 1.2, color: "blue", image: cretaImg, owner: "Arjun Mehta",
    features: ["Sunroof", "Bluetooth", "Rear camera"], available: true, pos: { x: 30, y: 44 },
  },
  {
    id: "city", name: "Honda City", brand: "Honda", model: "City",
    type: "Sedan", fuel: "Petrol", transmission: "Manual", seats: 5, year: 2022,
    price: 1600, rating: 4.8, trips: 31, location: "Indiranagar, Bengaluru",
    distance: 2.1, color: "violet", image: cityImg, owner: "Priya Sharma",
    features: ["Cruise control", "Bluetooth", "Airbags"], available: true, pos: { x: 48, y: 66 },
  },
  {
    id: "nexon", name: "Tata Nexon EV", brand: "Tata", model: "Nexon EV",
    type: "SUV", fuel: "Electric", transmission: "Automatic", seats: 5, year: 2024,
    price: 1500, rating: 4.7, trips: 28, location: "HSR Layout, Bengaluru",
    distance: 2.8, color: "cyan", image: nexonImg, owner: "Rahul Verma",
    features: ["300 km range", "Fast charging", "Rear camera"], available: true, pos: { x: 68, y: 38 },
  },
  {
    id: "swift", name: "Maruti Swift", brand: "Maruti", model: "Swift",
    type: "Hatchback", fuel: "Petrol", transmission: "Manual", seats: 5, year: 2021,
    price: 1300, rating: 4.8, trips: 55, location: "Domlur, Bengaluru",
    distance: 3.4, color: "orange", image: swiftImg, owner: "Kabir Singh",
    features: ["Great mileage", "Bluetooth", "Easy parking"], available: true, pos: { x: 58, y: 20 },
  },
  {
    id: "thar", name: "Mahindra Thar", brand: "Mahindra", model: "Thar",
    type: "SUV", fuel: "Diesel", transmission: "Manual", seats: 4, year: 2023,
    price: 2400, rating: 4.9, trips: 19, location: "Whitefield, Bengaluru",
    distance: 5.2, color: "orange", image: null, owner: "Neha Kapoor",
    features: ["4x4", "Soft top", "Weekend favourite"], available: true, pos: { x: 82, y: 58 },
  },
  {
    id: "innova", name: "Toyota Innova Crysta", brand: "Toyota", model: "Innova Crysta",
    type: "MPV", fuel: "Diesel", transmission: "Manual", seats: 7, year: 2022,
    price: 2800, rating: 4.8, trips: 37, location: "Jayanagar, Bengaluru",
    distance: 4.1, color: "violet", image: null, owner: "Suresh Iyer",
    features: ["7 seats", "Roof AC vents", "Big boot"], available: true, pos: { x: 22, y: 72 },
  },
  {
    id: "activa", name: "Honda Activa 6G", brand: "Honda", model: "Activa 6G",
    type: "Scooter", fuel: "Petrol", transmission: "Automatic", seats: 2, year: 2023,
    price: 450, rating: 4.6, trips: 64, location: "BTM Layout, Bengaluru",
    distance: 1.9, color: "cyan", image: null, owner: "Ananya Rao",
    features: ["Helmet included", "Under-seat storage"], available: true, pos: { x: 40, y: 82 },
  },
  // ---- vehicles listed by the current user ----
  {
    id: "my-i20", name: "Hyundai i20", brand: "Hyundai", model: "i20",
    type: "Hatchback", fuel: "Petrol", transmission: "Manual", seats: 5, year: 2022,
    price: 1400, rating: 4.8, trips: 12, location: "Koramangala, Bengaluru",
    distance: 0.3, color: "blue", image: null, owner: "You",
    features: ["Bluetooth", "Rear camera"], available: true, mine: true, pos: { x: 36, y: 50 },
  },
  {
    id: "my-re350", name: "Royal Enfield Classic 350", brand: "Royal Enfield", model: "Classic 350",
    type: "Bike", fuel: "Petrol", transmission: "Manual", seats: 2, year: 2021,
    price: 900, rating: 4.9, trips: 9, location: "Koramangala, Bengaluru",
    distance: 0.3, color: "orange", image: null, owner: "You",
    features: ["Two helmets", "Saddle bags"], available: false, mine: true, pos: { x: 34, y: 54 },
  },
];
