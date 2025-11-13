import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-scientific.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-24">
      {/* Background geometric pattern */}
      <div className="absolute inset-0 bg-gradient-primary opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--accent) / 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--accent) / 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px'
        }} />
      </div>

      {/* Hero Image Container */}
      <div className="relative w-full max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-8 animate-fade-in z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium animate-float">
              <Sparkles className="h-4 w-4" />
              Recherche Académique Moderne
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
              Méthode
              <span className="block bg-gradient-accent bg-clip-text text-transparent">
                MAC
              </span>
            </h1>
            
            <p className="text-lg lg:text-xl text-muted-foreground max-w-xl leading-relaxed">
              Une plateforme de recherche innovante qui combine enquêtes, analyses et visualisations pour transformer vos données en découvertes scientifiques.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button variant="hero" size="xl" className="group">
                Démarrer une enquête
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="hero-outline" size="xl">
                Découvrir la méthode
              </Button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative animate-fade-in-delay">
            <div className="absolute -inset-4 bg-gradient-accent opacity-20 blur-3xl rounded-full" />
            <img
              src={heroImage}
              alt="Recherche scientifique collaborative avec visualisations de données"
              className="relative rounded-2xl shadow-2xl shadow-accent/10 w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
