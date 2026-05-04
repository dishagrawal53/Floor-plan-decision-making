from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import pandas as pd
from shapely.geometry import Polygon, MultiPolygon, Point
import geopandas as gpd
import io
import base64
import pickle
import os

app = FastAPI(title="Floor Plan Generator API")

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Color scheme for room visualization
CATEGORY_COLORS = {
    "living": "#fabda7",
    "bedroom": "#66c2a5",
    "bathroom": "#a7e1fa",
    "kitchen": "#f5995f",
    "door": "#e78ac3",
    "window": "#a6d854",
    "wall": "#ffd92f",
    "front_door": "#a63603",
    "balcony": "#faf3a7",
    "parking": "#cccccc",
    "garden": "#99cc99",
    "pool": "#3399ff",
    "storage": "#ffcc99",
    "stair": "#666666",
}

class GenerateRequest(BaseModel):
    """Request model for floor plan generation"""
    bedrooms: int = 0
    bathrooms: int = 0
    min_area: Optional[float] = None
    max_area: Optional[float] = None
    has_kitchen: bool = False
    has_living: bool = False
    has_balcony: bool = False
    has_garden: bool = False
    has_storage: bool = False
    has_parking: bool = False
    has_stairs: bool = False
    rank_by_vastu: bool = False


def normalize_keys(plan):
    """Fix common typos in plan keys"""
    plan = plan.copy()
    if "balacony" in plan and "balcony" not in plan:
        plan["balcony"] = plan.pop("balacony")
    return plan


def get_geometries(geom_data):
    """Extract individual geometries from Polygon or MultiPolygon"""
    if geom_data is None:
        return []
    if isinstance(geom_data, Polygon):
        return [] if geom_data.is_empty else [geom_data]
    if isinstance(geom_data, MultiPolygon):
        return [g for g in geom_data.geoms if g is not None and not g.is_empty]
    return []


def room_area(geom_data):
    """Calculate total area of room geometry"""
    geoms = get_geometries(geom_data)
    return sum(g.area for g in geoms)


def room_count(plan, room):
    """Count number of rooms of a specific type"""
    geom = plan.get(room)
    if not isinstance(geom, (Polygon, MultiPolygon)) or geom.is_empty:
        return 0
    if isinstance(geom, Polygon):
        return 1
    return len(geom.geoms)


def has_room(geom):
    """Check if room geometry exists and is valid"""
    return isinstance(geom, (Polygon, MultiPolygon)) and not geom.is_empty


def plot_plan(plan, categories=None, colors=CATEGORY_COLORS, title=None):
    """Generate floor plan visualization as base64 image"""
    plan = normalize_keys(plan)
    if categories is None:
        categories = list(CATEGORY_COLORS.keys())

    geoms, color_list, present = [], [], []
    for key in categories:
        parts = get_geometries(plan.get(key))
        if not parts:
            continue
        geoms.extend(parts)
        color_list.extend([colors.get(key, "#000000")] * len(parts))
        if key not in present:
            present.append(key)

    fig, ax = plt.subplots(figsize=(8, 8))

    if geoms:
        gseries = gpd.GeoSeries(geoms)
        gseries.plot(ax=ax, color=color_list, edgecolor="black", linewidth=0.5)

    ax.set_aspect("equal", adjustable="box")
    ax.set_axis_off()

    if title:
        ax.set_title(title, fontsize=14, fontweight='bold')

    if geoms:
        from matplotlib.patches import Patch
        handles = [
            Patch(facecolor=colors.get(k, "#000000"), edgecolor="black",
                  label=f"{k} ({room_area(plan.get(k)):.0f} sqm)")
            for k in present
        ]
        ax.legend(handles=handles, loc="upper left", bbox_to_anchor=(1, 1), frameon=False)

    plt.tight_layout()

    buf = io.BytesIO()
    fig.savefig(buf, format='png', dpi=100, bbox_inches='tight')
    buf.seek(0)
    img_base64 = base64.b64encode(buf.read()).decode('utf-8')
    plt.close(fig)
    
    return img_base64


