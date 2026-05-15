import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { TrendingUp, Flame, Trophy } from "lucide-react"

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center px-4 pt-32 pb-20 overflow-hidden bg-[#0A0202]">
      {/* Background Gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,#ef444488_0%,transparent_70%)]"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_120%,#ef444466_0%,transparent_70%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#ef444422_0%,transparent_60%)]"></div>
      </div>

      <div className="container mx-auto relative z-20 text-center">
        {/* Main Content */}
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <h1 className="text-5xl md:text-8xl font-black text-white leading-tight tracking-tight">
            The #1 Protocol <br />
            for Real Adoption
          </h1>
          
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed opacity-90">
            The permissionless protocol 86,000 people are using to win by saving
          </p>
          
          <div className="flex justify-center pt-4">
            <Link href="/app">
              <Button className="bg-red-600 hover:bg-red-700 text-white px-10 py-7 text-xl font-bold rounded-full shadow-[0_0_30px_rgba(239,68,68,0.4)] transition-all hover:scale-110 active:scale-95">
                Launch DApp
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Floating 3D Assets (Matching Image) */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {/* Top Left: Stellar Coin */}
        <div className="absolute top-[15%] left-[10%] md:left-[15%] animate-float-slow opacity-80">
          <Image 
            src="/Stellar-Icon.png" 
            width={180} 
            height={180} 
            alt="Stellar Coin"
            className="drop-shadow-[0_0_20px_rgba(239,68,68,0.3)]"
          />
        </div>

        {/* Top Right: Stellar Coin (Smaller/Tilted) */}
        <div className="absolute top-[10%] right-[10%] md:right-[15%] animate-float-medium opacity-60">
          <Image 
            src="/Stellar-Icon.png" 
            width={110} 
            height={110} 
            alt="Stellar Coin"
            className="rotate-45 drop-shadow-[0_0_20px_rgba(239,68,68,0.3)]"
          />
        </div>

        {/* Left: Purple Gem */}
        <div className="absolute top-[45%] left-[5%] md:left-[12%] animate-float opacity-70">
          <Image 
            src="/images/diamond.png" 
            width={100} 
            height={100} 
            alt="Gem"
            className="drop-shadow-[0_0_30px_rgba(168,85,247,0.3)]"
          />
        </div>

        {/* Right: Gold Coin */}
        <div className="absolute top-[50%] right-[5%] md:right-[12%] animate-float-slow opacity-70">
          <Image 
            src="/images/coin-gold.png" 
            width={110} 
            height={110} 
            alt="Gold Coin"
            className="drop-shadow-[0_0_30px_rgba(234,179,8,0.3)]"
          />
        </div>
      </div>
    </section>
  )
}


