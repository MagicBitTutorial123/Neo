"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import SideNavbar from "@/components/SideNavbar";
import { useSidebar } from "@/context/SidebarContext";

const splitName = (full: string) => {
  const parts = (full || "").trim().split(/\s+/);
  const first = parts.shift() ?? "";
  const last = parts.join(" ");
  return { first, last };
};
const joinName = (first: string, last: string) =>
  [first.trim(), last.trim()].filter(Boolean).join(" ");

export default function SettingsPage() {
  const { sidebarCollapsed } = useSidebar();

  // Header
  const [displayName, setDisplayName] = useState("User");

  //
  const [avatar, setAvatar] = useState<string>(() => {
    if (typeof window === "undefined") return "/Avatar01.png";
    try {
      const a = (localStorage.getItem("avatar") || "").trim();
      return a ? (a.startsWith("/") ? a : `/${a}`) : "/Avatar01.png";
    } catch {
      return "/Avatar01.png";
    }
  });

  // form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");

  const [whereEmail, setWhereEmail] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  // Prefill from localStorage once
  useEffect(() => {
    try {
      const n = (localStorage.getItem("name") || "").trim();
      const e = (localStorage.getItem("email") || "").trim();
      const p = (
        localStorage.getItem("fullPhone") ||
        localStorage.getItem("phone") ||
        ""
      ).trim();
      const b = localStorage.getItem("bio") || "";

      if (n) {
        const { first, last } = splitName(n);
        setFirstName(first);
        setLastName(last);
        setDisplayName(n);
      }
      if (e) {
        setEmail(e);
        setWhereEmail(e);
      }
      if (p) setPhone(p);
      if (b) setBio(b);
    } catch {
      /* ignore */
    }
  }, []);

  // ✅ Keep avatar in sync if another page/tab updates it
  useEffect(() => {
    const load = () => {
      try {
        const a = (localStorage.getItem("avatar") || "").trim();
        if (a) setAvatar(a.startsWith("/") ? a : `/${a}`);
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("focus", load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("focus", load);
      window.removeEventListener("storage", load);
    };
  }, []);

  const fullName = useMemo(
    () => joinName(firstName, lastName),
    [firstName, lastName]
  );
  const emailValid = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    [email]
  );
  const phoneValid = useMemo(() => /^[0-9+\s-]{7,}$/.test(phone), [phone]);
  const canSave = !!firstName.trim() && emailValid && phoneValid && !saving;

  const handleSave = async () => {
    setError(null);
    setOk(null);
    if (!canSave) return;

    const targetEmail = (whereEmail || email || "").trim();
    if (!targetEmail) {
      setError(
        "No original email (whereEmail) found. Please reload or log in again."
      );
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, string> = {
        whereEmail: targetEmail,
        name: fullName.trim(), // store full name in 'name'
        email: email.trim(),
        phone: phone.trim(),
      };

      const res = await fetch("http://127.0.0.1:5000/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.message || "Failed to update profile");
        return;
      }

      // Sync localStorage
      localStorage.setItem("name", fullName.trim());
      localStorage.setItem("email", email.trim());
      localStorage.setItem("phone", phone.trim());
      if (bio.trim()) localStorage.setItem("bio", bio.trim());

      setWhereEmail(email.trim());
      setDisplayName(fullName.trim());
      setOk("Profile updated!");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F6F8FC]">
      <SideNavbar />
      <main
        className="flex-1 px-6 lg:px-8 xl:px-10 py-8 transition-all duration-300 ease-in-out"
        style={{
          marginLeft: sidebarCollapsed ? "80px" : "260px",
        }}
      >
        <div className="w-full flex flex-col lg:flex-row gap-6">
          {/* Left tabs */}
          <aside className="lg:w-[280px] w-full shrink-0">
            <div className="rounded-[24px] bg-white shadow-sm border border-[#EEF2F7] p-6 min-h-[560px]">
              <nav className="flex flex-col gap-2 h-full">
                <button className="w-full text-left px-5 py-5 rounded-[14px] bg-[#F3F8FF] text-[#00AEEF] font-semibold border border-[#CFE2FF]">
                  My Profile
                </button>
                <button className="w-full text-left px-5 py-5 rounded-[14px] hover:bg-[#F8FAFC] text-[#0F172A]/70">
                  Security
                </button>
                <button className="w-full text-left px-5 py-5 rounded-[14px] hover:bg-[#F8FAFC] text-[#0F172A]/70">
                  Subscription
                </button>
                <button className="w-full text-left px-5 py-5 rounded-[14px] hover:bg-[#F8FAFC] text-[#EF4444]">
                  Delete Account
                </button>
                <div className="flex-1" />
              </nav>
            </div>
          </aside>

          {/* Right pane */}
          <section className="flex-1 flex flex-col gap-6">
            {/* Header card */}
            <div className="rounded-[24px] bg-white shadow-sm border border-[#EEF2F7] px-6 md:px-10 py-6 md:py-7">
              <div className="flex items-center gap-4 md:gap-6">
                <div className="w-[82px] h-[82px] relative">
                  <Image
                    src={avatar}
                    alt="Avatar"
                    fill
                    className="rounded-full object-cover bg-[#FFF7E6] p-2"
                  />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-[34px] md:text-[40px] leading-none font-extrabold text-[#0F172A]">
                    {displayName}
                  </h1>
                  <p className="mt-1 text-[15px] text-[#6B7280]">
                    {bio || "No bio set"}
                  </p>
                </div>
              </div>
            </div>

            {/* Editable form */}
            <div className="rounded-[24px] bg-white shadow-sm border border-[#EEF2F7] p-5 md:p-7">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[18px] md:text-[20px] font-extrabold text-[#0F172A]">
                  Personal Information
                </h2>
                <button
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
                    canSave
                      ? "border-[#E5E7EB] hover:bg-[#F8FAFC]"
                      : "border-[#E5E7EB] opacity-60 cursor-not-allowed"
                  } text-[14px] text-[#0F172A]`}
                  onClick={handleSave}
                  disabled={!canSave}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>

              {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
              {ok && <p className="mb-4 text-sm text-green-600">{ok}</p>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-10">
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-[#6B7280]">First Name</label>
                  <input
                    type="text"
                    className="rounded-xl border border-[#E5E7EB] px-4 py-3 outline-none focus:ring-2 focus:ring-[#CFE2FF] focus:border-[#93C5FD] text-black"
                    value={firstName}
                    onChange={(ev) => setFirstName(ev.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-[#6B7280]">Last Name</label>
                  <input
                    type="text"
                    className="rounded-xl border border-[#E5E7EB] px-4 py-3 outline-none focus:ring-2 focus:ring-[#CFE2FF] focus:border-[#93C5FD] text-black"
                    value={lastName}
                    onChange={(ev) => setLastName(ev.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-[#6B7280]">Email</label>
                  <input
                    type="email"
                    className="rounded-xl border border-[#E5E7EB] px-4 py-3 outline-none focus:ring-2 focus:ring-[#CFE2FF] focus:border-[#93C5FD] text-black"
                    value={email}
                    onChange={(ev) => setEmail(ev.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-[#6B7280]">Phone</label>
                  <input
                    type="tel"
                    className="rounded-xl border border-[#E5E7EB] px-4 py-3 outline-none focus:ring-2 focus:ring-[#CFE2FF] focus:border-[#93C5FD] text-black"
                    value={phone}
                    onChange={(ev) => setPhone(ev.target.value)}
                  />
                </div>
                <div className="md:col-span-2 flex flex-col gap-1">
                  <label className="text-sm text-[#6B7280]">Bio</label>
                  <textarea
                    className="rounded-xl border border-[#E5E7EB] px-4 py-3 outline-none focus:ring-2 focus:ring-[#CFE2FF] focus:border-[#93C5FD] min-h-[90px] text-black"
                    value={bio}
                    onChange={(ev) => setBio(ev.target.value)}
                    placeholder="(Optional — stored only in localStorage for now)"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
