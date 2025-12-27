import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Upload as UploadIcon, FileIcon, Info, HelpCircle } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import ModelViewer3D, { ParsedModelInfo } from "@/components/ModelViewer3D";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

// Pricing data based on material and quality ($/g)
const PRICING = {
  'pla-petg': { standard: 0.55, fine: 0.75 },
  'asa-abs': { standard: 0.65, fine: 0.85 },
  'tpu': { standard: 0.75, fine: 0.95 },
  'nylon-cf': { standard: 0.90, fine: 1.10 },
};

// Material densities (g/cm³) - average for grouped materials
const MATERIAL_DENSITY = {
  'pla-petg': 1.255,  // Average of PLA (1.24) and PETG (1.27)
  'asa-abs': 1.055,   // Average of ASA (1.07) and ABS (1.04)
  'tpu': 1.21,
  'nylon-cf': 1.22,   // Average of Nylon (1.14) and CF-Nylon (1.30)
};

// Material display names
const MATERIAL_NAMES = {
  'pla-petg': 'PLA / PETG',
  'asa-abs': 'ASA / ABS',
  'tpu': 'TPU',
  'nylon-cf': 'Nylon / CF-Nylon',
};

const Upload = () => {
  const [showUploadSection] = useState(false); // Hidden for now, set to true to show
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [material, setMaterial] = useState<string>("pla-petg");
  const [quality, setQuality] = useState<string>("standard");
  const [modelInfo, setModelInfo] = useState<(ParsedModelInfo & { weight: number }) | null>(null);
  const [useOpenShell, setUseOpenShell] = useState<boolean>(true);
  const [wallThicknessMm, setWallThicknessMm] = useState<number>(2.2);
  const [bottomThicknessMm, setBottomThicknessMm] = useState<number>(2.4);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = "Upload Model | 3D Era Lab";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Upload your 3D model (.stl, .obj) and get instant pricing.");
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.stl') || droppedFile.name.endsWith('.obj'))) {
      processFile(droppedFile);
    } else {
      toast.error("Please upload a .stl or .obj file");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const processFile = (uploadedFile: File) => {
    setFile(uploadedFile);
    toast.success(`Model uploaded: ${uploadedFile.name}`);
  };

const handleModelParsed = (info: ParsedModelInfo) => {
  const density = MATERIAL_DENSITY[material as keyof typeof MATERIAL_DENSITY] || 1.24;
  const vol = getEffectiveVolumeCm3(info);
  const weight = vol * density;
  setModelInfo({
    volumeCm3: info.volumeCm3,
    surfaceAreaCm2: info.surfaceAreaCm2,
    bboxVolumeCm3: info.bboxVolumeCm3,
    polygons: info.polygons,
    weight,
    dimensionsCm: info.dimensionsCm,
  });
};

// Helper: effective volume (cm³)
const getEffectiveVolumeCm3 = (info: ParsedModelInfo | (ParsedModelInfo & { weight: number })) => {
  if (!useOpenShell) return info.volumeCm3;
  const lx = info.dimensionsCm.x * 10; // to mm
  const ly = info.dimensionsCm.y * 10;
  const lz = info.dimensionsCm.z * 10;
  const outerMm3 = lx * ly * lz;
  const innerL = Math.max(lx - 2 * wallThicknessMm, 0);
  const innerW = Math.max(ly - 2 * wallThicknessMm, 0);
  const innerH = Math.max(lz - bottomThicknessMm, 0); // open top
  const innerMm3 = innerL * innerW * innerH;
  return Math.max(outerMm3 - innerMm3, 0) / 1000; // to cm³
};

// Recalculate weight when material or correction changes
useEffect(() => {
  if (modelInfo) {
    const density = MATERIAL_DENSITY[material as keyof typeof MATERIAL_DENSITY] || 1.24;
    const vol = getEffectiveVolumeCm3(modelInfo);
    const weight = vol * density;
    setModelInfo((prev) => (prev ? { ...prev, weight } : null));
  }
}, [material, useOpenShell, wallThicknessMm, bottomThicknessMm]);

  const calculatePrice = () => {
    if (!modelInfo) return 0;
    const materialKey = material as keyof typeof PRICING;
    const qualityKey = quality as keyof typeof PRICING[typeof materialKey];
    const pricePerGram = PRICING[materialKey][qualityKey];
    return modelInfo.weight * pricePerGram;
  };


  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Upload Your 3D Model</h1>
          <p className="text-muted-foreground mb-8">
            Upload your model and get instant pricing based on material and quality settings
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {showUploadSection && (
              <>
                {/* 3D Viewer Section */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>3D Model Viewer</CardTitle>
                      <CardDescription>
                        Drag and drop or click to upload your 3D model file (STL, OBJ)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div
                        className={`border-2 border-dashed rounded-lg transition-colors ${
                          isDragging
                            ? "border-primary bg-primary/5"
                            : "border-muted-foreground/25"
                        } ${!file ? "p-8 text-center cursor-pointer" : "p-0"}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => !file && fileInputRef.current?.click()}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".stl,.obj,.step,.stp"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        {!file ? (
                          <>
                            <UploadIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-sm font-medium mb-2">
                              Click here to upload or drag and drop your model
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Supported formats: .stl, .obj
                            </p>
                          </>
                        ) : (
                          <ModelViewer3D file={file} onModelParsed={handleModelParsed} />
                        )}
                      </div>

                      {file && (
                        <div className="mt-4 p-3 bg-muted rounded-lg flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <FileIcon className="h-6 w-6 text-primary" />
                            <div>
                              <p className="font-medium text-sm">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(file.size / 1024).toFixed(2)} KB
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setFile(null);
                              setModelInfo(null);
                              if (fileInputRef.current) fileInputRef.current.value = "";
                            }}
                            className="text-xs text-muted-foreground hover:text-foreground"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Configuration */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Print Configuration</CardTitle>
                    </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="material">Material Type</Label>
                          <Select value={material} onValueChange={setMaterial}>
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pla-petg">PLA / PETG (no surcharge)</SelectItem>
                              <SelectItem value="asa-abs">ASA / ABS (+$0.10/g)</SelectItem>
                              <SelectItem value="tpu">TPU (+$0.20/g)</SelectItem>
                              <SelectItem value="nylon-cf">Nylon / CF-Nylon (+$0.35/g)</SelectItem>
                            </SelectContent>
                          </Select>
                          {material && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Density: <span className="font-semibold">{MATERIAL_DENSITY[material as keyof typeof MATERIAL_DENSITY].toFixed(5)} g/cm³</span>
                            </p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="quality">Print Quality</Label>
                          <Select value={quality} onValueChange={setQuality}>
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="standard">Standard (0.2mm layer)</SelectItem>
                              <SelectItem value="fine">Fine (0.1mm layer)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="openShell">Open-top shell correction</Label>
                            <Switch id="openShell" checked={useOpenShell} onCheckedChange={setUseOpenShell} />
                          </div>
                          {useOpenShell && (
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label htmlFor="wall">Wall thickness (mm)</Label>
                                <Input id="wall" type="number" step="0.1" min="0" value={wallThicknessMm}
                                  onChange={(e) => setWallThicknessMm(parseFloat(e.target.value) || 0)} />
                              </div>
                              <div>
                                <Label htmlFor="bottom">Bottom thickness (mm)</Label>
                                <Input id="bottom" type="number" step="0.1" min="0" value={bottomThicknessMm}
                                  onChange={(e) => setBottomThicknessMm(parseFloat(e.target.value) || 0)} />
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                  </Card>
                </div>
              </>
            )}

            {/* Model Info and Pricing */}
            <div className="space-y-6">
              {modelInfo && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>📏 Model Parameters</CardTitle>
                      <CardDescription>All measurements from your uploaded file</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Model Dimensions</p>
                          <p className="font-bold text-lg">
                            {modelInfo.dimensionsCm.x.toFixed(2)} × {modelInfo.dimensionsCm.y.toFixed(2)} × {modelInfo.dimensionsCm.z.toFixed(2)} cm
                          </p>
                        </div>
                        <div>
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <div className="cursor-help hover:bg-muted/50 p-2 -m-2 rounded-md transition-colors border-2 border-dashed border-transparent hover:border-primary/30">
                                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                  Material Volume
                                  <Info className="h-4 w-4 text-primary animate-pulse" />
                                </p>
                                <p className="font-bold text-lg underline decoration-dotted decoration-primary/50">{getEffectiveVolumeCm3(modelInfo).toFixed(5)} cm³</p>
                                <p className="text-[10px] text-primary/70 mt-0.5">Hover for calculation steps</p>
                              </div>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-96 z-50" side="top">
                              <div className="space-y-3">
                                <h4 className="font-semibold text-sm">Material Volume Calculation</h4>
                                <div className="text-xs space-y-2 text-muted-foreground">
                                  <div className="bg-muted/50 p-3 rounded space-y-1.5">
                                    <p className="font-semibold text-foreground">Outer Box Volume:</p>
                                    <p className="font-mono">
                                      {(modelInfo.dimensionsCm.x * 10).toFixed(1)} × {(modelInfo.dimensionsCm.y * 10).toFixed(1)} × {(modelInfo.dimensionsCm.z * 10).toFixed(1)} mm
                                    </p>
                                    <p className="font-mono">
                                      = {(modelInfo.dimensionsCm.x * modelInfo.dimensionsCm.y * modelInfo.dimensionsCm.z * 1000).toFixed(0)} mm³ / 1000
                                    </p>
                                    <p className="font-mono font-bold text-foreground">
                                      = {modelInfo.bboxVolumeCm3.toFixed(3)} cm³
                                    </p>
                                  </div>
                                  
                                  {useOpenShell && (
                                    <>
                                      <div className="bg-muted/50 p-3 rounded space-y-1.5">
                                        <p className="font-semibold text-foreground">Inner Cavity Dimensions:</p>
                                        <p className="font-mono">
                                          {Math.max(modelInfo.dimensionsCm.x * 10 - 2 * wallThicknessMm, 0).toFixed(1)} × {Math.max(modelInfo.dimensionsCm.y * 10 - 2 * wallThicknessMm, 0).toFixed(1)} × {Math.max(modelInfo.dimensionsCm.z * 10 - bottomThicknessMm, 0).toFixed(1)} mm
                                        </p>
                                      </div>
                                      
                                      <div className="bg-muted/50 p-3 rounded space-y-1.5">
                                        <p className="font-semibold text-foreground">Inner Cavity Volume:</p>
                                        <p className="font-mono">
                                          = {(Math.max(modelInfo.dimensionsCm.x * 10 - 2 * wallThicknessMm, 0) * Math.max(modelInfo.dimensionsCm.y * 10 - 2 * wallThicknessMm, 0) * Math.max(modelInfo.dimensionsCm.z * 10 - bottomThicknessMm, 0)).toFixed(0)} mm³ / 1000
                                        </p>
                                        <p className="font-mono font-bold text-foreground">
                                          = {((Math.max(modelInfo.dimensionsCm.x * 10 - 2 * wallThicknessMm, 0) * Math.max(modelInfo.dimensionsCm.y * 10 - 2 * wallThicknessMm, 0) * Math.max(modelInfo.dimensionsCm.z * 10 - bottomThicknessMm, 0)) / 1000).toFixed(3)} cm³
                                        </p>
                                      </div>
                                      
                                      <div className="bg-primary/10 p-3 rounded border border-primary/30">
                                        <p className="font-semibold text-foreground">Material Volume (Outer - Inner):</p>
                                        <p className="font-mono font-bold text-primary text-base">
                                          = {getEffectiveVolumeCm3(modelInfo).toFixed(5)} cm³
                                        </p>
                                      </div>
                                    </>
                                  )}
                                  
                                  {!useOpenShell && (
                                    <div className="bg-primary/10 p-3 rounded border border-primary/30">
                                      <p className="font-semibold text-foreground">Material Volume (Signed Volume Method):</p>
                                      <p className="font-mono font-bold text-primary text-base">
                                        = {modelInfo.volumeCm3.toFixed(5)} cm³
                                      </p>
                                      <p className="text-xs mt-1">
                                        Using tetrahedral decomposition to calculate actual enclosed volume
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Surface Area</p>
                          <p className="font-bold text-lg">{modelInfo.surfaceAreaCm2.toFixed(5)} cm²</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Box Volume</p>
                          <p className="font-bold text-lg">{modelInfo.bboxVolumeCm3.toFixed(5)} cm³</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Number of Polygons</p>
                          <p className="font-bold text-lg">{modelInfo.polygons.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Model Weight</p>
                          <p className="font-bold text-lg">{modelInfo.weight.toFixed(5)} g</p>
                        </div>
                        <div className="col-span-2 border-t pt-3">
                          <p className="text-xs text-muted-foreground mb-1">Support Material Volume</p>
                          <p className="font-bold text-lg">Not estimated — set on request</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                        <p className="text-xs text-amber-600 dark:text-amber-400 leading-relaxed">
                          <strong>Note:</strong> Volume calculations for open-top or non-watertight models may be 5-10% lower than actual material needed. For critical applications, we recommend exporting models as closed solids or requesting manual verification.
                        </p>
                      </div>
                  </CardContent>
                </Card>

                <Card className="border-primary/30">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <HelpCircle className="h-5 w-5 text-primary" />
                      <CardTitle>How is Material Volume Calculated?</CardTitle>
                    </div>
                    <CardDescription>Understanding the signed volume method and its limitations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="calculation">
                        <AccordionTrigger className="text-left">
                          Click to see the math behind Material Volume
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4">
                          <div className="space-y-4 text-sm">
                            <div>
                              <h4 className="font-semibold mb-2 flex items-center gap-2">
                                🔬 What is Signed Volume Calculation?
                              </h4>
                              <p className="text-muted-foreground">
                                We calculate the <strong>actual material volume</strong> of your 3D model using signed tetrahedral decomposition. For hollow models, outward-facing surfaces add volume while inward-facing surfaces subtract it, giving the precise amount of material needed for printing.
                              </p>
                            </div>

                            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                              <h4 className="font-semibold flex items-center gap-2">
                                📐 The Formula
                              </h4>
                              <div className="font-mono text-xs bg-background p-3 rounded border">
                                For each triangle in your model:<br />
                                V = |ax(by×cz - bz×cy) + ay(bz×cx - bx×cz) + az(bx×cy - by×cx)| / 6
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Where a, b, c are the three vertices of each triangle
                              </p>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-2">⚙️ Step-by-Step Process</h4>
                              <ol className="space-y-2 text-muted-foreground">
                                <li className="flex gap-2">
                                  <span className="font-bold text-foreground">1.</span>
                                  <span>For each triangle (polygon) in your {modelInfo.polygons.toLocaleString()} polygons</span>
                                </li>
                                <li className="flex gap-2">
                                  <span className="font-bold text-foreground">2.</span>
                                  <span>Form a tetrahedron from the triangle to the origin point (0,0,0)</span>
                                </li>
                                <li className="flex gap-2">
                                  <span className="font-bold text-foreground">3.</span>
                                  <span>Calculate the <strong>signed</strong> volume of that tetrahedron (positive for outward-facing, negative for inward-facing)</span>
                                </li>
                                <li className="flex gap-2">
                                  <span className="font-bold text-foreground">4.</span>
                                  <span>Sum all signed volumes (hollow cavities automatically subtract)</span>
                                </li>
                                <li className="flex gap-2">
                                  <span className="font-bold text-foreground">5.</span>
                                  <span>Take absolute value of the final sum</span>
                                </li>
                                <li className="flex gap-2">
                                  <span className="font-bold text-foreground">6.</span>
                                  <span>Convert from mm³ to cm³ (÷ 1,000)</span>
                                </li>
                              </ol>
                            </div>

                            <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-lg">
                              <h4 className="font-semibold mb-2 text-amber-600 dark:text-amber-400">⚠️ Limitations for Open Models</h4>
                              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                                The signed volume method works best with <strong>closed, watertight models</strong>. For open-top shells or models with missing faces:
                              </p>
                              <ul className="space-y-2 text-xs text-muted-foreground">
                                <li className="flex gap-2">
                                  <span>•</span>
                                  <span>Missing faces (like open tops) can cause partial volume cancellation</span>
                                </li>
                                <li className="flex gap-2">
                                  <span>•</span>
                                  <span>Results may be 5-15% lower than actual material needed</span>
                                </li>
                                <li className="flex gap-2">
                                  <span>•</span>
                                  <span>For accurate quotes on open models, contact us for manual verification</span>
                                </li>
                              </ul>
                            </div>

                            <div className="bg-primary/10 border border-primary/30 p-4 rounded-lg space-y-2">
                              <h4 className="font-semibold">📊 Material Volume vs Box Volume</h4>
                              <div className="grid grid-cols-2 gap-3 text-xs">
                                <div className="bg-background p-3 rounded">
                                  <p className="text-muted-foreground mb-1">Material Volume</p>
                                  <p className="font-bold text-lg text-primary">{getEffectiveVolumeCm3(modelInfo).toFixed(5)} cm³</p>
                                  <p className="text-muted-foreground mt-1">Actual solid material calculated</p>
                                </div>
                                <div className="bg-background p-3 rounded">
                                  <p className="text-muted-foreground mb-1">Box Volume</p>
                                  <p className="font-bold text-lg">{modelInfo.bboxVolumeCm3.toFixed(5)} cm³</p>
                                  <p className="text-muted-foreground mt-1">
                                    {modelInfo.dimensionsCm.x.toFixed(2)} × {modelInfo.dimensionsCm.y.toFixed(2)} × {modelInfo.dimensionsCm.z.toFixed(2)}
                                  </p>
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground pt-2">
                                Material volume represents only the solid parts that need to be printed, while box volume is the full rectangular space the model occupies.
                              </p>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>🧮 Step-by-Step Calculation</CardTitle>
                      <CardDescription>How we calculate your print cost</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="bg-muted/50 p-3 rounded-lg">
                          <p className="text-xs font-semibold text-muted-foreground mb-2">STEP 1: Volume</p>
                          <p className="text-sm">
                            Model volume = <span className="font-bold">{getEffectiveVolumeCm3(modelInfo).toFixed(5)} cm³</span>
                          </p>
                        </div>

                        <div className="bg-muted/50 p-3 rounded-lg">
                          <p className="text-xs font-semibold text-muted-foreground mb-2">STEP 2: Material Density</p>
                          <p className="text-sm">
                            {MATERIAL_NAMES[material as keyof typeof MATERIAL_NAMES]} density = <span className="font-bold">
                              {MATERIAL_DENSITY[material as keyof typeof MATERIAL_DENSITY].toFixed(5)} g/cm³
                            </span>
                          </p>
                        </div>

                        <div className="bg-muted/50 p-3 rounded-lg">
                          <p className="text-xs font-semibold text-muted-foreground mb-2">STEP 3: Weight</p>
                          <p className="text-sm">
                            Weight = Volume × Density<br />
                            Weight = {getEffectiveVolumeCm3(modelInfo).toFixed(5)} × {MATERIAL_DENSITY[material as keyof typeof MATERIAL_DENSITY].toFixed(5)}
                            <br />
                            Weight = <span className="font-bold">{modelInfo.weight.toFixed(5)} g</span>
                          </p>
                        </div>

                        <div className="bg-muted/50 p-3 rounded-lg">
                          <p className="text-xs font-semibold text-muted-foreground mb-2">STEP 4: Price per Gram</p>
                          <p className="text-sm">
                            {MATERIAL_NAMES[material as keyof typeof MATERIAL_NAMES]} ({quality}) = <span className="font-bold">
                              ${PRICING[material as keyof typeof PRICING][
                                quality as keyof typeof PRICING[keyof typeof PRICING]
                              ].toFixed(5)}/g
                            </span>
                          </p>
                        </div>

                        <div className="bg-primary/10 border-2 border-primary p-4 rounded-lg">
                          <p className="text-xs font-semibold text-muted-foreground mb-2">STEP 5: FINAL PRICE</p>
                          <p className="text-sm mb-2">
                            Price = Weight × Price per Gram<br />
                            Price = {modelInfo.weight.toFixed(5)} g × $
                            {PRICING[material as keyof typeof PRICING][
                              quality as keyof typeof PRICING[keyof typeof PRICING]
                            ].toFixed(5)}/g
                          </p>
                          <div className="flex items-center justify-between pt-2 border-t border-primary/30">
                            <span className="font-semibold">TOTAL:</span>
                            <span className="text-3xl font-bold text-primary">
                              ${calculatePrice().toFixed(5)} AUD
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-muted/50">
                    <CardContent className="pt-6">
                      <div className="flex gap-2 text-sm">
                        <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <div className="space-y-1 text-muted-foreground">
                          <p>• A startup cost of $20 AUD per order applies at checkout</p>
                          <p>• Turnaround time: 2-5 business days</p>
                          <p>• Bulk discounts available for 5+ units</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {!modelInfo && (
                <Card className="border-dashed">
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    <FileIcon className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p>Upload a model to see pricing and details</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Upload;
