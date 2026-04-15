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
import { EditModeProvider } from "@/lib/editMode";
import EditToolbar from "@/components/editor/EditToolbar";
import DraggableSectionList from "@/components/editor/DraggableSectionList";

const PricingSection = dynamic(
  () => import("@/components/landing/PricingSection"),
  { ssr: false }
);

// Maps every draggable section_key to its rendered JSX. The DraggableSectionList
// will choose the render order based on the `orden` column in the database,
// applying any pending drag-and-drop changes on top.
const SECTION_MAP = {
  hero:         <HeroSection />,
  trust_bar:    <TrustBar />,
  features:     <FeaturesSection />,
  showcase:     <ShowcaseSection />,
  benefits:     <BenefitsSection />,
  whatsapp_cta: <WhatsAppCTA />,
  industries:   <IndustriesSection />,
  pricing:      <PricingSection />,
  testimonials: <TestimonialsSection />,
  final_cta:    <FinalCTA />,
};

export default function Home() {
  return (
    <EditModeProvider>
      <AnnouncementBar />
      <Navbar />
      <main>
        <DraggableSectionList sectionMap={SECTION_MAP} />
      </main>
      <Footer />
      <WhatsAppButton />
      <EditToolbar />
    </EditModeProvider>
  );
}
