import Header from "@/components/common/Header";
import HeroSection from "@/components/common/HeroSection";
import GatesSection from "@/components/common/GatesSection";
import Footer from "@/components/common/Footer";
import ScrollToTop from "@/components/common/ScrollToTop";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <GatesSection />
      <Footer />
      <ScrollToTop />
    </div>
  );
}
