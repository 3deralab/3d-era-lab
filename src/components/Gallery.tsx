import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery3 from "@/assets/gallery-3.jpg";
import gallery4 from "@/assets/gallery-4.jpg";

const images = [
  { src: gallery1, alt: "3D Printed Parts Collection" },
  { src: gallery2, alt: "Precision 3D Printing" },
  { src: gallery3, alt: "Various 3D Printed Prototypes" },
  { src: gallery4, alt: "3D Printing Laboratory" },
];

const Gallery = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <Link to="/gallery">
          <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
            <div className="relative h-[400px] bg-muted">
              <img
                src={images[currentIndex].src}
                alt={images[currentIndex].alt}
                className="w-full h-full object-cover transition-opacity duration-500"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-6">
                <p className="text-sm font-medium mb-2">
                  Explore our gallery of 50+ high-quality 3D printed projects (300dpi)
                </p>
                <Button variant="outline" size="sm" className="mb-4">
                  View Full Gallery
                </Button>
                <div className="flex gap-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentIndex(index);
                      }}
                      className={`h-2 rounded-full transition-all ${
                        index === currentIndex ? "w-8 bg-primary" : "w-2 bg-muted-foreground/50"
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </Link>
      </div>
    </section>
  );
};

export default Gallery;
