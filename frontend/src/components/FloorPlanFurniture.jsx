import React, { useState, useRef, useEffect } from 'react';
import { Upload, RotateCw, Trash2, Save, Search, FlipHorizontal, Download, Check, ArrowLeft } from 'lucide-react';

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

  /* -------------------- AUTO LOAD AI IMAGE -------------------- */
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

  /* -------------------- CATEGORIES -------------------- */
  const categories = [
    { id: 'all', name: 'All', icon: '🏠' },
    { id: 'living', name: 'Living', icon: '🛋️' },
    { id: 'bedroom', name: 'Bedroom', icon: '🛏️' },
    { id: 'kitchen', name: 'Kitchen', icon: '🍽️' },
    { id: 'dining', name: 'Dining', icon: '🪑' },
    { id: 'bathroom', name: 'Bath', icon: '🚿' },
    { id: 'decor', name: 'Decor', icon: '🪴' }
  ];

  /* -------------------- FURNITURE CATALOG -------------------- */
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

  /* -------------------- FILE UPLOAD (OPTIONAL) -------------------- */
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        setFloorPlanImage(img);
        setImageLoaded(true);
        setFurniture([]);
        setSelectedItem(null);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  /* -------------------- CANVAS DRAW -------------------- */
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
      ctx.fillText('Upload a floor plan to get started', canvas.width / 2, canvas.height / 2);
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

  /* -------------------- ADD FURNITURE -------------------- */
  const addFurniture = (catalogItem) => {
    if (!imageLoaded) {
      alert('Please upload a floor plan first!');
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

  /* -------------------- MOUSE HANDLERS -------------------- */
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

  /* -------------------- FURNITURE CONTROLS -------------------- */
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

  /* -------------------- SAVE & EXPORT -------------------- */
  const saveLayout = () => {
    const layout = { furniture, timestamp: new Date().toISOString() };
    const dataStr = JSON.stringify(layout, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', 'floor-plan-' + Date.now() + '.json');
    link.click();
  };

  const exportAsImage = () => {
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.setAttribute('href', dataUrl);
    link.setAttribute('download', 'floor-plan-' + Date.now() + '.png');
    link.click();
  };

  /* -------------------- UI -------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-4">
              {onBack && (
                <button
                  onClick={onBack}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <ArrowLeft size={20} />
                  Back
                </button>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                   Floor Plan Designer
                </h1>
                <p className="text-gray-600 text-sm mt-1">Design your space with professional drag & drop tools</p>
              </div>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={saveLayout}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                <Save size={18} /> Save
              </button>
              <button
                onClick={exportAsImage}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
              >
                <Download size={18} /> Export
              </button>
            </div>
          </div>

          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
            <div className="flex items-center gap-4 flex-wrap">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current.click()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-md transition-colors"
              >
                <Upload size={20} /> Upload Floor Plan
              </button>
              {imageLoaded && (
                <span className="flex items-center gap-2 text-green-600 font-medium">
                  <Check size={20} /> Floor plan loaded!
                </span>
              )}
            </div>
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
                <h3 className="font-bold mb-3 text-gray-800 text-lg"> Controls</h3>
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
                    <RotateCw size={18} /> Rotate 90°
                  </button>
                  <button
                    onClick={flipFurniture}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <FlipHorizontal size={18} /> Flip Mirror
                  </button>
                  <button
                    onClick={deleteFurniture}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Trash2 size={18} /> Delete
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
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
    </div>
  );
};

export default FloorPlanFurniture;