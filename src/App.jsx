import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Welcome from "./section1/Welcome";
import Login from "./section1/Login";
import Dashboard from "./dashboard/Dashboard";
import DashboardHome from "./dashboard/pages/DashboardHome";
import FindVehicle from "./dashboard/pages/FindVehicle";
import ListVehicle from "./dashboard/pages/ListVehicle";
import History from "./dashboard/pages/History";
import Messages from "./dashboard/pages/Messages";
import NearbyMap from "./dashboard/pages/NearbyMap";
import NearbyVehicles from "./dashboard/pages/NearbyVehicles";
import RentVehicle from "./dashboard/pages/RentVehicle";
import Profile from "./dashboard/pages/Profile";
import Help from "./dashboard/pages/Help";
import MapLocation from "./dashboard/pages/MapLocation";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />

        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<DashboardHome />} />
          <Route path="find-vehicle" element={<FindVehicle />} />
          <Route path="list-vehicle" element={<ListVehicle />} />
          <Route path="history" element={<History />} />
          <Route path="messages" element={<Messages />} />
          <Route path="nearby-map" element={<NearbyMap />} />
          <Route path="nearby-vehicles" element={<NearbyVehicles />} />
          <Route path="rent-vehicle" element={<RentVehicle />} />
          <Route path="profile" element={<Profile />} />
          <Route path="help" element={<Help />} />
          <Route path="map-location" element={<MapLocation />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
