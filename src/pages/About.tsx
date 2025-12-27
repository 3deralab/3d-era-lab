import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Mail } from "lucide-react";
import { useEffect } from "react";

const About = () => {
  useEffect(() => {
    document.title = "About 3D Era Lab | 3D Printing Services";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Learn about 3D Era Lab's mission and expertise in professional 3D printing.");
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <section>
            <h1 className="text-4xl font-bold mb-4">About 3D Era Lab</h1>
            <p className="text-muted-foreground mb-6">
              We provide engineering-grade 3D printing with fast turnaround and meticulous quality control. From rapid prototyping to small-batch production, our team helps you move from idea to part quickly and reliably.
            </p>
            <ul className="grid md:grid-cols-3 gap-4">
              <li className="rounded-lg border bg-card p-4"><span className="block text-2xl font-semibold text-primary">500+</span><span className="text-sm text-muted-foreground">Projects</span></li>
              <li className="rounded-lg border bg-card p-4"><span className="block text-2xl font-semibold text-primary">24hr</span><span className="text-sm text-muted-foreground">Turnaround</span></li>
              <li className="rounded-lg border bg-card p-4"><span className="block text-2xl font-semibold text-primary">100+</span><span className="text-sm text-muted-foreground">Happy Clients</span></li>
            </ul>
          </section>

          <section>
            <Card>
              <CardHeader>
                <CardTitle>Contact Us</CardTitle>
                <CardDescription>
                  Get in touch with our team for any questions about 3D printing services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <a href="tel:0494190346" className="font-medium hover:text-primary transition-colors">
                      0494190346
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <a href="mailto:admin@3deralab.com.au" className="font-medium hover:text-primary transition-colors">
                      admin@3deralab.com.au
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
