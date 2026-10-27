import { lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ChatWidget from "./components/ChatWidget";
import RequireAuth from "./components/RequireAuth";
import Toaster from "./components/Toaster";
import Dashboard from "./dashboard/Dashboard";
import Login from "./section1/Login";
import Welcome from "./section1/Welcome";

// React.lazy splits every dashboard page into its own file, so a page is
// only downloaded the first time the user opens it. <Suspense> (inside
// Dashboard) shows a spinner while that happens.
const DashboardHome = lazy(() => import("./dashboard/pages/DashboardHome"));
const FindVehicle = lazy(() => import("./dashboard/pages/FindVehicle"));
const RentVehicle = lazy(() => import("./dashboard/pages/RentVehicle"));
const ListVehicle = lazy(() => import("./dashboard/pages/ListVehicle"));
const MyVehicles = lazy(() => import("./dashboard/pages/MyVehicles"));
const History = lazy(() => import("./dashboard/pages/History"));
const Messages = lazy(() => import("./dashboard/pages/Messages"));
const NearbyMap = lazy(() => import("./dashboard/pages/NearbyMap"));
const Carpool = lazy(() => import("./dashboard/pages/Carpool"));
const Safety = lazy(() => import("./dashboard/pages/Safety"));
const Profile = lazy(() => import("./dashboard/pages/Profile"));
const Feedback = lazy(() => import("./dashboard/pages/Feedback"));
const Help = lazy(() => import("./dashboard/pages/Help"));

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />

        {/* Nested routes: Dashboard is the shared layout, <Outlet /> shows the child page */}
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="find-vehicle" element={<FindVehicle />} />
          <Route path="rent-vehicle" element={<RentVehicle />} />
          <Route path="list-vehicle" element={<ListVehicle />} />
          <Route path="my-vehicles" element={<MyVehicles />} />
          <Route path="history" element={<History />} />
          <Route path="messages" element={<Messages />} />
          <Route path="nearby-map" element={<NearbyMap />} />
          <Route path="carpool" element={<Carpool />} />
          <Route path="safety" element={<Safety />} />
          <Route path="profile" element={<Profile />} />
          <Route path="feedback" element={<Feedback />} />
          <Route path="help" element={<Help />} />
          {/* old links still work */}
          <Route path="nearby-vehicles" element={<Navigate to="/dashboard/find-vehicle" replace />} />
          <Route path="map-location" element={<Navigate to="/dashboard/nearby-map" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Outside <Routes>, so they stay mounted on every page */}
      <ChatWidget />
      <Toaster />
    </BrowserRouter>
  );
}
