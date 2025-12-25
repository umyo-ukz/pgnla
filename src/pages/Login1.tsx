import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login1() {
  const [active, setActive] = useState<"parent" | "staff">("parent");
  const [parentEmail, setParentEmail] = useState("");
  const [parentPassword, setParentPassword] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const navigate = useNavigate();

  const handleParentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Parent login", { parentEmail });
    // TODO: integrate auth
    navigate("/");
  };

  const handleStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Staff login", { staffEmail });
    // TODO: integrate auth
    navigate("/");
  };

  return (
    <main className="container-wide px-4 py-12">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary-red rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-graduation-cap text-white text-3xl"></i>
          </div>
          <h1 className="page-title text-center">Welcome Back</h1>
          <p className="text-gray-600">Login to access your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in">
          <div className="border-b">
            <div className="flex">
              <button
                onClick={() => setActive("parent")}
                className={`flex-1 py-4 font-semibold text-center border-b-2 ${
                  active === "parent" ? "border-primary-red text-primary-red" : "text-gray-500"
                }`}
              >
                <i className="fas fa-user-friends mr-2"></i>Parent Login
              </button>
              <button
                onClick={() => setActive("staff")}
                className={`flex-1 py-4 font-semibold text-center ${
                  active === "staff" ? "border-b-2 border-primary-red text-primary-red" : "text-gray-500"
                }`}
              >
                <i className="fas fa-chalkboard-teacher mr-2"></i>Staff Login
              </button>
            </div>
          </div>

          {active === "parent" ? (
            <form onSubmit={handleParentSubmit} className="p-8">
              <div className="space-y-6">
                <div>
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    required
                    className="input-field"
                    placeholder="parent@example.com"
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="form-label">Password</label>
                    <a href="#" className="text-sm text-primary-red hover:underline">
                      Forgot password?
                    </a>
                  </div>
                  <input
                    type="password"
                    required
                    className="input-field"
                    placeholder="Enter your password"
                    value={parentPassword}
                    onChange={(e) => setParentPassword(e.target.value)}
                  />
                </div>

                <div className="flex items-center">
                  <input id="remember" type="checkbox" className="rounded text-primary-red focus:ring-primary-red" />
                  <label htmlFor="remember" className="ml-2 text-gray-700">Remember me on this device</label>
                </div>

                <button type="submit" className="w-full btn-primary py-3 text-lg">
                  <i className="fas fa-sign-in-alt mr-2"></i>Login to Parent Portal
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleStaffSubmit} className="p-8">
              <div className="space-y-6">
                <div>
                  <label className="form-label">Staff Email</label>
                  <input
                    type="email"
                    required
                    className="input-field"
                    placeholder="staff@pequenosgigantes.edu"
                    value={staffEmail}
                    onChange={(e) => setStaffEmail(e.target.value)}
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="form-label">Password</label>
                    <a href="#" className="text-sm text-primary-red hover:underline">
                      Forgot password?
                    </a>
                  </div>
                  <input
                    type="password"
                    required
                    className="input-field"
                    placeholder="Enter your password"
                    value={staffPassword}
                    onChange={(e) => setStaffPassword(e.target.value)}
                  />
                </div>

                <div className="flex items-center">
                  <input id="staff-remember" type="checkbox" className="rounded text-primary-red focus:ring-primary-red" />
                  <label htmlFor="staff-remember" className="ml-2 text-gray-700">Remember me</label>
                </div>

                <button type="submit" className="w-full btn-primary py-3 text-lg">
                  <i className="fas fa-sign-in-alt mr-2"></i>Login to Staff Portal
                </button>
              </div>
            </form>
          )}

          <div className="bg-gray-50 p-6 border-t">
            <p className="text-center text-gray-600">
              New to Pequeños Gigantes?
              <Link to="/registration" className="text-primary-red font-semibold hover:underline ml-1">
                Register here
              </Link>
            </p>
          </div>

          <div className="bg-gray-50 p-2">
            <p className="font-body text-sm mb-4 text-center text-gray-600">
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

