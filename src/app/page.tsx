"use client";

import dynamic from "next/dynamic";
import AnnouncementBar from "@/components/landing/AnnouncementBar";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import TrustBar from "@/components/landing/TrustBar";
import FeaturesSection from "@/components/landing/FeaturesSection";
import ShowcaseSection from "@/components/landing/ShowcaseSection";
import BenefitsSection from "@/components/landing/BenefitsSection";
import WhatsAppCTA from "@/components/landing/WhatsAppCTA";
import IndustriesSection from "@/components/landing/IndustriesSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";
import WhatsAppButton from "@/components/landing/WhatsAppButton";

const PricingSection = dynamic(
  () => import("@/components/landing/PricingSection"),
  { ssr: false }
);

export default function Home() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main>
        <HeroSection />
        <TrustBar />
        <FeaturesSection />
        <ShowcaseSection />
        <BenefitsSection />
        <WhatsAppCTA />
        <IndustriesSection />
        <PricingSection />
        <TestimonialsSection />
        <FinalCTA />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
