'use client'

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode"; // Make sure you're importing jwtDecode correctly

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const router = useRouter();

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    router.push('/');
  };

  const refreshAccessToken = async () => {
    const storedRefreshToken = localStorage.getItem('refreshToken');
    if (!storedRefreshToken) {
      logout();
      return;
    }

    try {
      const res = await fetch('/api/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: storedRefreshToken })
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
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          refreshAccessToken();
        } else {
          setUser(decoded);
        }
      } catch (error) {
        console.error("Error decoding token", error);
        logout();
      }
    } else {
      router.push('/');
    }
  }, []);

  const login = async () => {
    const token = localStorage.getItem('accessToken');
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
      router.push('/');
    } catch (error) {
      console.error('Error during login in Auth context:', error);
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
