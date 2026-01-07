// hooks/useAuth.ts
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react"; // Add useEffect
import { Id } from "../../convex/_generated/dataModel";

const TOKEN_KEY = "pngla_session";

interface User {
  _id: Id<"users">;  // Changed back to _id to match the query response
  fullName: string;
  email: string;
  role: "admin" | "staff" | "parent";
  _creationTime: number;
  passwordHash: string;
  isActive: boolean;
}



export function useAuth() {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem(TOKEN_KEY)
  );
  const [immediateUser, setImmediateUser] = useState<User | null>(null); // New state

  const loginMutation = useMutation(api.auth.login);
  const logoutMutation = useMutation(api.auth.logout);

  const userFromQuery = useQuery(
    api.auth.getCurrentUser,
    token ? { token } : "skip"
  );

  // Sync query user with immediate user
  // Sync query user with immediate user
  useEffect(() => {
    if (userFromQuery && (!immediateUser || userFromQuery._id !== immediateUser._id)) {
      setImmediateUser(userFromQuery);
    }
  }, [userFromQuery, immediateUser]);


  async function login(email: string, password: string) {
    const res = await loginMutation({ email, password });
    localStorage.setItem(TOKEN_KEY, res.token);
    setToken(res.token);

    // Create a properly typed user object from the response
    const user: User = {
      _id: res.user.id,
      fullName: res.user.fullName,
      email: res.user.email,
      role: "parent", // Default role - should be updated based on your auth logic
      _creationTime: Date.now(),
      passwordHash: "",
      isActive: true,
    };

    setImmediateUser(user);
    return user;
  }



  async function logout() {
    if (!token) return;
    await logoutMutation({ token });
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setImmediateUser(null); // Clear immediate user on logout
  }

  // Use immediateUser first, fall back to query user
  const user = immediateUser || userFromQuery || null;

  return {
    user,
    role: user?.role,
    login,
    logout,
    isLoading: userFromQuery === undefined, // Make sure this exists
    isAuthenticated: !!user,
  };
}