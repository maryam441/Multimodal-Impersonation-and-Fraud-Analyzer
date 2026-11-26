"use client";

import React, { useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { EvidenceStudioShell } from "@/components/EvidenceStudioShell";
import { Footer } from "@/components/Footer";

export default function Home() {
  const handleLaunch = () => {
    const el = document.getElementById("evidence-studio");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero onLaunch={handleLaunch} />
        <EvidenceStudioShell />
      </main>
      <Footer />
    </>
  );
}
