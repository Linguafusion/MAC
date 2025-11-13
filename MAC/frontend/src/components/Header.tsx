import logoMac from "@/assets/logo-mac.jpg";
import logoIbnZohr from "@/assets/logo-ibn-zohr.png";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* MAC Logo */}
          <div className="flex items-center gap-3">
            <img 
              src={logoMac} 
              alt="Méthode MAC" 
              className="h-16 w-auto"
            />
            <span className="font-signature text-4xl text-accent">
              MAC Enquêtes
            </span>
          </div>
          
          {/* Ibn Zohr Logo */}
          <div className="flex items-center">
            <img 
              src={logoIbnZohr} 
              alt="Université Ibn Zohr" 
              className="h-12 w-auto"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
