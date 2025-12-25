import { useAuth } from "../hooks/useAuth";
import { Navigate, Link } from "react-router-dom";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function AccountSettings() {
  const { parent, logout } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const changePassword = useMutation(api.account.changeParentPassword);

  if (parent === undefined) return null;
  if (parent === null) return <Navigate to="/login" />;

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      await changePassword({
        parentId: parent._id,
        currentPassword,
        newPassword,
      });
      setMessage("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setError("Failed to update password.");
    }
  }

  return (
    <div className="container-wide px-4 py-10 space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Account Settings</h1>
        <Link to="/parent-dashboard" className="btn-secondary">
          Back to Dashboard
        </Link>
      </div>

      {/* Account Info */}
      <section className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold mb-4">Account Information</h2>
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium">Name:</span> {parent.fullName}
          </div>
          <div>
            <span className="font-medium">Email:</span> {parent.email}
          </div>
        </div>
    
      </section>

      {/* Change Password */}
      <section className="bg-white border rounded-xl p-6 max-w-md">
        <h2 className="font-semibold mb-4">Change Password</h2>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm">Current password</label>
            <input
              type="password"
              required
              className="input-field"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm">New password</label>
            <input
              type="password"
              required
              className="input-field"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
            />
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}
          {message && <div className="text-green-600 text-sm">{message}</div>}

          <button type="submit" className="btn-primary w-full">
            Update Password
          </button>
        </form>
      </section>

      {/* Logout */}
      <section className="bg-gray-50 border rounded-xl p-6 max-w-md">
        <button onClick={logout} className="btn-secondary w-full">
          Log out of all sessions
        </button>
      </section>
    </div>
  );
}
