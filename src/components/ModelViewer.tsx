import { useEffect, useRef } from "react";
import * as THREE from "three";
import { STLLoader, OBJLoader, OrbitControls } from "three-stdlib";
import { toast } from "sonner";

export interface ParsedModelInfo {
  volumeCm3: number;
  surfaceAreaCm2: number;
  bboxVolumeCm3: number;
  polygons: number;
  dimensionsCm: { x: number; y: number; z: number };
}

interface ModelViewerProps {
  file: File | null;
  onModelParsed?: (info: ParsedModelInfo) => void;
}

const ModelViewer = ({ file, onModelParsed }: ModelViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const animationRef = useRef<number | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // Setup scene once
  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1f2e);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      10000
    );
    camera.position.set(150, 120, 150);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Grid and axes
    const grid = new THREE.GridHelper(200, 20, 0x444444, 0x222222);
    scene.add(grid);
    const axes = new THREE.AxesHelper(50);
    scene.add(axes);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const light1 = new THREE.DirectionalLight(0xffffff, 0.8);
    light1.position.set(100, 100, 100);
    scene.add(light1);
    const light2 = new THREE.DirectionalLight(0xffffff, 0.5);
    light2.position.set(-100, -50, -100);
    scene.add(light2);

    // Orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.7;
    controls.zoomSpeed = 0.8;
    controls.panSpeed = 0.8;
    controls.minDistance = 10;
    controls.maxDistance = 5000;
    controlsRef.current = controls;

    // Animation
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      controlsRef.current?.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", handleResize);
      controlsRef.current?.dispose();
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      rendererRef.current?.dispose();
    };
  }, []);

  // Load file
  useEffect(() => {
    if (!file || !sceneRef.current) return;

    // Clear previous mesh
    if (meshRef.current && sceneRef.current) {
      sceneRef.current.remove(meshRef.current);
      meshRef.current.geometry.dispose();
      (meshRef.current.material as THREE.Material).dispose();
      meshRef.current = null;
    }

    const ext = file.name.toLowerCase().split(".").pop();
    if (!ext || (ext !== "stl" && ext !== "obj")) {
      toast.error("Only STL and OBJ files supported");
      return;
    }

    const processGeometry = (geom: THREE.BufferGeometry) => {
      geom.computeVertexNormals();
      geom.computeBoundingBox();
      const bbox = geom.boundingBox!;
      const size = new THREE.Vector3();
      bbox.getSize(size);

      // Stats before centering
      const nonIndexed = geom.index ? geom.toNonIndexed() : geom;
      const positions = (nonIndexed.getAttribute("position") as THREE.BufferAttribute).array as Float32Array;
      const stats = computeStats(positions, size);

      // Center
      const center = new THREE.Vector3();
      bbox.getCenter(center);
      geom.translate(-center.x, -center.y, -center.z);

      // Material & mesh
      const mat = new THREE.MeshPhongMaterial({
        color: 0x2196f3,
        specular: 0x555555,
        shininess: 50,
      });
      const mesh = new THREE.Mesh(geom, mat);

      // Scale
      const maxDim = Math.max(size.x, size.y, size.z);
      if (maxDim > 0) {
        const scale = 80 / maxDim;
        mesh.scale.setScalar(scale);
      }

      sceneRef.current!.add(mesh);
      meshRef.current = mesh;

      // Camera
      const dist = maxDim * 1.8;
      cameraRef.current!.position.set(dist, dist * 0.75, dist);
      cameraRef.current!.lookAt(0, 0, 0);
      controlsRef.current?.target.set(0, 0, 0);
      controlsRef.current?.update();

      onModelParsed?.(stats);
    };

    if (ext === "stl") {
      const loader = new STLLoader();
      file.arrayBuffer().then((buf) => {
        try {
          processGeometry(loader.parse(buf));
        } catch (e) {
          console.error(e);
          toast.error("Failed to parse STL");
        }
      });
    } else if (ext === "obj") {
      const loader = new OBJLoader();
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const group = loader.parse(String(reader.result));
          const geoms: THREE.BufferGeometry[] = [];
          group.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              geoms.push(((child as THREE.Mesh).geometry as THREE.BufferGeometry).clone());
            }
          });
          if (geoms.length === 0) throw new Error("No meshes in OBJ");
          processGeometry(mergeGeoms(geoms));
        } catch (e) {
          console.error(e);
          toast.error("Failed to parse OBJ");
        }
      };
      reader.readAsText(file);
    }
  }, [file, onModelParsed]);


  return (
    <div
      ref={containerRef}
      className="w-full h-[420px] rounded-lg border-2 border-border bg-background cursor-grab active:cursor-grabbing"
    />
  );
};

function computeStats(positions: Float32Array, bboxSize: THREE.Vector3): ParsedModelInfo {
  let volumeMm3 = 0;
  let areaMm2 = 0;
  
  for (let i = 0; i < positions.length; i += 9) {
    const ax = positions[i], ay = positions[i + 1], az = positions[i + 2];
    const bx = positions[i + 3], by = positions[i + 4], bz = positions[i + 5];
    const cx = positions[i + 6], cy = positions[i + 7], cz = positions[i + 8];

    // Triangle area
    const abx = bx - ax, aby = by - ay, abz = bz - az;
    const acx = cx - ax, acy = cy - ay, acz = cz - az;
    const crossX = aby * acz - abz * acy;
    const crossY = abz * acx - abx * acz;
    const crossZ = abx * acy - aby * acx;
    const triArea = Math.sqrt(crossX * crossX + crossY * crossY + crossZ * crossZ) * 0.5;
    areaMm2 += triArea;

    // Signed volume (tetrahedron from origin)
    const signedVol = (ax * (by * cz - bz * cy) + ay * (bz * cx - bx * cz) + az * (bx * cy - by * cx)) / 6;
    volumeMm3 += signedVol;
  }

  return {
    volumeCm3: Math.abs(volumeMm3) / 1000,
    surfaceAreaCm2: areaMm2 / 100,
    polygons: positions.length / 9,
    bboxVolumeCm3: (bboxSize.x * bboxSize.y * bboxSize.z) / 1000,
    dimensionsCm: { x: bboxSize.x / 10, y: bboxSize.y / 10, z: bboxSize.z / 10 },
  };
}

function mergeGeoms(geoms: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const arrays: number[] = [];
  for (const g of geoms) {
    const geo = g.index ? g.toNonIndexed() : g;
    const pos = geo.getAttribute("position") as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    for (let i = 0; i < arr.length; i++) arrays.push(arr[i]);
  }
  const merged = new THREE.BufferGeometry();
  merged.setAttribute("position", new THREE.Float32BufferAttribute(arrays, 3));
  return merged;
}

export default ModelViewer;
