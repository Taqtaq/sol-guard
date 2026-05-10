import { LandingNav } from "@/components/landing/LandingNav";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { SocialProof } from "@/components/landing/SocialProof";
import { Footer } from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <div className="bg-black min-h-screen">
      <LandingNav />
      <Hero />
      <HowItWorks />
      <SocialProof />
      <Footer />
    </div>
  );
}
