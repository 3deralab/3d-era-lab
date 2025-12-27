import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Gallery from "@/components/Gallery";
import ServicesCards from "@/components/ServicesCards";
import TechnologySection from "@/components/TechnologySection";
import OrderingSection from "@/components/OrderingSection";
import PricingSection from "@/components/PricingSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Gallery />
      <ServicesCards />
      <div id="technology-section">
        <TechnologySection />
      </div>
      <div id="ordering-section">
        <OrderingSection />
      </div>
      <div id="pricing-section">
        <PricingSection />
      </div>
      <Footer />
    </div>
  );
};

export default Index;
