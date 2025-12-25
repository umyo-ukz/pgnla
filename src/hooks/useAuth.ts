import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";

const TOKEN_KEY = "pngla_session";
const ROLE_KEY = "pngla_role";

export function useAuth() {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem(TOKEN_KEY)
  );
  const role = localStorage.getItem(ROLE_KEY) as "parent" | "staff" | null;

  const loginParent = useMutation(api.auth.loginParent);
  const loginStaff = useMutation(api.auth.loginStaff);
  const logoutParent = useMutation(api.auth.logoutParent);
  const logoutStaff = useMutation(api.auth.logoutStaff);

  const parent = useQuery(
    api.auth.getCurrentParent,
    token && role === "parent" ? { token } : "skip"
  );

  const staff = useQuery(
    api.auth.getCurrentStaff,
    token && role === "staff" ? { token } : "skip"
  );

  async function loginAsParent(email: string, password: string) {
    const res = await loginParent({ email, password });
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(ROLE_KEY, "parent");
    setToken(res.token);
  }

  async function loginAsStaff(email: string, password: string) {
    const res = await loginStaff({ email, password });
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(ROLE_KEY, "staff");
    setToken(res.token);
  }

  async function logout() {
    if (!token || !role) return;

    if (role === "parent") await logoutParent({ token });
    if (role === "staff") await logoutStaff({ token });

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    setToken(null);
  }

  return {
    parent,
    staff,
    role,
    loginAsParent,
    loginAsStaff,
    logout,
    isAuthenticated: !!parent || !!staff,
  };
}
