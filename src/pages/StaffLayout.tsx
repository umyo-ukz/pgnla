import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import StaffSidePanel from "../components/StaffSidePanel";
import { useState, useEffect } from "react";

export default function StaffLayout() {
  const { user, role } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

W
  if (!user || role !== "staff") return <Navigate to="/login" />;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Side panel will handle its own responsive behavior */}
      <StaffSidePanel />

      {/* Main content area */}
      <main className={`flex-1 ${isMobile ? 'pt-0' : 'pt-0'} overflow-y-auto`}>
        <div className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}