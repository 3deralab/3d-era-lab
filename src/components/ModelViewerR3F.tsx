import { useEffect, useMemo, useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Bounds, Center, OrbitControls } from "@react-three/drei";
import { STLLoader, OBJLoader } from "three-stdlib";
import * as THREE from "three";
import { useLoader } from "@react-three/fiber";
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

const bgColor = "#0f1220";

function computeStats(positions: Float32Array, bboxSize: THREE.Vector3): ParsedModelInfo {
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

    // Sum signed volumes (crucial for hollow models)
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

function ObjModel({ url, onStats }: { url: string; onStats?: (info: ParsedModelInfo) => void }) {
  const group = useLoader(OBJLoader, url) as THREE.Group;

  useEffect(() => {
    if (!group) return;

    // Compute dimensions from entire group (accounts for multiple meshes)
    const bbox = new THREE.Box3().setFromObject(group);
    const size = bbox.getSize(new THREE.Vector3());

    // Aggregate stats across meshes
    let totalPositions = 0;
    let volumeMm3 = 0;
    let areaMm2 = 0;

    group.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.updateWorldMatrix(true, false);
        
        // Clone, ensure non-indexed geometry
        const geo = (mesh.geometry as THREE.BufferGeometry).index
          ? (mesh.geometry as THREE.BufferGeometry).toNonIndexed()
          : (mesh.geometry as THREE.BufferGeometry).clone();

        // Apply world matrix to get correct positions
        geo.applyMatrix4(mesh.matrixWorld);

        const posAttr = geo.getAttribute("position") as THREE.BufferAttribute;
        const arr = posAttr.array as Float32Array;
        totalPositions += arr.length;

        // Compute face area and signed volume with world-space coordinates
        for (let i = 0; i < arr.length; i += 9) {
          const ax = arr[i], ay = arr[i + 1], az = arr[i + 2];
          const bx = arr[i + 3], by = arr[i + 4], bz = arr[i + 5];
          const cx = arr[i + 6], cy = arr[i + 7], cz = arr[i + 8];

          const abx = bx - ax, aby = by - ay, abz = bz - az;
          const acx = cx - ax, acy = cy - ay, acz = cz - az;
          const crossX = aby * acz - abz * acy;
          const crossY = abz * acx - abx * acz;
          const crossZ = abx * acy - aby * acx;
          const triArea = Math.sqrt(crossX * crossX + crossY * crossY + crossZ * crossZ) * 0.5;
          areaMm2 += triArea;

          // Sum signed volumes (crucial for hollow models)
          const signedVol = (ax * (by * cz - bz * cy) + ay * (bz * cx - bx * cz) + az * (bx * cy - by * cx)) / 6;
          volumeMm3 += signedVol;
        }
      }
    });

    onStats?.({
      volumeCm3: Math.abs(volumeMm3) / 1000,
      surfaceAreaCm2: areaMm2 / 100,
      polygons: totalPositions / 9,
      bboxVolumeCm3: (size.x * size.y * size.z) / 1000,
      dimensionsCm: { x: size.x / 10, y: size.y / 10, z: size.z / 10 },
    });
  }, [group, onStats]);

  // Ensure all meshes have a visible material
  useEffect(() => {
    group.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (!Array.isArray(mesh.material)) {
          (mesh.material as THREE.MeshStandardMaterial).color.set("#3b82f6");
          (mesh.material as THREE.MeshStandardMaterial).metalness = 0.1;
          (mesh.material as THREE.MeshStandardMaterial).roughness = 0.5;
        }
      }
    });
  }, [group]);

  return <primitive object={group} />;
}

function StlModel({ url, onStats }: { url: string; onStats?: (info: ParsedModelInfo) => void }) {
  const geometry = useLoader(STLLoader, url) as THREE.BufferGeometry;

  const stats = useMemo(() => {
    const geom = geometry.index ? geometry.toNonIndexed() : geometry;
    geom.computeBoundingBox();
    const size = geom.boundingBox!.getSize(new THREE.Vector3());
    const positions = (geom.getAttribute("position") as THREE.BufferAttribute).array as Float32Array;
    return computeStats(positions, size);
  }, [geometry]);

  useEffect(() => {
    if (stats) onStats?.(stats);
  }, [stats, onStats]);

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial color="#3b82f6" metalness={0.1} roughness={0.5} />
    </mesh>
  );
}

const R3FModelViewer = ({ file, onModelParsed }: ModelViewerProps) => {
  const [url, setUrl] = useState<string | null>(null);
  const [ext, setExt] = useState<"stl" | "obj" | null>(null);

  useEffect(() => {
    if (!file) {
      if (url) URL.revokeObjectURL(url);
      setUrl(null);
      setExt(null);
      return;
    }

    const extension = file.name.toLowerCase().split(".").pop();
    if (!extension || (extension !== "stl" && extension !== "obj")) {
      toast.error("Only STL and OBJ files supported");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    setExt(extension as "stl" | "obj");

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  return (
    <div className="w-full h-[420px] rounded-lg border-2 border-border bg-background overflow-hidden">
      {url && ext ? (
        <Canvas dpr={[1, 2]} shadows camera={{ fov: 50, near: 0.1, far: 100000 }}>
          {/* Background color */}
          <color attach="background" args={[bgColor]} />

          {/* Lights */}
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow />
          <directionalLight position={[-5, -3, -5]} intensity={0.6} />
          <pointLight position={[0, 10, 0]} intensity={0.5} />

          {/* Controls */}
          <OrbitControls makeDefault enableDamping dampingFactor={0.08} />

          {/* Auto-fit to view and center content */}
          <Bounds fit clip observe margin={1.5}>
            <Center>
              <Suspense fallback={null}>
                {ext === "stl" ? (
                  <StlModel url={url} onStats={onModelParsed} />
                ) : (
                  <ObjModel url={url} onStats={onModelParsed} />
                )}
              </Suspense>
            </Center>
          </Bounds>
        </Canvas>
      ) : null}
    </div>
  );
};

export default R3FModelViewer;
