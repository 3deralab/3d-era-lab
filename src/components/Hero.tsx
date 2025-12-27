import { Button } from "@/components/ui/button";
import { ArrowRight, Upload } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="3D Printing Technology"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/30" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
            Professional <span className="text-primary">3D Printing</span> Services
          </h1>
          <p className="text-xl text-muted-foreground mb-8 animate-fade-in">
            From rapid prototypes to engineering-grade parts. Layer-by-layer precision with premium materials.
          </p>
          <div className="flex flex-wrap gap-4 animate-fade-in">
            <Link to="/quote">
              <Button size="lg" className="group">
                Get a Quote
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            {/* <Link to="/upload">
              <Button size="lg" variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Upload Model
              </Button>
            </Link> */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
