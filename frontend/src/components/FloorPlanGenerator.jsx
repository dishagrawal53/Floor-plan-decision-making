import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, Home, X, Download, ExternalLink, Box, Sofa } from 'lucide-react';

// 2D Furniture Component
const FloorPlanFurniture = ({ initialImage, onBack }) => {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const [furniture, setFurniture] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const [floorPlanImage, setFloorPlanImage] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    if (!initialImage) return;

    const img = new Image();
    img.onload = () => {
      setFloorPlanImage(img);
      setImageLoaded(true);
      setFurniture([]);
      setSelectedItem(null);
    };
    img.src = initialImage;
  }, [initialImage]);

  const categories = [
    { id: 'all', name: 'All', icon: '🏠' },
    { id: 'living', name: 'Living', icon: '🛋️' },
    { id: 'bedroom', name: 'Bedroom', icon: '🛏️' },
    { id: 'kitchen', name: 'Kitchen', icon: '🍽️' },
    { id: 'dining', name: 'Dining', icon: '🪑' },
    { id: 'bathroom', name: 'Bath', icon: '🚿' },
    { id: 'decor', name: 'Decor', icon: '🪴' }
  ];

  const furnitureCatalog = [
    { id: 'sofa', name: 'Sofa', emoji: '🛋️', width: 80, height: 40, category: 'living' },
    { id: 'armchair', name: 'Armchair', emoji: '🪑', width: 35, height: 35, category: 'living' },
    { id: 'tv', name: 'TV Stand', emoji: '📺', width: 50, height: 20, category: 'living' },
    { id: 'coffee_table', name: 'Coffee Table', emoji: '☕', width: 40, height: 40, category: 'living' },
    { id: 'bed', name: 'Double Bed', emoji: '🛏️', width: 60, height: 80, category: 'bedroom' },
    { id: 'single_bed', name: 'Single Bed', emoji: '🛏️', width: 40, height: 70, category: 'bedroom' },
    { id: 'wardrobe', name: 'Wardrobe', emoji: '👔', width: 60, height: 30, category: 'bedroom' },
    { id: 'dresser', name: 'Dresser', emoji: '🗄️', width: 45, height: 25, category: 'bedroom' },
    { id: 'nightstand', name: 'Nightstand', emoji: '🕯️', width: 20, height: 20, category: 'bedroom' },
    { id: 'table', name: 'Dining Table', emoji: '🍽️', width: 60, height: 60, category: 'dining' },
    { id: 'chair', name: 'Dining Chair', emoji: '🪑', width: 20, height: 20, category: 'dining' },
    { id: 'desk', name: 'Desk', emoji: '🖥️', width: 50, height: 30, category: 'kitchen' },
    { id: 'bookshelf', name: 'Bookshelf', emoji: '📚', width: 40, height: 25, category: 'kitchen' },
    { id: 'bathtub', name: 'Bathtub', emoji: '🛁', width: 60, height: 35, category: 'bathroom' },
    { id: 'toilet', name: 'Toilet', emoji: '🚽', width: 20, height: 25, category: 'bathroom' },
    { id: 'sink', name: 'Sink', emoji: '🚰', width: 25, height: 20, category: 'bathroom' },
    { id: 'plant', name: 'Plant', emoji: '🪴', width: 15, height: 15, category: 'decor' },
    { id: 'lamp', name: 'Lamp', emoji: '💡', width: 12, height: 12, category: 'decor' },
    { id: 'rug', name: 'Rug', emoji: '🟫', width: 60, height: 50, category: 'decor' },
    { id: 'mirror', name: 'Mirror', emoji: '🪞', width: 15, height: 30, category: 'decor' }
  ];

  const filteredFurniture = furnitureCatalog.filter(
    item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (activeCategory === 'all' || item.category === activeCategory)
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (floorPlanImage && imageLoaded) {
      const scale = Math.min(
        canvas.width / floorPlanImage.width,
        canvas.height / floorPlanImage.height
      );
      const x = (canvas.width - floorPlanImage.width * scale) / 2;
      const y = (canvas.height - floorPlanImage.height * scale) / 2;
      ctx.drawImage(floorPlanImage, x, y, floorPlanImage.width * scale, floorPlanImage.height * scale);
    } else {
      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#adb5bd';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Floor plan loaded from AI', canvas.width / 2, canvas.height / 2);
    }

    furniture.forEach((item, idx) => {
      ctx.save();
      ctx.translate(item.x + (item.width * item.size) / 2, item.y + (item.height * item.size) / 2);
      
      if (item.flipped) ctx.scale(-1, 1);
      ctx.rotate((item.rotation * Math.PI) / 180);
      
      if (selectedItem === idx) {
        ctx.shadowColor = '#3b82f6';
        ctx.shadowBlur = 20;
      }
      
      const fontSize = Math.min(item.width, item.height) * item.size * 0.8;
      ctx.font = fontSize + 'px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.emoji, 0, 0);
      ctx.restore();
    });
  }, [floorPlanImage, imageLoaded, furniture, selectedItem]);

  const addFurniture = (catalogItem) => {
    if (!imageLoaded) {
      alert('Please wait for floor plan to load!');
      return;
    }
    const canvas = canvasRef.current;
    const newItem = {
      ...catalogItem,
      x: canvas.width / 2 - catalogItem.width / 2,
      y: canvas.height / 2 - catalogItem.height / 2,
      rotation: 0,
      size: 1,
      flipped: false,
      id: Date.now()
    };
    setFurniture([...furniture, newItem]);
    setSelectedItem(furniture.length);
  };

  const handleMouseDown = (e) => {
    if (!imageLoaded) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (let i = furniture.length - 1; i >= 0; i--) {
      const item = furniture[i];
      const scaledWidth = item.width * item.size;
      const scaledHeight = item.height * item.size;
      
      if (x >= item.x && x <= item.x + scaledWidth && y >= item.y && y <= item.y + scaledHeight) {
        setSelectedItem(i);
        setDragging(true);
        setOffset({ x: x - item.x, y: y - item.y });
        return;
      }
    }
    setSelectedItem(null);
  };

  const handleMouseMove = (e) => {
    if (!dragging || selectedItem === null) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - offset.x;
    const y = e.clientY - rect.top - offset.y;
    const item = furniture[selectedItem];
    const scaledWidth = item.width * item.size;
    const scaledHeight = item.height * item.size;
    const clampedX = Math.max(0, Math.min(x, canvas.width - scaledWidth));
    const clampedY = Math.max(0, Math.min(y, canvas.height - scaledHeight));
    const newFurniture = [...furniture];
    newFurniture[selectedItem] = { ...item, x: clampedX, y: clampedY };
    setFurniture(newFurniture);
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  const rotateFurniture = () => {
    if (selectedItem === null) return;
    const newFurniture = [...furniture];
    newFurniture[selectedItem].rotation = (newFurniture[selectedItem].rotation + 90) % 360;
    setFurniture(newFurniture);
  };

  const flipFurniture = () => {
    if (selectedItem === null) return;
    const newFurniture = [...furniture];
    newFurniture[selectedItem].flipped = !newFurniture[selectedItem].flipped;
    setFurniture(newFurniture);
  };

  const changeFurnitureSize = (delta) => {
    if (selectedItem === null) return;
    const newFurniture = [...furniture];
    const item = newFurniture[selectedItem];
    item.size = Math.max(0.3, Math.min(3, item.size + delta));
    setFurniture(newFurniture);
  };

  const deleteFurniture = () => {
    if (selectedItem === null) return;
    setFurniture(furniture.filter((_, idx) => idx !== selectedItem));
    setSelectedItem(null);
  };

  const exportAsImage = () => {
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.setAttribute('href', dataUrl);
    link.setAttribute('download', 'floor-plan-' + Date.now() + '.png');
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 z-50 overflow-auto">
      <div className="max-w-7xl mx-auto p-6">
        
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
                Back to Plans
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                  🏠 2D Furniture Designer
                </h1>
                <p className="text-gray-600 text-sm mt-1">Drag and drop furniture to design your space</p>
              </div>
            </div>
            <button
              onClick={exportAsImage}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              <Download size={18} /> Export
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          <div className="lg:col-span-1 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">🪑 Furniture</h2>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeCategory === cat.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto p-1">
              {filteredFurniture.map(item => (
                <button
                  key={item.id}
                  onClick={() => addFurniture(item)}
                  className="flex flex-col items-center gap-1 p-3 bg-gray-50 hover:bg-gray-100 border-2 border-gray-200 hover:border-indigo-400 rounded-lg transition-all"
                  title={item.name}
                >
                  <span className="text-3xl">{item.emoji}</span>
                  <span className="text-xs font-medium text-gray-700 text-center">{item.name}</span>
                </button>
              ))}
            </div>

            {selectedItem !== null && (
              <div className="mt-6 pt-6 border-t-2 border-gray-200">
                <h3 className="font-bold mb-3 text-gray-800 text-lg">🎯 Controls</h3>
                <div className="space-y-2">
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Size: {furniture[selectedItem]?.size.toFixed(1)}x
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => changeFurnitureSize(-0.2)}
                        className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium text-sm transition-colors"
                      >
                        - Smaller
                      </button>
                      <button
                        onClick={() => changeFurnitureSize(0.2)}
                        className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium text-sm transition-colors"
                      >
                        + Larger
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={rotateFurniture}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Rotate 90°
                  </button>
                  <button
                    onClick={flipFurniture}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Flip Mirror
                  </button>
                  <button
                    onClick={deleteFurniture}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-3 bg-white rounded-xl shadow-lg p-6">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-6 inline-block shadow-inner">
              <canvas
                ref={canvasRef}
                width={900}
                height={650}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className="bg-white cursor-move rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 3D Viewer Component
const FloorPlan3DViewer = ({ floorPlanData, onBack }) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const furnitureGroupRef = useRef(null);
  const floorGroupRef = useRef(null);
  const raycasterRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const dragPlaneRef = useRef(null);
  const placementModeRef = useRef(false);
  const selectedFurnitureTypeRef = useRef(null);
  const furnitureRotationRef = useRef(0);
  const selectedFurnitureRef = useRef(null);
  const isDraggingFurnitureRef = useRef(false);
  const outlineMeshRef = useRef(null);

  const [placementMode, setPlacementMode] = useState(false);
  const [selectedFurnitureType, setSelectedFurnitureType] = useState(null);
  const [selectedFurniture, setSelectedFurniture] = useState(null);
  const [furnitureRotation, setFurnitureRotation] = useState(0);
  const [isDraggingFurniture, setIsDraggingFurniture] = useState(false);
  const [outlineMesh, setOutlineMesh] = useState(null);
  const [editPanelVisible, setEditPanelVisible] = useState(false);
  const [furnitureScale, setFurnitureScale] = useState(100);
  const [furnitureAngle, setFurnitureAngle] = useState(0);
  const [furniturePosX, setFurniturePosX] = useState(0);
  const [furniturePosZ, setFurniturePosZ] = useState(0);
  const [modeIndicator, setModeIndicator] = useState('');

  const furnitureLibrary = [
    { type: 'bed', icon: '🛏️', name: 'Bed' },
    { type: 'sofa', icon: '🛋️', name: 'Sofa' },
    { type: 'chair', icon: '🪑', name: 'Chair' },
    { type: 'table', icon: '🍽️', name: 'Table' },
    { type: 'desk', icon: '🖥️', name: 'Desk' },
    { type: 'cabinet', icon: '🗄️', name: 'Cabinet' },
    { type: 'bathtub', icon: '🛁', name: 'Bathtub' },
    { type: 'toilet', icon: '🚽', name: 'Toilet' },
    { type: 'plant', icon: '🪴', name: 'Plant' }
  ];

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.async = true;
    
    script.onload = () => {
      initViewer();
    };
    
    document.body.appendChild(script);

    return () => {
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      if (script.parentNode) {
        document.body.removeChild(script);
      }
    };
  }, [floorPlanData]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'r' || e.key === 'R') {
        if (placementModeRef.current) {
          const newRotation = furnitureRotationRef.current + Math.PI / 2;
          setFurnitureRotation(newRotation);
          furnitureRotationRef.current = newRotation;
          showModeIndicator(`Rotated ${Math.round((newRotation % (Math.PI * 2)) / Math.PI * 180)}°`);
        }
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedFurniture && !placementModeRef.current) {
          deleteFurniture();
        }
      }
      if (e.key === 'Escape') {
        if (placementModeRef.current) {
          exitPlacementMode();
        } else {
          deselectFurniture();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFurniture]);

  const showModeIndicator = (text) => {
    setModeIndicator(text);
    setTimeout(() => setModeIndicator(''), 1500);
  };

  const initViewer = () => {
    if (!window.THREE || !containerRef.current) return;

    const container = containerRef.current;
    container.innerHTML = '';

    const scene = new window.THREE.Scene();
    scene.background = new window.THREE.Color(0x87CEEB);
    sceneRef.current = scene;

    const camera = new window.THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      10000
    );
    camera.position.set(150, 250, 200);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new window.THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    scene.add(new window.THREE.AmbientLight(0xffffff, 0.5));
    
    const dirLight1 = new window.THREE.DirectionalLight(0xffffff, 0.8);
    dirLight1.position.set(100, 200, 100);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new window.THREE.DirectionalLight(0xffffff, 0.4);
    dirLight2.position.set(-100, 150, -100);
    scene.add(dirLight2);

    const gridHelper = new window.THREE.GridHelper(500, 50, 0x888888, 0xcccccc);
    scene.add(gridHelper);

    const floorGroup = new window.THREE.Group();
    scene.add(floorGroup);
    floorGroupRef.current = floorGroup;

    const furnitureGroup = new window.THREE.Group();
    scene.add(furnitureGroup);
    furnitureGroupRef.current = furnitureGroup;

    raycasterRef.current = new window.THREE.Raycaster();

    const dragPlane = new window.THREE.Mesh(
      new window.THREE.PlaneGeometry(10000, 10000),
      new window.THREE.MeshBasicMaterial({ visible: false })
    );
    dragPlane.rotation.x = -Math.PI / 2;
    scene.add(dragPlane);
    dragPlaneRef.current = dragPlane;

    processFloorPlan(floorPlanData, floorGroup, scene, camera);

    let isRotating = false;
    let previousMousePosition = { x: 0, y: 0 };
    let cameraRotation = { x: Math.PI / 3.5, y: Math.PI / 4 };
    let isPlacingFurniture = false;
    let isDragging = false;

    const onMouseDown = (e) => {
      // Use ref to check placement mode to avoid stale closure
      if (placementModeRef.current) {
        isPlacingFurniture = true;
        placeFurnitureAtMouse(e);
        return;
      }

      const rect = renderer.domElement.getBoundingClientRect();
      const mouse = mouseRef.current;
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouse, camera);
      const intersects = raycasterRef.current.intersectObjects(furnitureGroupRef.current.children, true);

      if (intersects.length > 0) {
        let furniture = intersects[0].object;
        while (furniture.parent !== furnitureGroupRef.current && furniture.parent) {
          furniture = furniture.parent;
        }
        selectFurnitureObject(furniture);
        isDragging = true;
        isDraggingFurnitureRef.current = true;
        setIsDraggingFurniture(true);
        renderer.domElement.style.cursor = 'move';
        return;
      } else {
        deselectFurniture();
      }

      isRotating = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      // Use ref to check placement mode
      if (placementModeRef.current || isPlacingFurniture) {
        return;
      }
      
      if (isDragging && selectedFurnitureRef.current) {
        const rect = renderer.domElement.getBoundingClientRect();
        const mouse = mouseRef.current;
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycasterRef.current.setFromCamera(mouse, camera);
        const intersects = raycasterRef.current.intersectObject(dragPlaneRef.current);

        if (intersects.length > 0) {
          const point = intersects[0].point;
          selectedFurnitureRef.current.position.x = point.x;
          selectedFurnitureRef.current.position.z = point.z;
          setFurniturePosX(Math.round(point.x));
          setFurniturePosZ(Math.round(point.z));

          if (outlineMeshRef.current) {
            updateOutline(selectedFurnitureRef.current);
          }
        }
      } else if (isRotating) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        cameraRotation.y += deltaX * 0.005;
        cameraRotation.x += deltaY * 0.005;
        cameraRotation.x = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, cameraRotation.x));

        previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    };

    const onMouseUp = () => {
      isRotating = false;
      isDragging = false;
      isPlacingFurniture = false;
      isDraggingFurnitureRef.current = false;
      setIsDraggingFurniture(false);
      if (selectedFurnitureRef.current) {
        renderer.domElement.style.cursor = 'pointer';
      } else {
        renderer.domElement.style.cursor = 'default';
      }
    };

    const onWheel = (e) => {
      e.preventDefault();
      const distance = camera.position.length();
      const newDistance = Math.max(50, Math.min(1000, distance + (e.deltaY * 0.1)));
      camera.position.multiplyScalar(newDistance / distance);
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('wheel', onWheel);

    const animate = () => {
      requestAnimationFrame(animate);

      const radius = camera.position.length();
      camera.position.x = radius * Math.sin(cameraRotation.y) * Math.cos(cameraRotation.x);
      camera.position.y = radius * Math.sin(cameraRotation.x);
      camera.position.z = radius * Math.cos(cameraRotation.y) * Math.cos(cameraRotation.x);
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    animate();
  };

  const createBed = () => {
    const group = new window.THREE.Group();
    const mattress = new window.THREE.Mesh(
      new window.THREE.BoxGeometry(20, 3, 30),
      new window.THREE.MeshStandardMaterial({ color: 0xF5F5F5 })
    );
    mattress.position.y = 3;
    group.add(mattress);

    const headboard = new window.THREE.Mesh(
      new window.THREE.BoxGeometry(20, 12, 2),
      new window.THREE.MeshStandardMaterial({ color: 0x8B4513 })
    );
    headboard.position.set(0, 7, -14);
    group.add(headboard);

    const frame = new window.THREE.Mesh(
      new window.THREE.BoxGeometry(21, 1, 31),
      new window.THREE.MeshStandardMaterial({ color: 0x654321 })
    );
    frame.position.y = 1;
    group.add(frame);

    const pillow = new window.THREE.Mesh(
      new window.THREE.BoxGeometry(8, 2, 6),
      new window.THREE.MeshStandardMaterial({ color: 0xFFFFFF })
    );
    pillow.position.set(0, 5, -8);
    group.add(pillow);

    return group;
  };

  const createSofa = () => {
    const group = new window.THREE.Group();
    const seat = new window.THREE.Mesh(
      new window.THREE.BoxGeometry(25, 4, 12),
      new window.THREE.MeshStandardMaterial({ color: 0x4A5568 })
    );
    seat.position.y = 4;
    group.add(seat);

    const back = new window.THREE.Mesh(
      new window.THREE.BoxGeometry(25, 10, 3),
      new window.THREE.MeshStandardMaterial({ color: 0x4A5568 })
    );
    back.position.set(0, 9, -4.5);
    group.add(back);

    [-11, 11].forEach(x => {
      const arm = new window.THREE.Mesh(
        new window.THREE.BoxGeometry(3, 8, 12),
        new window.THREE.MeshStandardMaterial({ color: 0x3A4555 })
      );
      arm.position.set(x, 6, 0);
      group.add(arm);
    });

    for (let i = -8; i <= 8; i += 8) {
      const cushion = new window.THREE.Mesh(
        new window.THREE.BoxGeometry(7, 2, 10),
        new window.THREE.MeshStandardMaterial({ color: 0x5A6678 })
      );
      cushion.position.set(i, 6.5, 0);
      group.add(cushion);
    }

    return group;
  };

  const createChair = () => {
    const group = new window.THREE.Group();
    const seat = new window.THREE.Mesh(
      new window.THREE.BoxGeometry(6, 2, 6),
      new window.THREE.MeshStandardMaterial({ color: 0x8B4513 })
    );
    seat.position.y = 5;
    group.add(seat);

    const back = new window.THREE.Mesh(
      new window.THREE.BoxGeometry(6, 8, 1),
      new window.THREE.MeshStandardMaterial({ color: 0x8B4513 })
    );
    back.position.set(0, 9, -2.5);
    group.add(back);

    for (let x = -2; x <= 2; x += 4) {
      for (let z = -2; z <= 2; z += 4) {
        const leg = new window.THREE.Mesh(
          new window.THREE.CylinderGeometry(0.3, 0.3, 5),
          new window.THREE.MeshStandardMaterial({ color: 0x654321 })
        );
        leg.position.set(x, 2.5, z);
        group.add(leg);
      }
    }

    return group;
  };

  const createTable = () => {
    const group = new window.THREE.Group();
    const top = new window.THREE.Mesh(
      new window.THREE.BoxGeometry(20, 1.5, 15),
      new window.THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.3 })
    );
    top.position.y = 10;
    group.add(top);

    for (let x = -8; x <= 8; x += 16) {
      for (let z = -6; z <= 6; z += 12) {
        const leg = new window.THREE.Mesh(
          new window.THREE.BoxGeometry(1.5, 10, 1.5),
          new window.THREE.MeshStandardMaterial({ color: 0x654321 })
        );
        leg.position.set(x, 5, z);
        group.add(leg);
      }
    }

    return group;
  };

  const createDesk = () => {
    const group = new window.THREE.Group();
    const top = new window.THREE.Mesh(
      new window.THREE.BoxGeometry(18, 1.5, 10),
      new window.THREE.MeshStandardMaterial({ color: 0xA0522D, roughness: 0.3 })
    );
    top.position.y = 10;
    group.add(top);

    const drawerUnit = new window.THREE.Mesh(
      new window.THREE.BoxGeometry(6, 8, 9),
      new window.THREE.MeshStandardMaterial({ color: 0x8B4513 })
    );
    drawerUnit.position.set(-5, 5, 0);
    group.add(drawerUnit);

    for (let i = 0; i < 3; i++) {
      const handle = new window.THREE.Mesh(
        new window.THREE.BoxGeometry(3, 0.3, 0.3),
        new window.THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8 })
      );
      handle.position.set(-5, 3 + i * 2.5, 4.6);
      group.add(handle);
    }

    for (let x of [5, 7]) {
      for (let z = -4; z <= 4; z += 8) {
        const leg = new window.THREE.Mesh(
          new window.THREE.BoxGeometry(1.5, 10, 1.5),
          new window.THREE.MeshStandardMaterial({ color: 0x654321 })
        );
        leg.position.set(x, 5, z);
        group.add(leg);
      }
    }

    return group;
  };

  const createCabinet = () => {
    const group = new window.THREE.Group();
    const body = new window.THREE.Mesh(
      new window.THREE.BoxGeometry(15, 20, 8),
      new window.THREE.MeshStandardMaterial({ color: 0x8B4513 })
    );
    body.position.y = 10;
    group.add(body);

    [-3.5, 3.5].forEach(x => {
      const door = new window.THREE.Mesh(
        new window.THREE.BoxGeometry(6, 18, 0.5),
        new window.THREE.MeshStandardMaterial({ color: 0xA0522D })
      );
      door.position.set(x, 10, 4.2);
      group.add(door);

      const handle = new window.THREE.Mesh(
        new window.THREE.CylinderGeometry(0.2, 0.2, 1.5),
        new window.THREE.MeshStandardMaterial({ color: 0xFFD700, metalness: 0.9 })
      );
      handle.rotation.z = Math.PI / 2;
      handle.position.set(x + (x < 0 ? 2 : -2), 10, 4.6);
      group.add(handle);
    });

    return group;
  };

  const createBathtub = () => {
    const group = new window.THREE.Group();
    const tub = new window.THREE.Mesh(
      new window.THREE.BoxGeometry(18, 8, 12),
      new window.THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.2 })
    );
    tub.position.y = 4;
    group.add(tub);

    const inner = new window.THREE.Mesh(
      new window.THREE.BoxGeometry(16, 6, 10),
      new window.THREE.MeshStandardMaterial({ color: 0xE8F4F8, roughness: 0.1 })
    );
    inner.position.y = 5;
    group.add(inner);

    const faucet = new window.THREE.Mesh(
      new window.THREE.CylinderGeometry(0.5, 0.5, 4),
      new window.THREE.MeshStandardMaterial({ color: 0xC0C0C0, metalness: 0.9 })
    );
    faucet.position.set(-7, 9, 0);
    group.add(faucet);

    return group;
  };

  const createToilet = () => {
    const group = new window.THREE.Group();
    const bowl = new window.THREE.Mesh(
      new window.THREE.CylinderGeometry(4, 3, 6, 16),
      new window.THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.2 })
    );
    bowl.position.y = 3;
    group.add(bowl);

    const seat = new window.THREE.Mesh(
      new window.THREE.TorusGeometry(3, 0.5, 16, 32),
      new window.THREE.MeshStandardMaterial({ color: 0xF5F5F5 })
    );
    seat.rotation.x = Math.PI / 2;
    seat.position.y = 6.5;
    group.add(seat);

    const tank = new window.THREE.Mesh(
      new window.THREE.BoxGeometry(5, 8, 3),
      new window.THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.2 })
    );
    tank.position.set(0, 7, -3);
    group.add(tank);

    return group;
  };

  const createPlant = () => {
    const group = new window.THREE.Group();
    const pot = new window.THREE.Mesh(
      new window.THREE.CylinderGeometry(2, 1.5, 3, 16),
      new window.THREE.MeshStandardMaterial({ color: 0xB8866E })
    );
    pot.position.y = 1.5;
    group.add(pot);

    const soil = new window.THREE.Mesh(
      new window.THREE.CylinderGeometry(1.8, 1.8, 0.5, 16),
      new window.THREE.MeshStandardMaterial({ color: 0x654321 })
    );
    soil.position.y = 3;
    group.add(soil);

    const plant = new window.THREE.Mesh(
      new window.THREE.SphereGeometry(3, 8, 8),
      new window.THREE.MeshStandardMaterial({ color: 0x228B22 })
    );
    plant.position.y = 5;
    plant.scale.set(1, 1.5, 1);
    group.add(plant);

    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const leaf = new window.THREE.Mesh(
        new window.THREE.SphereGeometry(1.5, 6, 6),
        new window.THREE.MeshStandardMaterial({ color: 0x32CD32 })
      );
      leaf.position.set(
        Math.cos(angle) * 2,
        6 + Math.random(),
        Math.sin(angle) * 2
      );
      group.add(leaf);
    }

    return group;
  };

  const createFurniture = (type) => {
    const creators = {
      'bed': createBed,
      'sofa': createSofa,
      'chair': createChair,
      'table': createTable,
      'desk': createDesk,
      'cabinet': createCabinet,
      'bathtub': createBathtub,
      'toilet': createToilet,
      'plant': createPlant
    };

    const furniture = creators[type]();
    furniture.userData.type = type;

    furniture.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    return furniture;
  };

  const placeFurnitureAtMouse = (event) => {
    const rect = rendererRef.current.domElement.getBoundingClientRect();
    const mouse = mouseRef.current;
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouse, cameraRef.current);
    const intersects = raycasterRef.current.intersectObjects(floorGroupRef.current.children, true);

    if (intersects.length > 0) {
      const point = intersects[0].point;
      const furniture = createFurniture(selectedFurnitureTypeRef.current);
      furniture.position.set(point.x, 0, point.z);
      furniture.rotation.y = furnitureRotationRef.current;

      furnitureGroupRef.current.add(furniture);
      showModeIndicator(`${selectedFurnitureTypeRef.current.toUpperCase()} placed!`);

      setTimeout(() => {
        exitPlacementMode();
        selectFurnitureObject(furniture);
      }, 500);
    }
  };

  const selectFurnitureObject = (furniture) => {
    deselectFurniture();
    setSelectedFurniture(furniture);
    selectedFurnitureRef.current = furniture;
    createOutlineForFurniture(furniture);
    setEditPanelVisible(true);

    const scale = furniture.scale.x * 100;
    const rotation = (furniture.rotation.y * 180 / Math.PI) % 360;

    setFurnitureScale(scale);
    setFurnitureAngle(rotation);
    setFurniturePosX(Math.round(furniture.position.x));
    setFurniturePosZ(Math.round(furniture.position.z));

    rendererRef.current.domElement.style.cursor = 'pointer';
  };

  const deselectFurniture = () => {
    if (outlineMeshRef.current && sceneRef.current) {
      sceneRef.current.remove(outlineMeshRef.current);
      outlineMeshRef.current = null;
      setOutlineMesh(null);
    }
    setSelectedFurniture(null);
    selectedFurnitureRef.current = null;
    setEditPanelVisible(false);
    if (rendererRef.current) {
      rendererRef.current.domElement.style.cursor = 'default';
    }
  };

  const createOutlineForFurniture = (furniture) => {
    const box = new window.THREE.Box3().setFromObject(furniture);
    const size = new window.THREE.Vector3();
    box.getSize(size);
    const center = new window.THREE.Vector3();
    box.getCenter(center);

    const geometry = new window.THREE.BoxGeometry(size.x + 1, size.y + 1, size.z + 1);
    const edges = new window.THREE.EdgesGeometry(geometry);
    const outline = new window.THREE.LineSegments(
      edges,
      new window.THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 2 })
    );

    outline.position.copy(center);
    sceneRef.current.add(outline);
    outlineMeshRef.current = outline;
    setOutlineMesh(outline);
  };

  const updateOutline = (furniture) => {
    if (!outlineMeshRef.current || !sceneRef.current) return;

    const box = new window.THREE.Box3().setFromObject(furniture);
    const center = new window.THREE.Vector3();
    box.getCenter(center);
    outlineMeshRef.current.position.copy(center);
  };

  const deleteFurniture = () => {
    if (selectedFurniture && furnitureGroupRef.current) {
      furnitureGroupRef.current.remove(selectedFurniture);
      deselectFurniture();
      showModeIndicator('Furniture Deleted');
    }
  };

  const enterPlacementMode = (type) => {
    setPlacementMode(true);
    placementModeRef.current = true;
    setSelectedFurnitureType(type);
    selectedFurnitureTypeRef.current = type;
    setFurnitureRotation(0);
    furnitureRotationRef.current = 0;
    if (rendererRef.current) {
      rendererRef.current.domElement.style.cursor = 'crosshair';
    }
    showModeIndicator(`Placing ${type.toUpperCase()}\nClick floor • R rotate • ESC cancel`);
  };

  const exitPlacementMode = () => {
    setPlacementMode(false);
    placementModeRef.current = false;
    setSelectedFurnitureType(null);
    selectedFurnitureTypeRef.current = null;
    if (rendererRef.current) {
      rendererRef.current.domElement.style.cursor = 'default';
    }
  };

  const handleScaleChange = (value) => {
    if (selectedFurniture) {
      const scale = value / 100;
      selectedFurniture.scale.set(scale, scale, scale);
      setFurnitureScale(value);

      if (outlineMeshRef.current && sceneRef.current) {
        sceneRef.current.remove(outlineMeshRef.current);
        createOutlineForFurniture(selectedFurniture);
      }
    }
  };

  const handleRotationChange = (value) => {
    if (selectedFurniture) {
      const rotation = value * Math.PI / 180;
      selectedFurniture.rotation.y = rotation;
      setFurnitureAngle(value);
    }
  };

  const handlePositionXChange = (value) => {
    if (selectedFurniture) {
      selectedFurniture.position.x = parseFloat(value) || 0;
      setFurniturePosX(value);
      if (outlineMeshRef.current) updateOutline(selectedFurniture);
    }
  };

  const handlePositionZChange = (value) => {
    if (selectedFurniture) {
      selectedFurniture.position.z = parseFloat(value) || 0;
      setFurniturePosZ(value);
      if (outlineMeshRef.current) updateOutline(selectedFurniture);
    }
  };

  const processFloorPlan = (data, floorGroup, scene, camera) => {
    const roomColors = {
      'bedroom': 0xFFD700,
      'bathroom': 0x87CEEB,
      'living': 0x90EE90,
      'kitchen': 0xFF6347,
      'balcony': 0xDDA0DD,
      'storage': 0xF5DEB3,
      'door': 0x8B4513,
      'window': 0xADD8E6,
      'default': 0xCCCCCC
    };

    const wallHeight = 25;
    const wallThickness = 2;

    if (data.walls) {
      data.walls.forEach(wall => {
        const wallMesh = createWall(wall.x1, wall.y1, wall.x2, wall.y2, wallHeight, wallThickness);
        floorGroup.add(wallMesh);
      });
    }

    if (data.rooms) {
      data.rooms.forEach(room => {
        const roomType = room.name.split('_')[0].toLowerCase();
        
        if (['door', 'window', 'wall', 'inner', 'land'].includes(roomType)) {
          return;
        }

        const floor = createFloor(room.polygon, roomType, roomColors);
        if (floor) {
          floorGroup.add(floor);
        }
      });
    }

    const box = new window.THREE.Box3().setFromObject(floorGroup);
    const center = box.getCenter(new window.THREE.Vector3());
    const size = box.getSize(new window.THREE.Vector3());
    floorGroup.position.sub(center);

    const maxDim = Math.max(size.x, size.z);
    const distance = maxDim * 1.5;
    camera.position.setLength(distance);
  };

  const createWall = (x1, y1, x2, y2, height, thickness) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    const geometry = new window.THREE.BoxGeometry(length, height, thickness);
    const material = new window.THREE.MeshStandardMaterial({
      color: 0xC19A6B,
      roughness: 0.7,
      metalness: 0.1
    });

    const wall = new window.THREE.Mesh(geometry, material);
    wall.position.set((x1 + x2) / 2, height / 2, (y1 + y2) / 2);
    wall.rotation.y = -angle;
    wall.castShadow = true;
    wall.receiveShadow = true;

    return wall;
  };

  const createFloor = (coordinates, roomType, roomColors) => {
    if (!coordinates || coordinates.length < 3) return null;

    const shape = new window.THREE.Shape();
    shape.moveTo(coordinates[0][0], -coordinates[0][1]);

    for (let i = 1; i < coordinates.length; i++) {
      shape.lineTo(coordinates[i][0], -coordinates[i][1]);
    }

    const extrudeSettings = {
      depth: 2,
      bevelEnabled: false
    };

    const geometry = new window.THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.rotateX(-Math.PI / 2);

    const color = roomColors[roomType] || roomColors.default;
    const material = new window.THREE.MeshStandardMaterial({
      color: color,
      side: window.THREE.DoubleSide,
      roughness: 0.6,
      metalness: 0.1
    });

    const mesh = new window.THREE.Mesh(geometry, material);
    mesh.receiveShadow = true;

    return mesh;
  };

  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col z-50">
      <div className="bg-gray-800 p-4 flex items-center justify-between shadow-lg">
        <button
          onClick={onBack}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2 transition-colors"
        >
          <X className="w-5 h-5" />
          Back to Plans
        </button>
        <h2 className="text-white text-xl font-bold">3D Floor Plan Viewer with Furniture</h2>
        <div className="w-32"></div>
      </div>
      
      <div ref={containerRef} className="flex-1"></div>
      
      {/* Furniture Library Panel */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-2xl p-4 max-w-xs">
        <h4 className="text-sm font-bold mb-3 text-gray-800">🪑 Furniture Library</h4>
        <div className="grid grid-cols-3 gap-2">
          {furnitureLibrary.map(item => (
            <button
              key={item.type}
              onClick={() => enterPlacementMode(item.type)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all ${
                selectedFurnitureType === item.type
                  ? 'bg-green-100 border-green-500'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-indigo-400'
              }`}
              title={item.name}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs text-gray-700">{item.name}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Click furniture → Click floor to place<br />
          <strong>R</strong>: Rotate | <strong>Delete</strong>: Remove | <strong>ESC</strong>: Cancel
        </p>
      </div>

      {/* Edit Panel */}
      {editPanelVisible && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-2xl p-4 w-64">
          <h4 className="text-sm font-bold mb-3 text-gray-800">Edit Furniture</h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Position X:</label>
              <input
                type="number"
                value={furniturePosX}
                onChange={(e) => handlePositionXChange(e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Position Z:</label>
              <input
                type="number"
                value={furniturePosZ}
                onChange={(e) => handlePositionZChange(e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Scale: {Math.round(furnitureScale)}%
              </label>
              <input
                type="range"
                min="50"
                max="200"
                value={furnitureScale}
                onChange={(e) => handleScaleChange(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Rotation: {Math.round(furnitureAngle)}°
              </label>
              <input
                type="range"
                min="0"
                max="360"
                value={furnitureAngle}
                onChange={(e) => handleRotationChange(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <button
              onClick={deleteFurniture}
              className="w-full bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition-colors text-sm"
            >
              Delete Furniture
            </button>
          </div>
        </div>
      )}

      {/* Mode Indicator */}
      {modeIndicator && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-600 text-white px-6 py-4 rounded-lg text-center shadow-2xl pointer-events-none z-50 whitespace-pre-line">
          {modeIndicator}
        </div>
      )}

      <div className="bg-gray-800 p-4 text-white text-sm text-center shadow-lg">
        🖱️ Drag view: Rotate | 🖱️ Scroll: Zoom | 🖱️ Drag furniture: Move | Click: Select
      </div>
    </div>
  );
};

// Main Component
const FloorPlanGenerator = () => {
  const [bedrooms, setBedrooms] = useState(0);
  const [bathrooms, setBathrooms] = useState(0);
  const [minArea, setMinArea] = useState(50);
  const [maxArea, setMaxArea] = useState(500);
  const [hasKitchen, setHasKitchen] = useState(false);
  const [hasLiving, setHasLiving] = useState(false);
  const [hasBalcony, setHasBalcony] = useState(false);
  const [hasGarden, setHasGarden] = useState(false);
  const [hasStorage, setHasStorage] = useState(false);
  const [hasParking, setHasParking] = useState(false);
  const [hasStairs, setHasStairs] = useState(false);
  const [rankByVastu, setRankByVastu] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewingImage, setViewingImage] = useState(null);
  const [viewing3D, setViewing3D] = useState(null);
  const [viewing2D, setViewing2D] = useState(null);

  const API_URL = '/api';



  const generatePlans = async (vastuOptimized = false) => {
    setLoading(true);
    setError('');
    setResults([]);

   const params = {
  bedrooms: bedrooms,
  bathrooms: bathrooms,
  min_area: minArea,
  max_area: maxArea,
  has_kitchen: hasKitchen,
  has_living: hasLiving,
  has_balcony: hasBalcony,
  has_garden: hasGarden,
  has_storage: hasStorage,
  has_parking: hasParking,
  has_stairs: hasStairs,
  rank_by_vastu: vastuOptimized ? true : rankByVastu
};

console.log('Generating plans with params:', params);

    try {
      const endpoint = vastuOptimized ? '/generate-vastu' : '/generate-top5';
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });

      if (!response.ok) throw new Error('Failed to generate plans');

      const data = await response.json();
      
      if (data.error) {
  setError(data.error);
} else {
  setResults(data.results || []);
  console.log(`Received ${data.results?.length || 0} plans`);
}
   } catch (err) {
  setError(err.message || 'Failed to connect to server');
  console.error('Error generating plans:', err);
} finally {
      setLoading(false);
    }
  };

  if (viewing3D) {
    return <FloorPlan3DViewer floorPlanData={viewing3D} onBack={() => setViewing3D(null)} />;
  }

  if (viewing2D) {
    return <FloorPlanFurniture initialImage={viewing2D} onBack={() => setViewing2D(null)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <Home className="w-10 h-10 text-indigo-600" />
            AI Floor Plan Generator
          </h1>
          <p className="text-gray-600">Generate optimal floor plans with Vastu compliance analysis</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
  <h3 className="text-lg font-semibold mb-4 text-gray-800">Room Configuration</h3>
  
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Bedrooms: {bedrooms === 0 ? 'Any' : bedrooms}
      </label>
      <input
        type="range"
        min="0"
        max="8"
        value={bedrooms}
        onChange={(e) => setBedrooms(parseInt(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
      <p className="text-xs text-gray-500 mt-1">0 = Any number of bedrooms</p>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Bathrooms: {bathrooms === 0 ? 'Any' : bathrooms}
      </label>
      <input
        type="range"
        min="0"
        max="8"
        value={bathrooms}
        onChange={(e) => setBathrooms(parseInt(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
      <p className="text-xs text-gray-500 mt-1">0 = Any number of bathrooms</p>
    </div>
  </div>
</div>
<div className="bg-white rounded-lg shadow-md p-6">
  <h3 className="text-lg font-semibold mb-4 text-gray-800">Area Range (sqm)</h3>
  
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Area</label>
      <input
        type="number"
        value={minArea}
        onChange={(e) => setMinArea(parseFloat(e.target.value))}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Area</label>
      <input
        type="number"
        value={maxArea}
        onChange={(e) => setMaxArea(parseFloat(e.target.value))}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  </div>
</div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Features</h3>
              
              <div className="space-y-3">
                {[
                  { label: 'Kitchen', state: hasKitchen, setter: setHasKitchen },
                  { label: 'Living Room', state: hasLiving, setter: setHasLiving },
                  { label: 'Balcony', state: hasBalcony, setter: setHasBalcony },
                  { label: 'Garden', state: hasGarden, setter: setHasGarden },
                  { label: 'Storage', state: hasStorage, setter: setHasStorage },
                  { label: 'Parking', state: hasParking, setter: setHasParking },
                  { label: 'Stairs', state: hasStairs, setter: setHasStairs }
                ].map((item) => (
                  <label key={item.label} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.state}
                      onChange={(e) => item.setter(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Sorting Options</h3>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rankByVastu}
                  onChange={(e) => setRankByVastu(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">Rank by Vastu Score</span>
              </label>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => generatePlans(false)}
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                {loading ? 'Generating...' : 'Generate Top 5 Plans'}
              </button>

              <button
                onClick={() => generatePlans(true)}
                disabled={loading}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                {loading ? 'Generating...' : 'Best Vastu Plans'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-3">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {loading && (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            )}

            {!loading && results.length === 0 && !error && (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Select your preferences and click generate to see floor plans</p>
              </div>
            )}

            {!loading && results.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((result, idx) => (
                  <div key={idx} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col hover:shadow-xl transition-shadow">
                    <div 
                      className="relative group cursor-pointer"
                      onClick={() => setViewingImage({ src: `data:image/png;base64,${result.image}`, idx: idx + 1 })}
                    >
                      <img
                        src={`data:image/png;base64,${result.image}`}
                        alt={`Floor Plan ${idx + 1}`}
                        className="w-full h-64 object-contain bg-gray-50"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-3 shadow-lg">
                          <ExternalLink className="w-6 h-6 text-indigo-600" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="text-lg font-bold text-gray-800 mb-3">
                        Plan {idx + 1}
                      </h3>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Vastu Score:</span>
                          <span className="font-semibold text-indigo-600">
                            {result.vastu_score.toFixed(1)}/100
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Space Utilization:</span>
                          <span className="font-semibold text-green-600">
                            {(result.space_util * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="mb-4 pt-3 border-t border-gray-200">
                        <h4 className="font-semibold text-gray-800 text-sm mb-2">Room Placement:</h4>
                        <div className="text-xs text-gray-600 space-y-1 max-h-32 overflow-y-auto">
                          {result.vastu_report.split('\n').map((line, i) => (
                            <div key={i} className="leading-relaxed">
                              {line.replace(/\*\*/g, '')}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mt-auto space-y-2">
                        <button
                          onClick={() => setViewing2D(`data:image/png;base64,${result.image}`)}
                          className="w-full bg-purple-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <Sofa className="w-5 h-5" />
                          Try 2D Furniture
                        </button>
                        <button
                          onClick={() => setViewing3D(result.plan_3d_json)}
                          className="w-full bg-cyan-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-cyan-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <Box className="w-5 h-5" />
                          Try 3D View
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">About Vastu Compliance</h3>
              <p className="text-sm text-gray-600 mb-3">
                This tool evaluates floor plans based on traditional Vastu Shastra principles:
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <strong>Kitchen:</strong> Ideally in South-East</li>
                <li>• <strong>Bedrooms:</strong> South-West, West, or South</li>
                <li>• <strong>Living Room:</strong> North, North-East, or East</li>
                <li>• <strong>Bathrooms:</strong> North-West or West</li>
                <li>• <strong>Entrances/Balconies:</strong> North, East, or North-East</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {viewingImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setViewingImage(null)}
        >
          <button
            onClick={() => setViewingImage(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2"
          >
            <X className="w-8 h-8" />
          </button>
          
          <a
            href={viewingImage.src}
            download={`floor-plan-${viewingImage.idx}.png`}
            onClick={(e) => e.stopPropagation()}
            className="absolute top-4 right-20 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2"
            title="Download"
          >
            <Download className="w-8 h-8" />
          </a>

          <div className="max-w-6xl max-h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={viewingImage.src}
              alt={`Floor Plan ${viewingImage.idx}`}
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />
          </div>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 px-4 py-2 rounded-lg">
            Plan {viewingImage.idx} - Click outside to close
          </div>
        </div>
      )}
    </div>
  );
};

export default FloorPlanGenerator;