import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const Quote = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    materialType: "",
    printingAccuracy: "",
    infill: "",
    materialColor: "",
    file: null as File | null,
    comment: "",
  });

  const [errors, setErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    document.title = "Get a Quote | 3D Era Lab";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Request a 3D printing quote from 3D Era Lab.");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const newErrors: Record<string, boolean> = {};
    const requiredFields = [
      'firstName', 'lastName', 'phone', 'email', 
      'materialType', 'printingAccuracy', 'infill', 'materialColor'
    ];
    
    requiredFields.forEach(field => {
      if (!formData[field as keyof typeof formData]) {
        newErrors[field] = true;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill in all required fields");
      return;
    }

    setErrors({});
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('firstName', formData.firstName);
      formDataToSend.append('lastName', formData.lastName);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('materialType', formData.materialType);
      formDataToSend.append('printingAccuracy', formData.printingAccuracy);
      formDataToSend.append('infill', formData.infill);
      formDataToSend.append('materialColor', formData.materialColor);
      formDataToSend.append('comment', formData.comment);
      
      if (formData.file) {
        formDataToSend.append('attachment', formData.file);
      }

      const response = await fetch('https://3d-era-email-worker.3deralab.workers.dev', {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        toast.success("Quote request submitted successfully! We'll get back to you soon.");
        // Reset form
        setFormData({
          firstName: "",
          lastName: "",
          phone: "",
          email: "",
          materialType: "",
          printingAccuracy: "",
          infill: "",
          materialColor: "",
          file: null,
          comment: "",
        });
      } else {
        throw new Error('Failed to submit quote request');
      }
    } catch (error) {
      console.error('Error submitting quote:', error);
      toast.error("Failed to submit quote request. Please try again or contact us directly.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, file: e.target.files[0] });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Get a Quote</h1>
          <p className="text-muted-foreground mb-8">
            Fill out the form below and we'll get back to you with a quote as soon as possible.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Form Section */}
            <Card>
              <CardHeader>
                <CardTitle>Quote Request Form</CardTitle>
                <CardDescription>
                  All fields marked with * are required
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="firstName">Your First Name*</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => {
                        setFormData({ ...formData, firstName: e.target.value });
                        setErrors({ ...errors, firstName: false });
                      }}
                      required
                      className={`mt-1 ${errors.firstName ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    />
                  </div>

                  <div>
                    <Label htmlFor="lastName">Your Last Name*</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => {
                        setFormData({ ...formData, lastName: e.target.value });
                        setErrors({ ...errors, lastName: false });
                      }}
                      required
                      className={`mt-1 ${errors.lastName ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone*</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value });
                        setErrors({ ...errors, phone: false });
                      }}
                      required
                      className={`mt-1 ${errors.phone ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email*</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        setErrors({ ...errors, email: false });
                      }}
                      required
                      className={`mt-1 ${errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    />
                  </div>

                  <div>
                    <Label htmlFor="materialType">Select material type*</Label>
                    <Select
                      value={formData.materialType}
                      onValueChange={(value) => {
                        setFormData({ ...formData, materialType: value });
                        setErrors({ ...errors, materialType: false });
                      }}
                      required
                    >
                      <SelectTrigger className={`mt-1 ${errors.materialType ? 'border-destructive' : ''}`}>
                        <SelectValue placeholder="Choose material" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pla">PLA</SelectItem>
                        <SelectItem value="petg">PETG</SelectItem>
                        <SelectItem value="abs">ABS</SelectItem>
                        <SelectItem value="asa">ASA</SelectItem>
                        <SelectItem value="tpu">TPU</SelectItem>
                        <SelectItem value="nylon">Nylon</SelectItem>
                        <SelectItem value="cf-nylon">CF-Nylon</SelectItem>
                        <SelectItem value="not-sure">I'm not sure</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="printingAccuracy">Printing accuracy*</Label>
                    <Select
                      value={formData.printingAccuracy}
                      onValueChange={(value) => {
                        setFormData({ ...formData, printingAccuracy: value });
                        setErrors({ ...errors, printingAccuracy: false });
                      }}
                      required
                    >
                      <SelectTrigger className={`mt-1 ${errors.printingAccuracy ? 'border-destructive' : ''}`}>
                        <SelectValue placeholder="Choose accuracy" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="fine">Fine</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="infill">Infill*</Label>
                    <Select
                      value={formData.infill}
                      onValueChange={(value) => {
                        setFormData({ ...formData, infill: value });
                        setErrors({ ...errors, infill: false });
                      }}
                      required
                    >
                      <SelectTrigger className={`mt-1 ${errors.infill ? 'border-destructive' : ''}`}>
                        <SelectValue placeholder="Choose infill percentage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15%</SelectItem>
                        <SelectItem value="25">25%</SelectItem>
                        <SelectItem value="50">50%</SelectItem>
                        <SelectItem value="100">100%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="materialColor">Select material colour*</Label>
                    <Select
                      value={formData.materialColor}
                      onValueChange={(value) => {
                        setFormData({ ...formData, materialColor: value });
                        setErrors({ ...errors, materialColor: false });
                      }}
                      required
                    >
                      <SelectTrigger className={`mt-1 ${errors.materialColor ? 'border-destructive' : ''}`}>
                        <SelectValue placeholder="Choose color" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="white">White</SelectItem>
                        <SelectItem value="black">Black</SelectItem>
                        <SelectItem value="gray">Gray</SelectItem>
                        <SelectItem value="red">Red</SelectItem>
                        <SelectItem value="blue">Blue</SelectItem>
                        <SelectItem value="green">Green</SelectItem>
                        <SelectItem value="yellow">Yellow</SelectItem>
                        <SelectItem value="orange">Orange</SelectItem>
                        <SelectItem value="transparent">Transparent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="file">Attach file (3d model, photo, drawing, etc.)</Label>
                    <Input
                      id="file"
                      type="file"
                      onChange={handleFileChange}
                      accept=".stl,.obj,.step,.stp,.3mf,.png,.jpg,.jpeg,.pdf"
                      className="mt-1"
                    />
                    {formData.file && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Selected: {formData.file.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="comment">Comment, explanation to the order</Label>
                    <Textarea
                      id="comment"
                      value={formData.comment}
                      onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                      maxLength={1000}
                      rows={4}
                      className="mt-1"
                      placeholder="Any additional details about your order..."
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.comment.length}/1000 characters
                    </p>
                  </div>

                  <Button type="submit" className="w-full">
                    Submit Quote Request
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information Section */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Need Help?</CardTitle>
                  <CardDescription>
                    We will answer questions about 3D printing. Contact us in a way convenient for you.
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

              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-lg">What happens next?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>✓ We'll review your request within 24 hours</p>
                  <p>✓ You'll receive a detailed quote with pricing and timeline</p>
                  <p>✓ Once approved, we'll start printing your project</p>
                  <p>✓ Pick up on Central Coast NSW or Australia-wide shipping</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Quote;
