import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUp, Settings, DollarSign, CreditCard, Package, Wrench } from "lucide-react";

const steps = [
  {
    icon: FileUp,
    title: "Send us your file",
    description: "or describe what you need — we can help with CAD if required.",
  },
  {
    icon: Settings,
    title: "Choose options",
    description: "(material, colour, layer height, infill, quantity).",
  },
  {
    icon: DollarSign,
    title: "Get an estimate",
    description: "and timeline. Prices are Approve",
  },
  {
    icon: CreditCard,
    title: "Approve & pay",
    description: "(card/invoice)",
  },
  {
    icon: Package,
    title: "Pick-up on the Central Coast NSW",
    description: "or we ship Australia-wide via AusPost.",
  },
];

const OrderingSection = () => {
  return (
    <section className="container mx-auto px-4 py-16 bg-muted/30">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4">Ordering with 3D Era Lab</h2>
        <p className="text-center text-muted-foreground mb-12">
          Simple process from file upload to delivery – we guide you every step of the way
        </p>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card key={index} className="relative">
                <CardHeader>
                  <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="bg-secondary/10 border-secondary">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-secondary" />
              <CardTitle>Design Support Available</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              If required, we can <strong>develop a new 3D model from your brief</strong> or{" "}
              <strong>edit/fix your existing file</strong> (e.g. wall thickness, tolerances, split-and-join for oversize parts, 
              thread inserts, DfM tweaks). This service is <strong>quoted separately</strong>.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default OrderingSection;
