import { Mail, Building2 } from "lucide-react";
import logoAgence from "@/assets/logo-agence.jpg";

const Footer = () => {
  return (
    <footer className="relative py-12 px-6 lg:px-8 border-t border-border bg-card/50">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-12 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">
              Méthode <span className="text-accent">MAC</span>
            </h3>
            <p className="text-sm text-muted-foreground">
              Transformez vos données en découvertes scientifiques avec notre plateforme de recherche moderne.
            </p>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Contact</h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-accent" />
                <a href="mailto:contact@methodemac.fr" className="hover:text-accent transition-colors">
                  contact@methodemac.fr
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-accent" />
                <span>Université & Recherche</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Ressources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  Guide utilisateur
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  Publications
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">© 2025 Méthode MAC. Plateforme de recherche académique.</p>
            <img 
              src={logoAgence} 
              alt="Agence Universitaire de la Francophonie" 
              className="h-12 w-auto"
            />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
