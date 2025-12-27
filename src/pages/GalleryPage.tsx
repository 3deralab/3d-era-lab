import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

// Dynamically import all gallery images from the gallery subfolder only (lazy loading)
const galleryModules = import.meta.glob(
  '@/assets/gallery/*.jpg',
  { import: 'default' }
);

// Process and sort image paths by number
const allImagePaths = Object.keys(galleryModules)
  .map((path) => {
    // Extract number from filename (e.g., gallery-28.jpg -> 28)
    const match = path.match(/gallery-(\d+)\.jpg/);
    const number = match ? parseInt(match[1]) : 0;
    
    return {
      path,
      number,
      alt: `3D Printed Project ${number}`,
    };
  })
  .sort((a, b) => a.number - b.number); // Sort by number

const IMAGES_PER_PAGE = 9; // Reduced for better mobile performance

const GalleryPage = () => {
  const navigate = useNavigate();
  const [displayedCount, setDisplayedCount] = useState(IMAGES_PER_PAGE);
  const [loadedImages, setLoadedImages] = useState<Record<number, string>>({});
  const [loadingImages, setLoadingImages] = useState<Record<number, boolean>>({});
  const [hasMore, setHasMore] = useState(allImagePaths.length > IMAGES_PER_PAGE);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const displayedImages = allImagePaths.slice(0, displayedCount);

  const openLightbox = (index: number) => {
    setSelectedImageIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    setSelectedImageIndex(null);
    setZoomLevel(1);
  };

  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  const resetZoom = () => {
    setZoomLevel(1);
  };

  const goToPrevious = () => {
    if (selectedImageIndex !== null && selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
      setZoomLevel(1);
    }
  };

  const goToNext = () => {
    if (selectedImageIndex !== null && selectedImageIndex < allImagePaths.length - 1) {
      const nextIndex = selectedImageIndex + 1;
      setSelectedImageIndex(nextIndex);
      setZoomLevel(1);
      // Preload next image
      if (!loadedImages[nextIndex]) {
        loadImage(nextIndex);
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") goToPrevious();
      if (e.key === "ArrowRight") goToNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, selectedImageIndex]);

  // Load image dynamically
  const loadImage = useCallback(async (index: number) => {
    if (loadedImages[index] || loadingImages[index]) return;
    
    setLoadingImages(prev => ({ ...prev, [index]: true }));
    
    try {
      const imageData = allImagePaths[index];
      const imageModule = await galleryModules[imageData.path]() as string;
      setLoadedImages(prev => ({ ...prev, [index]: imageModule }));
    } catch (error) {
      console.error('Failed to load image:', error);
    } finally {
      setLoadingImages(prev => ({ ...prev, [index]: false }));
    }
  }, [loadedImages, loadingImages]);

  // Load initial images
  useEffect(() => {
    displayedImages.forEach((_, index) => {
      loadImage(index);
    });
  }, [displayedCount]);

  const loadMoreImages = useCallback(() => {
    if (displayedCount >= allImagePaths.length) {
      setHasMore(false);
      return;
    }

    const newCount = Math.min(displayedCount + IMAGES_PER_PAGE, allImagePaths.length);
    setDisplayedCount(newCount);
    
    if (newCount >= allImagePaths.length) {
      setHasMore(false);
    }
  }, [displayedCount]);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreImages();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loadMoreImages]);

  useEffect(() => {
    const title = document.querySelector("title");
    const meta = document.querySelector('meta[name="description"]');
    if (title) title.textContent = "3D Printing Gallery - 3D Era Lab";
    if (meta) meta.setAttribute("content", "Browse our collection of 50+ high-quality 3D printed projects at 300dpi resolution.");
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          
          <h1 className="text-4xl font-bold mb-2">Our Gallery</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedImages.map((image, index) => {
            const isLoaded = loadedImages[index];
            const isLoading = loadingImages[index];
            
            return (
              <Card 
                key={image.number} 
                className="overflow-hidden group cursor-pointer hover:shadow-lg transition-all"
                onClick={() => {
                  if (isLoaded) {
                    openLightbox(index);
                  }
                }}
              >
                <div className="relative h-64 bg-muted">
                  {isLoading || !isLoaded ? (
                    <Skeleton className="w-full h-full" />
                  ) : (
                    <>
                      <img
                        src={loadedImages[index]}
                        alt={image.alt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                        <p className="text-sm font-medium text-foreground">{image.alt}</p>
                        <p className="text-xs text-muted-foreground">Image #{image.number}</p>
                      </div>
                    </>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Lightbox Dialog */}
        <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
          <DialogContent className="max-w-7xl w-full h-[90vh] p-0 bg-black/95 border-none">
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-50 text-white hover:bg-white/10"
                onClick={closeLightbox}
              >
                <X className="h-6 w-6" />
              </Button>

              {/* Zoom Controls */}
              <div className="absolute top-4 left-4 z-50 flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10"
                  onClick={zoomIn}
                  disabled={zoomLevel >= 3}
                >
                  <ZoomIn className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10"
                  onClick={zoomOut}
                  disabled={zoomLevel <= 0.5}
                >
                  <ZoomOut className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10"
                  onClick={resetZoom}
                  disabled={zoomLevel === 1}
                >
                  <RotateCcw className="h-5 w-5" />
                </Button>
                <div className="flex items-center px-3 text-white text-sm bg-white/10 rounded-md">
                  {Math.round(zoomLevel * 100)}%
                </div>
              </div>

              {/* Previous Button */}
              {selectedImageIndex !== null && selectedImageIndex > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/10 h-12 w-12"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrevious();
                  }}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
              )}

              {/* Next Button */}
              {selectedImageIndex !== null && selectedImageIndex < allImagePaths.length - 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/10 h-12 w-12"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNext();
                  }}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              )}

              {/* Image Display */}
              {selectedImageIndex !== null && loadedImages[selectedImageIndex] && (
                <div className="flex flex-col items-center justify-center w-full h-full">
                  <div className="relative flex-1 w-full flex items-center justify-center overflow-auto p-16">
                    <img
                      src={loadedImages[selectedImageIndex]}
                      alt={allImagePaths[selectedImageIndex].alt}
                      className="transition-transform duration-200"
                      style={{
                        transform: `scale(${zoomLevel})`,
                        objectFit: 'contain',
                        maxWidth: '100%',
                        maxHeight: '100%',
                      }}
                      decoding="async"
                    />
                  </div>
                  <div className="py-4 text-center bg-black/50 w-full">
                    <p className="text-white text-lg font-medium">
                      {allImagePaths[selectedImageIndex].alt}
                    </p>
                    <p className="text-white/70 text-sm">
                      Gallery Image #{allImagePaths[selectedImageIndex].number} • {selectedImageIndex + 1} of {allImagePaths.length}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Loading state for lightbox */}
              {selectedImageIndex !== null && !loadedImages[selectedImageIndex] && (
                <div className="flex items-center justify-center w-full h-full">
                  <div className="text-white text-lg">Loading image...</div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {hasMore && (
          <div ref={loadMoreRef} className="flex justify-center items-center py-8">
            <div className="animate-pulse text-muted-foreground">Loading more images...</div>
          </div>
        )}

        {!hasMore && (
          <div className="text-center py-8 text-muted-foreground">
            You've reached the end of our gallery
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default GalleryPage;
