// hooks/useAuth.ts
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";
import { Id } from "../../convex/_generated/dataModel";

const TOKEN_KEY = "pngla_session";

interface User {
  _id: Id<"users">;
  fullName: string;
  email: string;
  role: "admin" | "staff" | "parent";
  _creationTime: number;
  passwordHash: string;
  isActive: boolean;
}

export function useAuth() {
  const [token, setTokenState] = useState<string | null>(
    localStorage.getItem(TOKEN_KEY)
  );
  const [immediateUser, setImmediateUser] = useState<User | null>(null);
  const loginMutation = useMutation(api.auth.login);
  const logoutMutation = useMutation(api.auth.logout);
  const userFromQuery = useQuery(
    api.auth.getCurrentUser,
    token ? { token } : "skip"
  );

  useEffect(() => {
    if (userFromQuery && (!immediateUser || userFromQuery._id !== immediateUser._id)) {
      setImmediateUser(userFromQuery);
    }
  }, [userFromQuery, immediateUser]);

  async function login(email: string, password: string) {
    const res = await loginMutation({ email, password });
    localStorage.setItem(TOKEN_KEY, res.token);
    setTokenState(res.token);

    const user: User = {
      _id: res.user.id,
      fullName: res.user.fullName,
      email: res.user.email,
      role: res.role as "admin" | "staff" | "parent",
      _creationTime: Date.now(),
      passwordHash: "",
      isActive: true,
    };

    setImmediateUser(user);
    // Dispatch auth state change event
    window.dispatchEvent(new CustomEvent('authstatechange', { detail: user }));
    return user;
  }

  async function logout() {
    if (!token) return;
    await logoutMutation({ token });
    localStorage.removeItem(TOKEN_KEY);
    setTokenState(null);
    setImmediateUser(null);
    window.dispatchEvent(new Event('authstatechange'));
    window.location.href = '/login';
  }

  const user = immediateUser || userFromQuery || null;

  return {
    user,
    role: user?.role,
    token,
    login,
    logout,
    isLoading: userFromQuery === undefined,
    isAuthenticated: !!user,
  };
}
