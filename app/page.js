'use client'
import React from "react";
import Hero from "./components/Hero";
import Header from "./components/Header";
import { useAuth } from "./Context/AuthContext";

export default function Home() {
  const { user, login, logout } = useAuth();

  return (
    <div className="flex flex-col h-screen">
      <header className="w-full">
        <Header isLoggedIn={!!user} />
      </header>

      <main className="flex-grow flex items-center justify-center">
        {user ? (
          // Render UI for logged-in users
          <div>
            <h1>Welcome, {user.email}</h1>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500 text-white rounded"
            >
              Logout
            </button>
          </div>
        ) : (
          <Hero login={login} />
        )}
      </main>
    </div>
  );
}
