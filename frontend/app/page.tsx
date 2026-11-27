"use client";

import React from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { EvidenceStudioShell } from "@/components/EvidenceStudioShell";
import { AmbientShieldHub } from "@/components/ambient/AmbientShieldHub";
import { Footer } from "@/components/Footer";
import { MobileNavBar } from "@/components/mobile/MobileNavBar";
import { PwaInstallPrompt } from "@/components/mobile/PwaInstallPrompt";

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
        <AmbientShieldHub />
      </main>
      <Footer />
      {/* Mobile-Specific App Navigation & PWA Install Banner */}
      <MobileNavBar />
      <PwaInstallPrompt />
    </>
  );
}
