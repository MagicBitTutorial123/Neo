"use client";

import React, { useState, FormEvent, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing token.");
    }
  }, [token]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!token) {
      setError("Missing token.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:5000/api/auth/confirm-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message || "Password reset successfully. You can now log in.");
        setPassword("");
        setConfirm("");
      } else {
        setError(data.message || "Failed to reset password.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again later.");
      console.error("Reset password error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-4">Reset Password</h1>

        {message && <p className="text-green-600 mb-2">{message}</p>}
        {error && <p className="text-red-600 mb-2">{error}</p>}

        <label className="block mb-2 text-sm font-medium">New Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-gray-300 rounded p-2 w-full mb-4"
          placeholder="Enter new password"
          disabled={loading}
        />

        <label className="block mb-2 text-sm font-medium">Confirm Password</label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="border border-gray-300 rounded p-2 w-full mb-4"
          placeholder="Confirm new password"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white py-2 px-4 rounded w-full disabled:bg-blue-300"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </main>
  );
}
