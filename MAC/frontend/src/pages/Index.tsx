import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Introduction from "@/components/Introduction";
import LearningSection from "@/components/LearningSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background font-['Inter',sans-serif]">
      <Header />
      <Hero />
      <Introduction />
      <LearningSection />
      <Footer />
    </div>
  );
};

export default Index;
