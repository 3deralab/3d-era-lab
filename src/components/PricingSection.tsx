import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";

const PricingSection = () => {
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Pricing Policy</h2>
        
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Base rates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <span className="font-medium">Standard quality</span>
                <span className="text-lg font-bold text-primary">$0.55/g</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <span className="font-medium">Fine quality (finer layers)</span>
                <span className="text-lg font-bold text-primary">$0.75/g</span>
              </div>
              <div className="flex justify-between items-center p-3 border-2 border-primary/20 rounded-lg">
                <span className="font-medium">Minimum charge</span>
                <span className="text-lg font-bold">$20.00 per order</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Material surcharges</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground mb-4">
                (add to the base rate per gram)
              </p>
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <span>ASA / ABS</span>
                <Badge>+ $0.10/g</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <span>TPU (flexible)</span>
                <Badge>+ $0.20/g</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <span>Nylon / CF-Nylon</span>
                <Badge>+ $0.35/g</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Bulk quantity discount (per identical part & settings)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">5+</div>
                <div className="text-sm text-muted-foreground mb-1">units</div>
                <div className="text-lg font-semibold">→ 10% off</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">20+</div>
                <div className="text-sm text-muted-foreground mb-1">units</div>
                <div className="text-lg font-semibold">→ 15% off</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">50+</div>
                <div className="text-sm text-muted-foreground mb-1">units</div>
                <div className="text-lg font-semibold">→ 25% off</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">100+</div>
                <div className="text-sm text-muted-foreground mb-1">units</div>
                <div className="text-lg font-semibold">→ 30% off</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 bg-primary/5 border-primary/20">
          <CardHeader>
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <CardTitle>Engineering-grade jobs (ASA / Nylon / CF-Nylon, large formats)</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">
              For functional parts in <strong>ASA, Nylon, or CF-Nylon</strong>, tight tolerances, or{" "}
              <strong>large-format</strong> builds, we provide an <strong>expert review & formal quote</strong> to ensure 
              the part is fit for purpose.
            </p>
            <p className="text-sm">
              We assess tolerances, orientation, expected loads, operating environment (UV/temperature/chemicals), and 
              any need for segmenting, jigs or revised print strategy.
            </p>
            <p className="text-sm">
              You&apos;ll receive a <strong>formal quote</strong> with lead time and risk notes. If scope needs adjustment, 
              we&apos;ll explain options before you approve.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Design support</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              If required, we can <strong>develop a new 3D model from your brief</strong> or{" "}
              <strong>edit/fix your existing file</strong> (e.g. wall thickness, tolerances, split-and-join for oversize parts, 
              thread inserts, DfM tweaks). This service is <strong>quoted separately</strong>.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick reference table (per gram)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Material / Quality</th>
                    <th className="text-center py-3 px-4">Standard ($/g)</th>
                    <th className="text-center py-3 px-4">Fine ($/g)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">PLA / PETG<br/><span className="text-xs text-muted-foreground">(no surcharge)</span></td>
                    <td className="text-center py-3 px-4 font-semibold">$0,55</td>
                    <td className="text-center py-3 px-4 font-semibold">$0,75</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">ASA / ABS<br/><span className="text-xs text-muted-foreground">(+$0.10/g)</span></td>
                    <td className="text-center py-3 px-4 font-semibold">$0,65</td>
                    <td className="text-center py-3 px-4 font-semibold">$0,85</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">TPU<br/><span className="text-xs text-muted-foreground">(+$0.20/g)</span></td>
                    <td className="text-center py-3 px-4 font-semibold">$0,75</td>
                    <td className="text-center py-3 px-4 font-semibold">$0,95</td>
                  </tr>
                  <tr className="hover:bg-muted/50">
                    <td className="py-3 px-4">Nylon / CF-Nylon<br/><span className="text-xs text-muted-foreground">(+$0.35/g)</span></td>
                    <td className="text-center py-3 px-4 font-semibold">$0,90</td>
                    <td className="text-center py-3 px-4 font-semibold">$1,10</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default PricingSection;
