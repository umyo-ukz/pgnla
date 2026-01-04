import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import StaffSidePanel from "../components/StaffSidePanel";

export default function StaffLayout() {
  const { user, role, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user || role !== "staff") return <Navigate to="/login" />;

  return (
    <div className="flex min-h-screen bg-gray-50 sticky top-0 h-screen">
      <StaffSidePanel />

      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
