import { Database, LineChart, FileText } from "lucide-react";

const Introduction = () => {
  const features = [
    {
      icon: FileText,
      title: "Questionnaires",
      description: "Créez des enquêtes sophistiquées avec une interface intuitive",
    },
    {
      icon: Database,
      title: "Analyses",
      description: "Effectuez des calculs statistiques avancés sur vos données",
    },
    {
      icon: LineChart,
      title: "Visualisations",
      description: "Générez des graphiques et tableaux de bord interactifs",
    },
  ];

  return (
    <section className="relative py-24 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Introduction Text */}
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            La Méthode MAC
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Une méthodologie de recherche moderne qui intègre la collecte de données, 
            l'analyse statistique et la visualisation dans un flux de travail cohérent. 
            Conçue par des chercheurs, pour des chercheurs.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 animate-fade-in-delay">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="relative group p-8 rounded-xl bg-card border border-border hover:border-accent/50 transition-all duration-300 hover:shadow-glow"
              >
                <div className="absolute inset-0 bg-gradient-accent opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-300" />
                <div className="relative">
                  <div className="inline-flex p-3 rounded-lg bg-accent/10 text-accent mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Introduction;
