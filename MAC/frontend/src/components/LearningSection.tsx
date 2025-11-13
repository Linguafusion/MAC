import { BookOpen, Lightbulb, FileText, GraduationCap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import guideImage from "@/assets/learning-guide.jpg";
import innovationImage from "@/assets/learning-innovation.jpg";
import statisticsImage from "@/assets/learning-statistics.jpg";
import advancedImage from "@/assets/learning-advanced.jpg";

const LearningSection = () => {
  const learningResources = [
    {
      icon: BookOpen,
      title: "Guide de démarrage",
      description: "Les bases de la Méthode MAC expliquées simplement",
      type: "Article",
      duration: "10 min",
      image: guideImage,
    },
    {
      icon: Lightbulb,
      title: "Articles sur les innovations",
      description: "Découvrez les dernières avancées en recherche",
      type: "Article",
      duration: "20 min",
      image: innovationImage,
    },
    {
      icon: FileText,
      title: "Analyse statistique",
      description: "Interpréter vos résultats avec confiance",
      type: "Article",
      duration: "15 min",
      image: statisticsImage,
    },
    {
      icon: GraduationCap,
      title: "Méthodologie avancée",
      description: "Approfondir vos connaissances en recherche",
      type: "Cours",
      duration: "2h",
      image: advancedImage,
    },
  ];

  return (
    <section className="relative py-24 px-6 lg:px-8 bg-muted/30">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-6">
            <GraduationCap className="h-4 w-4" />
            Formation
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Apprendre
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Découvrez la méthodologie MAC à travers nos ressources pédagogiques 
            conçues pour vous accompagner à chaque étape de votre recherche.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-delay">
          {learningResources.map((resource, index) => {
            const Icon = resource.icon;
            return (
              <Card 
                key={index}
                className="group hover:shadow-glow transition-all duration-300 cursor-pointer hover:-translate-y-1 border-border hover:border-accent/50 overflow-hidden"
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={resource.image} 
                    alt={resource.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                  <div className="absolute bottom-4 left-4 inline-flex p-3 rounded-lg bg-accent/90 text-accent-foreground shadow-lg">
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
                <CardHeader>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <span className="px-2 py-1 rounded-md bg-primary/10 text-primary font-medium">
                      {resource.type}
                    </span>
                    <span>•</span>
                    <span>{resource.duration}</span>
                  </div>
                  <CardTitle className="text-lg">{resource.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {resource.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default LearningSection;
