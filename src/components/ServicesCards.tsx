import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Cpu, ShoppingCart, DollarSign } from "lucide-react";

const services = [
  {
    title: "About 3D Printing Technology",
    description: "Learn about our engineering-grade materials and layer-by-layer precision manufacturing",
    icon: Cpu,
  },
  {
    title: "How to Order",
    description: "Simple process from file upload to delivery - we guide you every step of the way",
    icon: ShoppingCart,
  },
  {
    title: "Materials & Pricing",
    description: "Transparent pricing with bulk discounts - from $0.55/g with premium material options",
    icon: DollarSign,
  },
];

const ServicesCards = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const sectionIds = ['technology-section', 'ordering-section', 'pricing-section'];

  return (
    <section className="container mx-auto px-4 py-16 bg-muted/30">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {services.map((service, index) => {
          const Icon = service.icon;
          return (
            <Card
              key={index}
              onClick={() => scrollToSection(sectionIds[index])}
              className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{service.title}</CardTitle>
                <CardDescription className="text-base mt-2">
                  {service.description}
                </CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </section>
  );
};

export default ServicesCards;
