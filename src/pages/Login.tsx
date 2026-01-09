import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useEffect } from "react";

export default function Login() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  

 useEffect(() => {
  if (isAuthenticated && user && !isRedirecting) {
    if (user.role === "admin") {
      navigate("/admin", { replace: true });
    } else if (user.role === "staff") {
      navigate("/staff", { replace: true });
    } else if (user.role === "parent") {
      navigate("/parent", { replace: true });
    }
  }
}, [isAuthenticated, user, navigate]);


  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [active, setActive] = useState<"parent" | "staff">("parent");
  const [loading, setLoading] = useState(false);
  const [showParentPassword, setShowParentPassword] = useState(false);
  const [showStaffPassword, setShowStaffPassword] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const user = await login(email, password);

    // Show redirecting page
    setIsRedirecting(true);

    // Navigate after a short delay to show the redirecting page
    setTimeout(() => {
      if (user.role === "admin") {
        navigate("/admin", { replace: true });
      } else if (user.role === "staff") {
        navigate("/staff", { replace: true });
      } else if (user.role === "parent") {
        navigate("/parent", { replace: true });
      }
    }, 1000); // 1 second delay

  } catch (err: any) {
    setError(err.message || "Invalid credentials");
  } finally {
    setLoading(false);
  }
}



  return (
    <main className="container-wide px-4 py-12">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary-red rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-graduation-cap text-white text-3xl"></i>
          </div>
          <h1 className="page-title text-center">Welcome Back</h1>
          <p className="text-gray-600">Login to access your account</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in">
          {/* Tabs */}
          <div className="border-b">
            <div className="flex">
              <button
                type="button"
                onClick={() => setActive("parent")}
                className={`flex-1 py-4 font-semibold text-center border-b-2 ${active === "parent"
                    ? "border-primary-red text-primary-red"
                    : "border-transparent text-gray-500"
                  }`}
              >
                <i className="fas fa-user-friends mr-2"></i>
                Parent Login
              </button>

              <button
                type="button"
                onClick={() => setActive("staff")}
                className={`flex-1 py-4 font-semibold text-center border-b-2 ${active === "staff"
                    ? "border-primary-red text-primary-red"
                    : "border-transparent text-gray-500"
                  }`}
              >
                <i className="fas fa-chalkboard-teacher mr-2"></i>
                Staff Login
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 text-red-700 px-6 py-3 text-sm">
              {error}
            </div>
          )}

          {/* Parent Form */}
          {active === "parent" && (
            <form onSubmit={handleSubmit} className="p-8">
              <div className="space-y-6">
                <div>
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    required
                    className="input-field"
                    placeholder="parent@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label">Password</label>
                  <div className="relative">
                    <input
                      type={showParentPassword ? "text" : "password"}
                      required
                      className="input-field pr-12"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowParentPassword(!showParentPassword)}
                    >
                      <i className={`fas fa-${showParentPassword ? 'eye-slash' : 'eye'}`}></i>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-3 text-lg disabled:opacity-60"
                >
                  <i className="fas fa-sign-in-alt mr-2"></i>
                  {loading ? "Signing in..." : "Login to Parent Portal"}
                </button>
              </div>
            </form>
          )}

          {/* Staff Form */}
          {active === "staff" && (
            <form onSubmit={handleSubmit} className="p-8">
              <div className="space-y-6">
                <div>
                  <label className="form-label">Staff Email</label>
                  <input
                    type="email"
                    required
                    className="input-field"
                    placeholder="staff@pngla.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label">Password</label>
                  <div className="relative">
                    <input
                      type={showStaffPassword ? "text" : "password"}
                      required
                      className="input-field pr-12"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowStaffPassword(!showStaffPassword)}
                    >
                      <i className={`fas fa-${showStaffPassword ? 'eye-slash' : 'eye'}`}></i>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-3 text-lg disabled:opacity-60"
                >
                  <i className="fas fa-sign-in-alt mr-2"></i>
                  {loading ? "Signing in..." : "Login to Staff Portal"}
                </button>
              </div>
            </form>
          )}

          {/* Footer */}
          <div className="bg-gray-50 p-6 border-t">
            <p className="text-center text-gray-600">
              New to Pequeños Gigantes?
              <Link
                to="/registration"
                className="text-primary-red font-semibold hover:underline ml-1"
              >
                Register here
              </Link>
            </p>
            <p className="text-sm mt-3 text-center text-gray-500">
              Account credentials are provided upon student registration
            </p>
          </div>
        </div>

        <div className="mt-6 text-center text-gray-500 text-sm">
          <i className="fas fa-lock mr-1"></i>
          Your login information is secure and encrypted
        </div>
      </div>
    </main>
  );
}
