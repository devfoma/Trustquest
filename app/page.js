
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import SavingAndWinning from "@/components/SavingAndWinning";
import WhyPrizeSavings from "@/components/WhyPrizeSavings";
import Stats from "@/components/Stats";
import Footer from "@/components/Footer";
import Roadmap from "@/components/Roadmap";
import Technology from "@/components/Technology";
import FAQ from "@/components/FAQ";
import GetInvolved from "@/components/GetInvolved";
import SupportedChains from "@/components/SupportedChains";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#100202] to-black text-white relative overflow-hidden">
      {/* Global Background Glows */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-[20%] left-[-5%] w-[400px] h-[400px] bg-red-600/10 rounded-full blur-[100px]"></div>
      </div>

      <Navbar />
      <main className="pt-16 relative z-10">
        <Hero />
        <Stats />
        <SupportedChains />
        <SavingAndWinning />
        <WhyPrizeSavings />
        <Technology />
        <Roadmap />
        <GetInvolved />
        <FAQ />
      </main>

      <Footer />
    </div>
  );
}