def efficiency(plan):
    """Calculate space efficiency ratio"""
    return plan['net_area'] / plan['area'] if plan.get('area', 0) > 0 else 0


def plot_utilization(plan):
    """Calculate plot utilization ratio"""
    land = plan.get('land')
    inner = plan.get('inner')
    if not has_room(land) or not has_room(inner):
        return 0
    return inner.area / land.area


def convert_plan_to_3d_json(plan):
    """Convert floor plan to 3D viewer JSON format"""
    output = {"walls": [], "rooms": []}
    
    def extract_polygon_coordinates(geom):
        """Extract coordinates from geometry"""
        if geom is None or geom.is_empty:
            return []
        
        if isinstance(geom, Polygon):
            return list(geom.exterior.coords[:-1])
        elif isinstance(geom, MultiPolygon):
            polygons = list(geom.geoms)
            if not polygons:
                return []
            largest = max(polygons, key=lambda p: p.area)
            return list(largest.exterior.coords[:-1])
        
        return []
    
    def extract_walls_from_polygon(coords):
        """Generate wall segments from coordinates"""
        walls = []
        for i in range(len(coords)):
            x1, y1 = coords[i]
            x2, y2 = coords[(i + 1) % len(coords)]
            walls.append({
                "x1": float(x1),
                "y1": float(y1),
                "x2": float(x2),
                "y2": float(y2)
            })
        return walls
    
    included_room_types = ['bedroom', 'bathroom', 'living', 'kitchen', 'balcony', 'storage']
    
    # Process room types
    for room_type, geometry in plan.items():
        if not isinstance(geometry, (Polygon, MultiPolygon)):
            continue
        
        if room_type in ['inner', 'wall', 'land', 'graph', 'neighbor']:
            continue
        
        base_type = room_type.split('_')[0].lower()
        
        if base_type in ['door', 'window', 'front_door']:
            continue
        
        if base_type not in included_room_types:
            continue
        
        coords = extract_polygon_coordinates(geometry)
        if not coords:
            continue
        
        room = {
            "name": room_type,
            "polygon": [[float(x), float(y)] for x, y in coords]
        }
        output["rooms"].append(room)
        
        room_walls = extract_walls_from_polygon(coords)
        output["walls"].extend(room_walls)
    
    # Process wall geometry
    if 'wall' in plan and isinstance(plan['wall'], (Polygon, MultiPolygon)):
        wall_geom = plan['wall']
        
        if isinstance(wall_geom, MultiPolygon):
            for poly in wall_geom.geoms:
                if not poly.is_empty:
                    coords = list(poly.exterior.coords[:-1])
                    wall_segments = extract_walls_from_polygon(coords)
                    output["walls"].extend(wall_segments)
        elif isinstance(wall_geom, Polygon) and not wall_geom.is_empty:
            coords = list(wall_geom.exterior.coords[:-1])
            wall_segments = extract_walls_from_polygon(coords)
            output["walls"].extend(wall_segments)
    
    # Process doors, windows, and front_door
    for room_type, geometry in plan.items():
        if not isinstance(geometry, (Polygon, MultiPolygon)):
            continue
        
        base_type = room_type.split('_')[0].lower()
        
        if base_type not in ['door', 'window', 'front_door']:
            continue
        
        if isinstance(geometry, MultiPolygon):
            for poly in geometry.geoms:
                if not poly.is_empty:
                    coords = list(poly.exterior.coords[:-1])
                    if coords:
                        room = {
                            "name": room_type,
                            "polygon": [[float(x), float(y)] for x, y in coords]
                        }
                        output["rooms"].append(room)
        elif isinstance(geometry, Polygon) and not geometry.is_empty:
            coords = list(geometry.exterior.coords[:-1])
            if coords:
                room = {
                    "name": room_type,
                    "polygon": [[float(x), float(y)] for x, y in coords]
                }
                output["rooms"].append(room)
    
    # Remove duplicate walls
    unique_walls = []
    seen = set()
    for wall in output["walls"]:
        key = tuple(sorted([
            (wall["x1"], wall["y1"]),
            (wall["x2"], wall["y2"])
        ]))
        if key not in seen:
            seen.add(key)
            unique_walls.append(wall)
    
    output["walls"] = unique_walls
    
    return output


