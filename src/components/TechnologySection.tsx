import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

const TechnologySection = () => {
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">What is 3D Printing?</h2>
        
        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                3D printing builds physical parts layer-by-layer from a digital model. It&apos;s ideal for one-offs, 
                prototypes and short runs, letting you create shapes that are difficult or impossible with traditional methods.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Materials & Properties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                We work with engineering-grade plastics that can be:
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-sm">rigid or flexible</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-sm">heat-resistant or UV-resistant</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-sm">opaque or translucent</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-sm">sharp-edged or smoothly contoured</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Typical layer height starts from <strong>0.10 mm</strong>, so fine details are achievable when needed.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How it works (simple)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Create or provide a 3D model</p>
                    <p className="text-sm text-muted-foreground">(e.g. STL/3MF/OBJ)</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">We slice the file</p>
                    <p className="text-sm text-muted-foreground">into layers and set print parameters (material, colour, layer height, infill).</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">The printer deposits material</p>
                    <p className="text-sm text-muted-foreground">through a heated nozzle, building the part from the bottom up.</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Optional finishing</p>
                    <p className="text-sm text-muted-foreground">(sanding, priming, painting, clear-coat) to suit your use case.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Practical limits (and easy workarounds)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Build size</h4>
                <p className="text-sm text-muted-foreground">
                  for a single piece is typically up to <strong>340 x 320 x 340 mm</strong>.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Larger items are split into precise sections and bonded. With accurate alignment and modern 
                  adhesives, joins are discreet (especially after painting) and have minimal impact on strength.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Dual-material/colour:</h4>
                <p className="text-sm text-muted-foreground">
                  We can print in one or two materials/colours at a time.
                </p>
                <p className="text-sm text-muted-foreground">
                  Full-colour outcomes are achieved through post-finishing/painting if required.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">UV exposure:</h4>
                <p className="text-sm text-muted-foreground">
                  Most plastics age in direct sunlight over time. For outdoor use, we recommend <strong>UV-stable materials</strong> or 
                  a protective paint/clear-coat.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Heat:</h4>
                <p className="text-sm text-muted-foreground">
                  Standard printing plastics soften from <strong>~180 °C</strong>; practical service temps are <strong>below ~150 °C</strong>. 
                  If you&apos;re unsure, ask us for material guidance.†
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Why it&apos;s useful</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                <li>Rapid prototypes and functional test parts</li>
                <li>Jigs, fixtures and brackets for the workshop</li>
                <li>Custom décor and signage (e.g. wedding toppers, name plates)</li>
                <li>Low-volume end-use parts without tooling costs</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>File tips for best results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Export to <strong>STL or 3MF</strong> with a watertight (manifold) mesh.
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Wall thickness:</strong> generally <strong>≥ 1.2 mm</strong> for rigid parts (we&apos;ll advise case-by-case).
              </p>
              <p className="text-sm text-muted-foreground">
                Include notes: target strength, cosmetic needs, and whether you&apos;ll paint the part.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default TechnologySection;
