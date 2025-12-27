import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { STLLoader } from "three-stdlib";
import { OBJLoader } from "three-stdlib";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { Button } from "./ui/button";
import { RotateCcw, Grid3x3, Box, Maximize2, Sun, Moon } from "lucide-react";
import { toast } from "sonner";

export interface ParsedModelInfo {
  volumeCm3: number;
  surfaceAreaCm2: number;
  bboxVolumeCm3: number;
  polygons: number;
  dimensionsCm: { x: number; y: number; z: number };
}

interface ModelViewer3DProps {
  file: File | null;
  onModelParsed?: (info: ParsedModelInfo) => void;
}

const ModelViewer3D = ({ file, onModelParsed }: ModelViewer3DProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const gridRef = useRef<THREE.GridHelper | null>(null);
  const axesRef = useRef<THREE.AxesHelper | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const modelLoadedRef = useRef<boolean>(false);

  const [wireframe, setWireframe] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showAxes, setShowAxes] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  // Initialize scene
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(darkMode ? 0x1a1a2e : 0xf0f0f0);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.01, 1e9);
    camera.position.set(100, 100, 100);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight1.position.set(100, 100, 100);
    directionalLight1.castShadow = true;
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight2.position.set(-100, -50, -50);
    scene.add(directionalLight2);

    const pointLight = new THREE.PointLight(0xffffff, 0.3, 0);
    pointLight.position.set(0, 200, 0);
    scene.add(pointLight);

    // Grid
    const grid = new THREE.GridHelper(200, 20, 0x888888, 0x444444);
    grid.visible = showGrid;
    scene.add(grid);
    gridRef.current = grid;

    // Axes
    const axes = new THREE.AxesHelper(100);
    axes.visible = showAxes;
    scene.add(axes);
    axesRef.current = axes;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 0.001;
    controls.maxDistance = 1e9;
    controls.maxPolarAngle = Math.PI;
    controlsRef.current = controls;

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      controls.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  // Update background when dark mode changes
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.background = new THREE.Color(darkMode ? 0x1a1a2e : 0xf0f0f0);
    }
  }, [darkMode]);

  // Update grid visibility
  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.visible = showGrid;
    }
  }, [showGrid]);

  // Update axes visibility
  useEffect(() => {
    if (axesRef.current) {
      axesRef.current.visible = showAxes;
    }
  }, [showAxes]);

  // Update wireframe
  useEffect(() => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.MeshStandardMaterial;
      material.wireframe = wireframe;
    }
  }, [wireframe]);

  // Load model
  useEffect(() => {
    if (!file || !sceneRef.current || !cameraRef.current || !controlsRef.current) return;
    
    modelLoadedRef.current = false;

    // Remove previous model
    if (meshRef.current) {
      sceneRef.current.remove(meshRef.current);
      meshRef.current.geometry.dispose();
      (meshRef.current.material as THREE.Material).dispose();
      meshRef.current = null;
    }

    const extension = file.name.toLowerCase().split(".").pop();
    if (!extension || (extension !== "stl" && extension !== "obj")) {
      toast.error("Only STL and OBJ files are supported");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      if (!data || !sceneRef.current || !cameraRef.current || !controlsRef.current) return;

      try {
        let geometry: THREE.BufferGeometry;

        if (extension === "stl") {
          const loader = new STLLoader();
          geometry = loader.parse(data as ArrayBuffer);
        } else {
          const loader = new OBJLoader();
          const text = new TextDecoder().decode(data as ArrayBuffer);
          const obj = loader.parse(text);
          const geometries: THREE.BufferGeometry[] = [];
           obj.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              mesh.updateWorldMatrix(true, false);
              const geo = (mesh.geometry as THREE.BufferGeometry).clone();
              geo.applyMatrix4(mesh.matrixWorld);
              geometries.push(geo);
            }
          });
          if (geometries.length === 0) {
            toast.error("No valid geometry found in OBJ file");
            return;
          }
          geometry = geometries[0];
          if (geometries.length > 1) {
            // Merge multiple geometries
            for (let i = 1; i < geometries.length; i++) {
              geometry = BufferGeometryUtils.mergeGeometries([geometry, geometries[i]]) || geometry;
            }
          }
        }

        // Convert to non-indexed if needed
        if (geometry.index) {
          geometry = geometry.toNonIndexed();
        }

         geometry.computeVertexNormals();
        geometry.computeBoundingBox();
        geometry.computeBoundingSphere();

        // Calculate stats
        const bbox = geometry.boundingBox!;
        const size = new THREE.Vector3();
        bbox.getSize(size);

        const positions = geometry.getAttribute("position").array as Float32Array;
        let volumeMm3 = 0;
        let areaMm2 = 0;

        for (let i = 0; i < positions.length; i += 9) {
          const ax = positions[i], ay = positions[i + 1], az = positions[i + 2];
          const bx = positions[i + 3], by = positions[i + 4], bz = positions[i + 5];
          const cx = positions[i + 6], cy = positions[i + 7], cz = positions[i + 8];

          const abx = bx - ax, aby = by - ay, abz = bz - az;
          const acx = cx - ax, acy = cy - ay, acz = cz - az;
          const crossX = aby * acz - abz * acy;
          const crossY = abz * acx - abx * acz;
          const crossZ = abx * acy - aby * acx;
          const triArea = Math.sqrt(crossX * crossX + crossY * crossY + crossZ * crossZ) * 0.5;
          areaMm2 += triArea;

          const signedVol = (ax * (by * cz - bz * cy) + ay * (bz * cx - bx * cz) + az * (bx * cy - by * cx)) / 6;
          volumeMm3 += signedVol;
        }

        const modelInfo: ParsedModelInfo = {
          volumeCm3: Math.abs(volumeMm3) / 1000,
          surfaceAreaCm2: areaMm2 / 100,
          polygons: positions.length / 9,
          bboxVolumeCm3: (size.x * size.y * size.z) / 1000,
          dimensionsCm: { x: size.x / 10, y: size.y / 10, z: size.z / 10 },
        };

        onModelParsed?.(modelInfo);

        // Center geometry
        geometry.center();

        // Create mesh
         const material = new THREE.MeshStandardMaterial({
          color: 0x3b82f6,
          metalness: 0.1,
          roughness: 0.5,
          wireframe: wireframe,
          side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
         sceneRef.current.add(mesh);
        meshRef.current = mesh;

        // Adjust helpers (grid and axes) to model scale
        const radius = geometry.boundingSphere ? geometry.boundingSphere.radius : Math.max(size.x, size.y, size.z) / 2;
        // Grid
        if (gridRef.current) {
          sceneRef.current.remove(gridRef.current);
          gridRef.current.geometry.dispose();
          // material disposed by three on remove for helpers; safe to let GC handle
        }
        const gridSize = Math.max(10, Math.pow(2, Math.ceil(Math.log2((radius * 4) || 10))));
        const newGrid = new THREE.GridHelper(gridSize, 20, 0x888888, 0x444444);
        newGrid.visible = showGrid;
        sceneRef.current.add(newGrid);
        gridRef.current = newGrid;

        // Axes
        if (axesRef.current) {
          sceneRef.current.remove(axesRef.current);
        }
        const newAxes = new THREE.AxesHelper(Math.max(10, radius * 1.5));
        newAxes.visible = showAxes;
        sceneRef.current.add(newAxes);
        axesRef.current = newAxes;

         // Fit camera to model using bounding sphere for a consistent frame
        const bs = geometry.boundingSphere;
        const r = bs ? Math.max(bs.radius, 1e-6) : Math.max(size.x, size.y, size.z) / 2;
        const cam = cameraRef.current;
        const ctrls = controlsRef.current;
        const fov = cam.fov * (Math.PI / 180);
        const distance = (r / Math.sin(Math.min(Math.PI / 2 - 0.01, fov / 2))) * 1.2; // 20% margin

        // Update camera clipping planes and controls based on target distance
        cam.near = Math.max(0.001, distance / 1000);
        cam.far = Math.max(cam.near * 10, distance * 100);
        cam.updateProjectionMatrix();

        ctrls.minDistance = Math.max(cam.near * 2, distance / 1000);
        ctrls.maxDistance = Math.max(distance * 50, cam.far * 0.9);

        cam.position.set(distance, distance, distance);
        cam.lookAt(0, 0, 0);
        ctrls.target.set(0, 0, 0);
        ctrls.update();

        if (!modelLoadedRef.current) {
          toast.success("Model loaded successfully");
          modelLoadedRef.current = true;
        }
      } catch (error) {
        console.error("Error loading model:", error);
        toast.error("Failed to load model");
      }
    };

    reader.readAsArrayBuffer(file);
  }, [file]);

   const resetView = () => {
    if (!cameraRef.current || !controlsRef.current || !meshRef.current) return;
    const geom = meshRef.current.geometry as THREE.BufferGeometry;
    if (!geom.boundingSphere) {
      geom.computeBoundingSphere();
    }
    const bs = geom.boundingSphere;
    if (!bs) return;
    
    const cam = cameraRef.current;
    const ctrls = controlsRef.current;
    const fov = cam.fov * (Math.PI / 180);
    const distance = (bs.radius / Math.sin(Math.min(Math.PI / 2 - 0.01, fov / 2))) * 1.2;

    cam.near = Math.max(0.001, distance / 1000);
    cam.far = Math.max(cam.near * 10, distance * 100);
    cam.updateProjectionMatrix();

    ctrls.minDistance = Math.max(cam.near * 2, distance / 1000);
    ctrls.maxDistance = Math.max(distance * 50, cam.far * 0.9);

    cam.position.set(distance, distance, distance);
    cam.lookAt(0, 0, 0);
    ctrls.target.set(0, 0, 0);
    ctrls.update();
  };

  return (
    <div className="relative w-full h-[480px] rounded-lg border-2 border-border bg-background overflow-hidden">
      <div ref={containerRef} className="w-full h-full" />
      
      {file && (
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <Button
            size="icon"
            variant="secondary"
            className="h-9 w-9 bg-background/90 hover:bg-background"
            onClick={resetView}
            title="Reset view"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-9 w-9 bg-background/90 hover:bg-background"
            onClick={() => setWireframe(!wireframe)}
            title="Toggle wireframe"
          >
            <Box className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-9 w-9 bg-background/90 hover:bg-background"
            onClick={() => setShowGrid(!showGrid)}
            title="Toggle grid"
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-9 w-9 bg-background/90 hover:bg-background"
            onClick={() => setShowAxes(!showAxes)}
            title="Toggle axes"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-9 w-9 bg-background/90 hover:bg-background"
            onClick={() => setDarkMode(!darkMode)}
            title="Toggle theme"
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ModelViewer3D;