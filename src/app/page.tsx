import HeroSection from "@/components/common/HeroSection";
import GatesSection from "@/components/common/GatesSection";
import ScrollToTop from "@/components/common/ScrollToTop";

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <GatesSection />
      <ScrollToTop />
    </div>
  );
}
