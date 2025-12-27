import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";
import ThemeToggle from "./ThemeToggle";

const Header = () => {
  return (
    <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img 
              src={logo} 
              alt="3D Era Lab" 
              className="h-16 w-auto object-contain"
            />
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/gallery" className="text-foreground hover:text-primary transition-colors">
              Gallery
            </Link>
            <Link to="/about" className="text-foreground hover:text-primary transition-colors">
              About
            </Link>
            <Link to="/quote" className="text-foreground hover:text-primary transition-colors">
              Get a Quote
            </Link>
            {/* <Link to="/upload" className="text-foreground hover:text-primary transition-colors">
              Upload Model
            </Link> */}
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
