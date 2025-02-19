'use client'

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

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
      console.log("Error refreshing token: ", error);
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
        console.log("Error decoding token", error);
        logout();
      }
    } else {
      router.push('/');
    }
  }, []);

  const login = async ({ email, password }) => {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        throw new Error('Login Failed');
      }

      const { token, refreshToken } = await res.json();

      // Ensure tokens are present.
      if (!token || !refreshToken) {
        console.error("Missing tokens in login response");
        return;
      }

      localStorage.setItem('accessToken', token);
      localStorage.setItem('refreshToken', refreshToken);

      // Decode and validate the access token.
      const decoded = jwtDecode(token);
      if (!decoded || !decoded.exp || decoded.exp * 1000 < Date.now()) {
        console.error("Invalid or expired token received");
        logout();
        return;
      }

      setUser(decoded);
      router.push('/dashboard');
    } catch (error) {
      console.log('Login error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