class VastuCompliance:
    """Vastu Shastra compliance evaluation"""
    
    def __init__(self):
        self.zones = {
            'north': (337.5, 22.5),
            'north_east': (22.5, 67.5),
            'east': (67.5, 112.5),
            'south_east': (112.5, 157.5),
            'south': (157.5, 202.5),
            'south_west': (202.5, 247.5),
            'west': (247.5, 292.5),
            'north_west': (292.5, 337.5)
        }

        self.ideal_placements = {
            'kitchen': ['south_east'],
            'bedroom': ['south_west', 'west', 'south'],
            'living': ['north', 'north_east', 'east'],
            'bathroom': ['north_west', 'west'],
            'front_door': ['north', 'east', 'north_east'],
            'balcony': ['north', 'east', 'north_east'],
        }

    def evaluate(self, plan):
        """Evaluate plan and return score with analysis"""
        room_positions = self._calculate_room_positions(plan)
        score = self._calculate_vastu_score(room_positions)
        report = self._generate_vastu_report(room_positions)
        return {
            "vastu_score": score,
            "vastu_analysis": report
        }

    def _calculate_room_positions(self, plan):
        """Determine zone position for each room"""
        positions = {}

        if plan.get('inner') and not plan['inner'].is_empty:
            plan_center = plan['inner'].centroid
        elif plan.get('land') and not plan['land'].is_empty:
            plan_center = plan['land'].centroid
        else:
            plan_center = Point(128, 128)

        for room_type in self.ideal_placements.keys():
            geom = plan.get(room_type)
            if not isinstance(geom, (Polygon, MultiPolygon)) or geom.is_empty:
                continue

            room_center = geom.centroid
            dx = room_center.x - plan_center.x
            dy = room_center.y - plan_center.y
            angle = np.degrees(np.arctan2(dx, dy)) % 360

            positions[room_type] = {"zone": self._get_zone_for_angle(angle)}

        return positions

    def _get_zone_for_angle(self, angle):
        """Map angle to directional zone"""
        for zone, (start, end) in self.zones.items():
            if start <= angle < end or (start > end and (angle >= start or angle < end)):
                return zone
        return 'north'

    def _calculate_vastu_score(self, room_positions):
        """Calculate weighted Vastu compliance score"""
        weights = {
            'kitchen': 1.5,
            'bedroom': 1.3,
            'living': 1.2,
            'bathroom': 1.0,
            'front_door': 1.5,
            'balcony': 0.8,
        }

        total, weight_sum = 0, 0
        for room, pos in room_positions.items():
            ideal = self.ideal_placements.get(room, [])
            score = 100 if pos['zone'] in ideal else 50
            w = weights.get(room, 1.0)
            total += score * w
            weight_sum += w

        return total / weight_sum if weight_sum else 50

    def _generate_vastu_report(self, room_positions):
        """Generate human-readable Vastu report"""
        lines = []
        for room, pos in room_positions.items():
            zone = pos['zone'].replace('_', ' ').title()
            status = "✓ Optimal" if pos['zone'] in self.ideal_placements.get(room, []) else "○ Acceptable"
            lines.append(f"**{room.title()}**: {zone} — {status}")
        return "\n".join(lines)


