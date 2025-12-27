import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useEffect } from "react";

const Contact = () => {
  useEffect(() => {
    document.title = "Contact | 3D Era Lab";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Contact 3D Era Lab for 3D printing quotes, questions, and support.");
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent (demo)");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <section className="max-w-xl">
          <h1 className="text-4xl font-bold mb-6">Contact</h1>
          <form onSubmit={onSubmit} className="space-y-4 rounded-lg border bg-card p-6">
            <div>
              <label className="mb-2 block text-sm">Name</label>
              <Input placeholder="Your name" required />
            </div>
            <div>
              <label className="mb-2 block text-sm">Email</label>
              <Input type="email" placeholder="you@example.com" required />
            </div>
            <div>
              <label className="mb-2 block text-sm">Message</label>
              <Textarea placeholder="How can we help?" required />
            </div>
            <Button type="submit" className="w-full">Send Message</Button>
          </form>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
