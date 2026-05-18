import HeroSection from "@/components/HeroSection";
import MenuSection from "@/components/MenuSection";
import BonusBanner from "@/components/BonusBanner";
import AboutSection from "@/components/AboutSection";
import ReviewsSection from "@/components/ReviewsSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <BonusBanner />
      <HeroSection />
      <MenuSection />
      <AboutSection />
      <ReviewsSection />
      <Footer />
    </>
  );
}
