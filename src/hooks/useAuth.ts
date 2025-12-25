import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect, useState } from "react";

const TOKEN_KEY = "pngla_session";

export function useAuth() {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem(TOKEN_KEY)
  );

  const loginMutation = useMutation(api.auth.login);
  const logoutMutation = useMutation(api.auth.logout);

  const parent = useQuery(
    api.auth.getCurrentParent,
    token ? { token } : "skip"
  );

  async function login(email: string, password: string) {
    const result = await loginMutation({ email, password });
    localStorage.setItem(TOKEN_KEY, result.token);
    setToken(result.token);
  }

  async function logout() {
    if (token) {
      await logoutMutation({ token });
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
    }
  }

  return {
    parent,
    login,
    logout,
    isAuthenticated: !!parent,
    isLoading: parent === undefined,
  };
}
