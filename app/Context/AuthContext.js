// context/AuthContext.js
'use client';
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode }from "jwt-decode"; // Fixed import: use default import

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // New loading state
  const router = useRouter();

  const logout = useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    router.push("/");
  }, [router]);

  const refreshAccessToken = useCallback(async () => {
    const storedRefreshToken = localStorage.getItem("refreshToken");
    if (!storedRefreshToken) {
      logout();
      return;
    }
    try {
      const res = await fetch("/api/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: storedRefreshToken }),
      });
      if (!res.ok) {
        logout();
        return;
      }
      const data = await res.json();
      const newAccessToken = data.token;
      localStorage.setItem("accessToken", newAccessToken);
      const decoded = jwtDecode(newAccessToken);
      setUser(decoded);
    } catch (error) {
      console.error("Error refreshing token: ", error);
      logout();
    }
  }, [logout]);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        logout();
        setLoading(false); // finish loading even if not logged in
        return;
      }
      if (token) {
        try {
          const decoded = jwtDecode(token);
          if (decoded.exp * 1000 < Date.now()) {
            await refreshAccessToken();
          } else {
            setUser(decoded);
          }
        } catch (error) {
          console.error("Error decoding token", error);
          logout();
        }
      } else {
        logout();
      }
      setLoading(false); // Authentication check complete
    };

    checkAuth();

    const handleStorageChange = (event) => {
      if (event.key === "refreshToken" && !event.newValue) {
        logout();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [logout, refreshAccessToken]);

  const login = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("No token found in localStorage");
      return;
    }
    try {
      const decoded = jwtDecode(token);
      if (!decoded || !decoded.exp || decoded.exp * 1000 < Date.now()) {
        console.error("Invalid or expired token received");
        logout();
        return;
      }
      setUser(decoded);
      router.push("/");
    } catch (error) {
      console.error("Error during login in Auth context:", error);
      logout();
    }
  }, [logout, router]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