class FloorPlanGenerator:
    """Main floor plan generation and filtering engine"""
    
    def __init__(self, df, plans):
        self.df = df
        self.plans = plans
        self.vastu = VastuCompliance()
        self.min_area_default = df["area"].min()
        self.max_area_default = df["area"].max()

    def space_utilization(self, plan):
        """Calculate space utilization ratio"""
        land = plan.get("land")
        inner = plan.get("inner")
        if not land or not inner or land.is_empty or inner.is_empty:
            return 0.0
        return inner.area / land.area

    def _verify_plan_matches_criteria(self, plan, request: GenerateRequest):
        """Verify plan matches exact filtering criteria"""
        plan_bedrooms = room_count(plan, 'bedroom')
        plan_bathrooms = room_count(plan, 'bathroom')
        
        # Check bedrooms - only filter if specified
        if request.bedrooms > 0 and plan_bedrooms != request.bedrooms:
            return False
        
        # Check bathrooms
        if request.bathrooms > 0 and plan_bathrooms != request.bathrooms:
            return False
        
        # Check features
        if request.has_kitchen and not has_room(plan.get('kitchen')):
            return False
        if request.has_living and not has_room(plan.get('living')):
            return False
        if request.has_balcony and not has_room(plan.get('balcony')):
            return False
        if request.has_garden and not has_room(plan.get('garden')):
            return False
        if request.has_storage and not has_room(plan.get('storage')):
            return False
        if request.has_parking and not has_room(plan.get('parking')):
            return False
        if request.has_stairs and not has_room(plan.get('stair')):
            return False
        
        return True

    def generate_top5(self, request: GenerateRequest):
        """Generate top 5 floor plans based on criteria"""
        print(f"🔎 FILTERING CRITERIA:")
        print(f"   Bedrooms: {request.bedrooms if request.bedrooms > 0 else 'Any'}")
        print(f"   Bathrooms: {request.bathrooms if request.bathrooms > 0 else 'Any'}")
        print(f"   Area: {request.min_area or self.min_area_default}-{request.max_area or self.max_area_default} sqm")
        
        # Process ALL plans with verification (no dataframe pre-filtering)
        min_area = request.min_area if request.min_area else self.min_area_default
        max_area = request.max_area if request.max_area else self.max_area_default
        
        results = []
        for idx, plan in enumerate(self.plans):
            # Verify area
            plan_area = plan.get('area', 0)
            if plan_area < min_area or plan_area > max_area:
                continue
            
            # STRICT verification - must match exact criteria
            if not self._verify_plan_matches_criteria(plan, request):
                continue
            
            # Count rooms to display in logs
            plan_bedrooms = room_count(plan, 'bedroom')
            plan_bathrooms = room_count(plan, 'bathroom')
            
            vastu_result = self.vastu.evaluate(plan)

            results.append({
                "plan": plan,
                "vastu_score": vastu_result["vastu_score"],
                "vastu_report": vastu_result["vastu_analysis"],
                "space_util": self.space_utilization(plan),
                "bedrooms": plan_bedrooms,
                "bathrooms": plan_bathrooms
            })

        if not results:
            return {"error": "No floor plans match the selected filters."}

        print(f"✅ Found {len(results)} plans matching ALL criteria")

        # Sort results
        if request.rank_by_vastu:
            results.sort(key=lambda x: (-x["vastu_score"], -x["space_util"]))
            print(f"🏆 Top 5 by Vastu: {[round(r['vastu_score'], 1) for r in results[:5]]}")
        else:
            results.sort(key=lambda x: (-x["space_util"], -x["vastu_score"]))
            print(f"🏆 Top 5 by Space: {[round(r['space_util'] * 100, 1) for r in results[:5]]}")
        
        # Display what we're returning
        for i, r in enumerate(results[:5], 1):
            print(f"   Plan {i}: {r['bedrooms']}BR / {r['bathrooms']}BA - Vastu: {r['vastu_score']:.1f}")

        return self._format_results(results[:5])

    def generate_vastu_optimized(self, request: GenerateRequest):
        """Generate Vastu-optimized floor plans - explores ALL matching plans"""
        print(f"🔎 VASTU OPTIMIZATION CRITERIA:")
        print(f"   Bedrooms: {request.bedrooms if request.bedrooms > 0 else 'Any'}")
        print(f"   Bathrooms: {request.bathrooms if request.bathrooms > 0 else 'Any'}")
        print(f"   Area: {request.min_area or self.min_area_default}-{request.max_area or self.max_area_default} sqm")
        
        # Process ALL plans with verification
        min_area = request.min_area if request.min_area else self.min_area_default
        max_area = request.max_area if request.max_area else self.max_area_default
        
        results = []
        for idx, plan in enumerate(self.plans):
            # Verify area
            plan_area = plan.get('area', 0)
            if plan_area < min_area or plan_area > max_area:
                continue
            
            # STRICT verification - must match exact criteria
            if not self._verify_plan_matches_criteria(plan, request):
                continue
            
            # Count rooms to display in logs
            plan_bedrooms = room_count(plan, 'bedroom')
            plan_bathrooms = room_count(plan, 'bathroom')
            
            vastu_result = self.vastu.evaluate(plan)

            results.append({
                "plan": plan,
                "vastu_score": vastu_result["vastu_score"],
                "vastu_report": vastu_result["vastu_analysis"],
                "space_util": self.space_utilization(plan),
                "bedrooms": plan_bedrooms,
                "bathrooms": plan_bathrooms
            })

        if not results:
            return {"error": "No floor plans match the selected filters with Vastu optimization."}

        print(f"✅ Found {len(results)} plans matching ALL criteria")

        # Sort by Vastu score (highest first), then by space utilization
        results.sort(key=lambda x: (-x["vastu_score"], -x["space_util"]))

        print(f"🌟 Top 5 Vastu scores: {[round(r['vastu_score'], 1) for r in results[:5]]}")
        print(f"📈 Vastu score range: {results[-1]['vastu_score']:.1f} to {results[0]['vastu_score']:.1f}")
        
        # Display what we're returning
        for i, r in enumerate(results[:5], 1):
            print(f"   Plan {i}: {r['bedrooms']}BR / {r['bathrooms']}BA - Vastu: {r['vastu_score']:.1f}")

        return self._format_results(results[:5])

    def _format_results(self, results):
        """Format results for API response"""
        formatted = []
        for i, r in enumerate(results, 1):
            img_base64 = plot_plan(
                r["plan"],
                title=f"Plan {i} | Vastu: {r['vastu_score']:.1f}"
            )
            
            plan_3d_json = convert_plan_to_3d_json(r["plan"])

            formatted.append({
                "image": img_base64,
                "vastu_score": r["vastu_score"],
                "space_util": r["space_util"],
                "vastu_report": r["vastu_report"],
                "plan_3d_json": plan_3d_json
            })

        return {"results": formatted}


