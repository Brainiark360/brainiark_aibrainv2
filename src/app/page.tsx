import AIFlowEngine from "@/components/landing/AiFlowEngineSection";
import BrandBrain from "@/components/landing/BrandBrainSection";
import DemoPreview from "@/components/landing/DemoPreviewSection";
import FeaturesGrid from "@/components/landing/FeaturesGridSection";
import Footer from "@/components/landing/Footer";
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import ProductStory from "@/components/landing/ProductStory";
import StrategyCanvasPreview from "@/components/landing/StrategyCanvasSection";


export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">
      <Header />
      <main className="mx-auto flex max-w-6xl flex-col gap-28 px-4 pb-24 pt-24 sm:px-6 lg:px-8 lg:pt-28">
        <Hero />
        <section className="border-t border-[rgb(var(--border))]/60 pt-16">
          <ProductStory />
        </section>
        <section className="border-t border-[rgb(var(--border))]/60 pt-16">
          <StrategyCanvasPreview />
        </section>
        <section className="border-t border-[rgb(var(--border))]/60 pt-16">
          <AIFlowEngine />
        </section>
        <section className="border-t border-[rgb(var(--border))]/60 pt-16">
          <BrandBrain />
        </section>
        <section className="border-t border-[rgb(var(--border))]/60 pt-16">
          <FeaturesGrid />
        </section>
        <section className="border-t border-[rgb(var(--border))]/60 pt-16">
          <DemoPreview />
        </section>
      </main>
      <Footer />
    </div>
  )
}