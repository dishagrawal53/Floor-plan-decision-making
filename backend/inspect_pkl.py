import pickle
import numpy as np
from shapely.geometry import Polygon, MultiPolygon

def get_geometries(geom_data):
    if geom_data is None:
        return []
    if isinstance(geom_data, Polygon):
        return [] if geom_data.is_empty else [geom_data]
    if isinstance(geom_data, MultiPolygon):
        return [g for g in geom_data.geoms if g is not None and not g.is_empty]
    return []

with open("ResPlan.pkl", "rb") as f:
    data = pickle.load(f)

print(f"Total plans: {len(data)}")
print("=" * 60)

# Inspect first 3 plans in detail
for i, plan in enumerate(data[:3]):
    print(f"\n📋 PLAN {i+1}")
    print(f"  Keys: {list(plan.keys())}")
    print(f"  area (metadata): {plan.get('area', 'N/A')}")
    print(f"  net_area (metadata): {plan.get('net_area', 'N/A')}")
    print(f"  unitType: {plan.get('unitType', 'N/A')}")

    # Check land/inner geometry
    for key in ['land', 'inner']:
        geom = plan.get(key)
        if geom and not geom.is_empty:
            minx, miny, maxx, maxy = geom.bounds
            print(f"\n  [{key}] bounds:")
            print(f"    minx={minx:.2f}, miny={miny:.2f}, maxx={maxx:.2f}, maxy={maxy:.2f}")
            print(f"    coord width  = {maxx - minx:.2f} units")
            print(f"    coord height = {maxy - miny:.2f} units")
            print(f"    coord area   = {geom.area:.2f} sq units")
            print(f"    metadata area= {plan.get('area', 'N/A')} (from plan dict)")
            if plan.get('area'):
                scale = (plan['area'] / geom.area) ** 0.5
                print(f"    ➡ scale factor = sqrt(metadata_area / coord_area) = {scale:.6f} m/unit")
                print(f"    ➡ real width   = {(maxx - minx) * scale:.2f} m")
                print(f"    ➡ real height  = {(maxy - miny) * scale:.2f} m")

    # Check individual rooms
    room_keys = ['bedroom', 'bathroom', 'living', 'kitchen', 'balcony']
    print(f"\n  Room dimensions (raw coords vs estimated real):")
    for key in room_keys:
        geom = plan.get(key)
        if geom is None:
            continue
        parts = get_geometries(geom)
        for j, part in enumerate(parts):
            if part.is_empty:
                continue
            minx, miny, maxx, maxy = part.bounds
            w = maxx - minx
            h = maxy - miny
            print(f"    {key}[{j}]: {w:.1f} × {h:.1f} units  |  area={part.area:.1f} sq units")

    print("-" * 60)

# Summary stats across all plans
print("\n📊 SUMMARY ACROSS ALL PLANS")
areas_meta = []
areas_coord = []
scale_factors = []

for plan in data:
    meta_area = plan.get('area', 0)
    land = plan.get('land') or plan.get('inner')
    if land and not land.is_empty and meta_area and meta_area > 0:
        coord_area = land.area
        if coord_area > 0:
            areas_meta.append(meta_area)
            areas_coord.append(coord_area)
            scale_factors.append((meta_area / coord_area) ** 0.5)

if scale_factors:
    print(f"  metadata area range : {min(areas_meta):.1f} – {max(areas_meta):.1f}")
    print(f"  coord area range    : {min(areas_coord):.1f} – {max(areas_coord):.1f} sq units")
    print(f"  scale factor min    : {min(scale_factors):.6f}")
    print(f"  scale factor max    : {max(scale_factors):.6f}")
    print(f"  scale factor mean   : {np.mean(scale_factors):.6f}")
    print(f"  scale factor median : {np.median(scale_factors):.6f}")
    print(f"  scale factor std    : {np.std(scale_factors):.6f}")
    print(f"\n  ➡ If std is very small, a FIXED scale factor exists.")
    print(f"  ➡ Multiply any coord dimension by {np.median(scale_factors):.6f} to get metres.")
