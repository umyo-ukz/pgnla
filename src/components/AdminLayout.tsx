// components/AdminLayout.tsx
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import AdminSidePanel from "../components/AdminSidePanel";
import { useState, useEffect } from "react";

export default function AdminLayout() {
  const { user, role, isLoading } = useAuth();
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

  if (isLoading) return null;
  if (!user || role !== "admin") return <Navigate to="/login" />;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Admin side panel */}
      <AdminSidePanel />

      {/* Main content area */}
      <main className={`flex-1 ${isMobile ? 'pt-0' : 'pt-0'} overflow-y-auto`}>
        <div className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}