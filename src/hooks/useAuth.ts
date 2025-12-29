import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";

const TOKEN_KEY = "pngla_session";

export function useAuth() {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem(TOKEN_KEY)
  );

  const loginMutation = useMutation(api.auth.login);
  const logoutMutation = useMutation(api.auth.logout);

  const user = useQuery(
    api.auth.getCurrentUser,
    token ? { token } : "skip"
  );

  async function login(email: string, password: string) {
    const res = await loginMutation({ email, password });
    localStorage.setItem(TOKEN_KEY, res.token);
    setToken(res.token);
    return res.user;
  }

  async function logout() {
    if (!token) return;
    await logoutMutation({ token });
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  }

  return {
    user,
    role: user?.role,
    login,
    logout,
    isAuthenticated: !!user,
  };
}