def load_data():
    """Load floor plan data from pickle file"""
    pkl_path = "ResPlan.pkl"
    
    if not os.path.exists(pkl_path):
        raise FileNotFoundError(
            f"Data file '{pkl_path}' not found. Please place ResPlan.pkl in the same directory."
        )
    
    with open(pkl_path, "rb") as f:
        data = pickle.load(f)
    
    print(f"✓ Loaded {len(data)} floor plans from dataset")
    return data


def create_dataframe(data):
    """Create DataFrame with plan metadata"""
    records = []
    for idx, plan in enumerate(data):
        try:
            record = {
                'id': plan.get('id', idx),
                'idx': idx,
                'unit_type': plan.get('unitType', 'Unknown'),
                'area': plan.get('area', 0),
                'net_area': plan.get('net_area', 0),
                'efficiency': efficiency(plan),
                'plot_utilization': plot_utilization(plan),
                'bedrooms': room_count(plan, 'bedroom'),
                'bathrooms': room_count(plan, 'bathroom'),
                'has_kitchen': 1 if has_room(plan.get('kitchen')) else 0,
                'has_living': 1 if has_room(plan.get('living')) else 0,
                'has_balcony': 1 if has_room(plan.get('balcony')) else 0,
                'has_parking': 1 if has_room(plan.get('parking')) else 0,
                'has_garden': 1 if has_room(plan.get('garden')) else 0,
                'has_pool': 1 if has_room(plan.get('pool')) else 0,
                'has_storage': 1 if has_room(plan.get('storage')) else 0,
                'has_stairs': 1 if has_room(plan.get('stair')) else 0,
                'living_area': room_area(plan.get('living')),
                'kitchen_area': room_area(plan.get('kitchen')),
                'bedroom_area': room_area(plan.get('bedroom')),
                'bathroom_area': room_area(plan.get('bathroom')),
            }
            records.append(record)
        except Exception as e:
            print(f"⚠️  Skipping plan {idx}: {e}")

    df = pd.DataFrame(records)
    print(f"✓ Created DataFrame with {len(df)} plans")
    print(f"📊 Bedroom distribution: {dict(df['bedrooms'].value_counts().sort_index())}")
    print(f"📊 Bathroom distribution: {dict(df['bathrooms'].value_counts().sort_index())}")
    return df


