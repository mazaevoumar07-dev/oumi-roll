import HeroSection from "@/components/HeroSection";
import MenuSection from "@/components/MenuSection";
import BonusBanner from "@/components/BonusBanner";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <BonusBanner />
      <HeroSection />
      <MenuSection />
      <Footer />
    </>
  );
}
