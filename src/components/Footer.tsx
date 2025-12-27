import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="bg-card border-t mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <img 
              src={logo} 
              alt="3D Era Lab" 
              className="h-14 w-auto object-contain mb-4"
            />
            <p className="text-sm text-muted-foreground">
              Professional 3D printing services with engineering-grade materials.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <div className="space-y-2">
              <Link to="/" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Home
              </Link>
              <Link to="/about" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                About
              </Link>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <div className="space-y-2">
              <Link to="/quote" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Get a Quote
              </Link>
              {/* <Link to="/upload" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Upload Model
              </Link> */}
            </div>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 3D Era Lab. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