# Global generator instance
generator = None


@app.on_event("startup")
async def startup_event():
    """Initialize the floor plan generator on startup"""
    global generator
    print("=" * 60)
    print("🚀 Initializing AI Floor Plan Generator...")
    print("=" * 60)
    
    try:
        data = load_data()
        df = create_dataframe(data)
        generator = FloorPlanGenerator(df, data)
        print("=" * 60)
        print("✅ Server ready! All 17,000+ plans loaded and indexed.")
        print("=" * 60)
    except Exception as e:
        print(f"❌ Error during startup: {e}")
        raise


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Floor Plan Generator API is running",
        "version": "2.0",
        "total_plans": len(generator.plans) if generator else 0,
        "features": [
            "Top 5 Plans by Space Utilization",
            "Best Vastu Optimized Plans",
            "17,000+ Floor Plans Dataset",
            "Flexible Filtering Options"
        ]
    }


@app.post("/generate-top5")
async def generate_top5(request: GenerateRequest):
    """Generate top 5 floor plans endpoint"""
    if generator is None:
        raise HTTPException(status_code=500, detail="Generator not initialized")
    
    print("\n" + "="*60)
    print("🔍 REQUEST: Generate Top 5 Plans")
    print(f"Bedrooms: {request.bedrooms or 'Any'}, Bathrooms: {request.bathrooms or 'Any'}")
    print(f"Area: {request.min_area}-{request.max_area} sqm")
    print(f"Features: Kitchen={request.has_kitchen}, Living={request.has_living}")
    print("="*60)
    
    try:
        result = generator.generate_top5(request)
        print("="*60 + "\n")
        return result
    except Exception as e:
        print(f"❌ Error: {e}")
        print("="*60 + "\n")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate-vastu")
async def generate_vastu(request: GenerateRequest):
    """Generate Vastu-optimized floor plans endpoint"""
    if generator is None:
        raise HTTPException(status_code=500, detail="Generator not initialized")
    
    print("\n" + "="*60)
    print("🌟 REQUEST: Generate Best Vastu Plans")
    print(f"Bedrooms: {request.bedrooms or 'Any'}, Bathrooms: {request.bathrooms or 'Any'}")
    print(f"Area: {request.min_area}-{request.max_area} sqm")
    print(f"Features: Kitchen={request.has_kitchen}, Living={request.has_living}")
    print("="*60)
    
    try:
        result = generator.generate_vastu_optimized(request)
        print("="*60 + "\n")
        return result
    except Exception as e:
        print(f"❌ Error: {e}")
        print("="*60 + "\n")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)





