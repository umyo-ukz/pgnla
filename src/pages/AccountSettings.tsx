import { useAuth } from "../hooks/useAuth";
import { Navigate, Link } from "react-router-dom";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function AccountSettings() {
  const { user, role, logout, isLoading } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const changePassword = useMutation(api.account.changePassword);

  if (isLoading) return null;
  if (!user || !role) return <Navigate to="/login" />;

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      await changePassword({
        userId: user._id,
        currentPassword,
        newPassword,
      });

      setMessage("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
    } catch {
      setError("Failed to update password.");
    }
  }

  return (
    <div className="container-wide px-4 py-10 space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Account Settings</h1>
        <Link
          to={
            role === "parent"
              ? "/parent-dashboard"
              : role === "staff"
              ? "/staff"
              : "/admin"
          }
          className="btn-secondary"
        >
          Back to Dashboard
        </Link>
      </div>

      <section className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold mb-4">Account Information</h2>
        <div className="space-y-2 text-sm">
          <div><span className="font-medium">Name:</span> {user.fullName}</div>
          <div><span className="font-medium">Email:</span> {user.email}</div>
          <div><span className="font-medium">Role:</span> {role}</div>
        </div>
      </section>

      <section className="bg-white border rounded-xl p-6 max-w-md">
        <h2 className="font-semibold mb-4">Change Password</h2>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <input
            type="password"
            required
            className="input-field"
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />

          <input
            type="password"
            required
            className="input-field"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          {error && <div className="text-red-600 text-sm">{error}</div>}
          {message && <div className="text-green-600 text-sm">{message}</div>}

          <button type="submit" className="btn-primary w-full">
            Update Password
          </button>
        </form>
      </section>

      <section className="bg-gray-50 border rounded-xl p-6 max-w-md">
        <button onClick={logout} className="btn-secondary w-full">
          Log out
        </button>
      </section>
    </div>
  );
}
