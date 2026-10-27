import { useDemo } from "./useDemo";

// Numbers for the host dashboard, derived from context data.
export function useHostStats() {
  const { vehicles, hostRequests, earningsHistory } = useDemo();

  const mine = vehicles.filter((v) => v.mine);
  const accepted = hostRequests.filter((r) => r.status === "Accepted");
  const pending = hostRequests.filter((r) => r.status === "Pending");
  const earnedNow = accepted.reduce((sum, r) => sum + r.payout, 0);

  // five previous months from the seed + the running total as the last bar
  const now = new Date();
  const series = earningsHistory.map((value, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (earningsHistory.length - index), 1);
    return { label: date.toLocaleString("en", { month: "short" }), value };
  });
  series.push({ label: "Now", value: earnedNow });

  return {
    mine,
    pending,
    accepted,
    earnedNow,
    series,
    activeListings: mine.filter((v) => v.available).length,
    totalTrips: mine.reduce((sum, v) => sum + v.trips, 0) + accepted.length,
  };
}
