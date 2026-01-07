import { useAuth } from "../hooks/useAuth";
import { Navigate, Link } from "react-router-dom";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function AccountSettings() {
  const { user, role, logout, isAuthenticated } = useAuth();

  // Show loading state while user is being fetched
  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-primary-red mb-4"></i>
          <p className="text-gray-600">Loading account information...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated or missing user data
  if (!isAuthenticated || !user || !role || !user._id) {
    return <Navigate to="/login" />;
  }

  // At this point, TypeScript knows user is not null/undefined
  const safeUser = user;

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const changePassword = useMutation(api.account.changePassword);

  // Password validation
  const passwordRequirements = {
    minLength: newPassword.length >= 8,
    hasUppercase: /[A-Z]/.test(newPassword),
    hasLowercase: /[a-z]/.test(newPassword),
    hasNumber: /\d/.test(newPassword),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
    passwordsMatch: newPassword === confirmPassword && newPassword.length > 0,
  };

  const isPasswordValid = Object.values(passwordRequirements).every(Boolean);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!isPasswordValid) {
      setError("Please meet all password requirements");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword({
        userId: safeUser._id,
        currentPassword,
        newPassword,
      });

      setMessage("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message || "Failed to update password. Please check your current password.");
    } finally {
      setIsChangingPassword(false);
    }
  }

  // Get role badge styling
  const getRoleBadgeColor = () => {
    switch (role) {
      case "admin": return "bg-purple-100 text-purple-800 border-purple-200";
      case "staff": return "bg-blue-100 text-blue-800 border-blue-200";
      case "parent": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Get role icon
  const getRoleIcon = () => {
    switch (role) {
      case "admin": return "crown";
      case "staff": return "chalkboard-teacher";
      case "parent": return "users";
      default: return "user";
    }
  };

  // Get dashboard path
  const getDashboardPath = () => {
    switch (role) {
      case "parent": return "/parent-dashboard";
      case "staff": return "/staff";
      case "admin": return "/admin";
      default: return "/";
    }
  };

  // Format date for last login
  const lastLoginDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Account Settings
            </h1>
            <p className="text-gray-600">
              Manage your account preferences and security
            </p>
          </div>
          
          <Link
            to={getDashboardPath()}
            className="mt-4 md:mt-0 inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 text-gray-700 font-medium"
          >
            <i className="fas fa-arrow-left"></i>
            Back to Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Account Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Account Information Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-primary-red/10 rounded-xl">
                    <i className="fas fa-user text-2xl text-primary-red"></i>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Account Information</h2>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Profile Header */}
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-red to-red-600 flex items-center justify-center text-white text-3xl font-bold">
                    {safeUser.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{safeUser.fullName}</h3>
                    <div className="flex items-center gap-2">
                      <div className={`px-3 py-1 rounded-full border ${getRoleBadgeColor()} text-sm font-medium flex items-center gap-2`}>
                        <i className={`fas fa-${getRoleIcon()}`}></i>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </div>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-gray-500">Active Account</span>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                        <i className="fas fa-envelope text-gray-400"></i>
                        Email Address
                      </label>
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-900">
                        {safeUser.email}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                        <i className="fas fa-id-card text-gray-400"></i>
                        Account ID
                      </label>
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-900 font-mono text-sm flex items-center justify-between">
                        <span>{safeUser._id.slice(0, 12)}...</span>
                        <button 
                          className="text-xs text-primary-red hover:text-red-700"
                          onClick={() => {
                            navigator.clipboard.writeText(safeUser._id);
                          }}
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                        <i className="fas fa-circle-check text-gray-400"></i>
                        Account Status
                      </label>
                      <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl border border-green-200">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-green-700 font-medium">Active</span>
                        <span className="text-xs text-green-600 ml-auto">Verified</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                        <i className="fas fa-calendar-alt text-gray-400"></i>
                        Last Login
                      </label>
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-900">
                        {lastLoginDate}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <i className="fas fa-shield-alt text-2xl text-blue-600"></i>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Security Settings</h2>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Two-Factor Authentication */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                  </div>
                  <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition">
                    Enable
                  </button>
                </div>

                {/* Login Sessions */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-3">Active Sessions</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Current Session</p>
                        <p className="text-sm text-gray-600">This device • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                        <i className="fas fa-circle text-xs"></i>
                        Active
                      </span>
                    </div>
                    <button className="text-sm text-primary-red hover:text-red-700 font-medium flex items-center gap-2">
                      <i className="fas fa-sign-out-alt"></i>
                      Sign out all other devices
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Change Password */}
          <div className="space-y-8">
            {/* Change Password Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-primary-red/10 rounded-xl">
                    <i className="fas fa-key text-2xl text-primary-red"></i>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
                </div>
              </div>
              
              <div className="p-6">
                <form onSubmit={handleChangePassword} className="space-y-6">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red outline-none transition pr-12"
                        placeholder="Enter current password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        <i className={`fas fa-${showCurrentPassword ? 'eye-slash' : 'eye'}`}></i>
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red outline-none transition pr-12"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        <i className={`fas fa-${showNewPassword ? 'eye-slash' : 'eye'}`}></i>
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red outline-none transition pr-12"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        <i className={`fas fa-${showConfirmPassword ? 'eye-slash' : 'eye'}`}></i>
                      </button>
                    </div>
                  </div>

                  {/* Password Requirements */}
                  <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <h4 className="font-medium text-gray-900 text-sm">Password Requirements</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {passwordRequirements.minLength ? 
                          <i className="fas fa-check text-green-500"></i> : 
                          <i className="fas fa-times text-gray-300"></i>
                        }
                        <span className={`text-sm ${passwordRequirements.minLength ? 'text-gray-700' : 'text-gray-400'}`}>
                          At least 8 characters
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {passwordRequirements.hasUppercase ? 
                          <i className="fas fa-check text-green-500"></i> : 
                          <i className="fas fa-times text-gray-300"></i>
                        }
                        <span className={`text-sm ${passwordRequirements.hasUppercase ? 'text-gray-700' : 'text-gray-400'}`}>
                          One uppercase letter
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {passwordRequirements.hasLowercase ? 
                          <i className="fas fa-check text-green-500"></i> : 
                          <i className="fas fa-times text-gray-300"></i>
                        }
                        <span className={`text-sm ${passwordRequirements.hasLowercase ? 'text-gray-700' : 'text-gray-400'}`}>
                          One lowercase letter
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {passwordRequirements.hasNumber ? 
                          <i className="fas fa-check text-green-500"></i> : 
                          <i className="fas fa-times text-gray-300"></i>
                        }
                        <span className={`text-sm ${passwordRequirements.hasNumber ? 'text-gray-700' : 'text-gray-400'}`}>
                          One number
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {passwordRequirements.hasSpecialChar ? 
                          <i className="fas fa-check text-green-500"></i> : 
                          <i className="fas fa-times text-gray-300"></i>
                        }
                        <span className={`text-sm ${passwordRequirements.hasSpecialChar ? 'text-gray-700' : 'text-gray-400'}`}>
                          One special character
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {passwordRequirements.passwordsMatch ? 
                          <i className="fas fa-check text-green-500"></i> : 
                          <i className="fas fa-times text-gray-300"></i>
                        }
                        <span className={`text-sm ${passwordRequirements.passwordsMatch ? 'text-gray-700' : 'text-gray-400'}`}>
                          Passwords match
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-red-700 text-sm flex items-center gap-2">
                        <i className="fas fa-exclamation-circle"></i>
                        {error}
                      </p>
                    </div>
                  )}
                  
                  {message && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
                      <p className="text-green-700 text-sm flex items-center gap-2">
                        <i className="fas fa-check-circle"></i>
                        {message}
                      </p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={!isPasswordValid || isChangingPassword}
                    className={`w-full py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                      isPasswordValid && !isChangingPassword
                        ? 'bg-primary-red text-white hover:bg-red-700 shadow-sm'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isChangingPassword ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Updating...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-key"></i>
                        Update Password
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Logout Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Account Actions</h2>
              </div>
              
              <div className="p-6 space-y-4">
                <button
                  onClick={logout}
                  className="w-full py-3 px-4 flex items-center justify-center gap-2 border-2 border-red-200 text-red-600 font-medium rounded-xl hover:bg-red-50 transition-all duration-200"
                >
                  <i className="fas fa-sign-out-alt"></i>
                  Sign Out of All Devices
                </button>
                
                <div className="text-center">
                  <button className="text-sm text-gray-500 hover:text-gray-700 font-medium flex items-center justify-center gap-2 mx-auto">
                    <i className="fas fa-question-circle"></i>
                    Need help? Contact Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}