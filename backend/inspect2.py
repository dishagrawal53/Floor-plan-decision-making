import pickle
import numpy as np
from shapely.geometry import Polygon, MultiPolygon
from collections import Counter
import networkx as nx


DATASET_PATH = "ResPlan.pkl"


def get_geometries(geom):
    """Return list of polygons from Polygon or MultiPolygon"""
    if geom is None:
        return []

    if isinstance(geom, Polygon):
        if geom.is_empty:
            return []
        return [geom]

    if isinstance(geom, MultiPolygon):
        return [g for g in geom.geoms if not g.is_empty]

    return []


def polygon_bbox(poly):
    """Return width and height of polygon"""
    minx, miny, maxx, maxy = poly.bounds
    return maxx - minx, maxy - miny


def inspect_dataset(dataset):

    print("\n==============================")
    print("DATASET BASIC INFO")
    print("==============================")

    print("Total plans:", len(dataset))
    print("Type:", type(dataset))

    plan = dataset[0]

    print("\nExample plan keys:")
    for k in plan.keys():
        print(" ", k)


def inspect_key_types(dataset):

    print("\n==============================")
    print("KEY TYPE ANALYSIS")
    print("==============================")

    plan = dataset[0]

    for key, value in plan.items():
        print(f"{key:15} -> {type(value)}")


def inspect_room_statistics(dataset):

    print("\n==============================")
    print("ROOM STATISTICS")
    print("==============================")

    room_counter = Counter()

    for plan in dataset:

        for key, value in plan.items():

            if isinstance(value, (Polygon, MultiPolygon)):

                if isinstance(value, Polygon):
                    if not value.is_empty:
                        room_counter[key] += 1

                elif isinstance(value, MultiPolygon):
                    room_counter[key] += len(value.geoms)

    for room, count in room_counter.most_common():
        print(f"{room:15} {count}")


def inspect_coordinate_ranges(dataset):

    print("\n==============================")
    print("COORDINATE RANGE ANALYSIS")
    print("==============================")

    min_x = float("inf")
    max_x = float("-inf")

    min_y = float("inf")
    max_y = float("-inf")

    for plan in dataset:

        for geom in plan.values():

            for poly in get_geometries(geom):

                xs, ys = poly.exterior.xy

                min_x = min(min_x, min(xs))
                max_x = max(max_x, max(xs))

                min_y = min(min_y, min(ys))
                max_y = max(max_y, max(ys))

    print("X range:", min_x, "to", max_x)
    print("Y range:", min_y, "to", max_y)


def inspect_area_relationship(dataset):

    print("\n==============================")
    print("AREA RELATIONSHIP")
    print("==============================")

    ratios = []

    for plan in dataset:

        meta_area = plan.get("area", None)

        land = plan.get("land")

        if meta_area and land:

            coord_area = land.area

            if coord_area > 0:

                scale = (meta_area / coord_area) ** 0.5
                ratios.append(scale)

    ratios = np.array(ratios)

    print("Number of valid plans:", len(ratios))
    print("Mean scale factor:", ratios.mean())
    print("Median scale factor:", np.median(ratios))
    print("Std:", ratios.std())
    print("Min:", ratios.min())
    print("Max:", ratios.max())


def inspect_room_dimensions(dataset):

    print("\n==============================")
    print("ROOM DIMENSION EXAMPLES")
    print("==============================")

    plan = dataset[0]

    for key, geom in plan.items():

        geoms = get_geometries(geom)

        if len(geoms) == 0:
            continue

        print("\nRoom type:", key)

        for i, poly in enumerate(geoms[:3]):

            w, h = polygon_bbox(poly)

            print(f"  room {i+1}: {w:.2f} × {h:.2f} units")
        break


def inspect_graph(dataset):

    print("\n==============================")
    print("GRAPH STRUCTURE")
    print("==============================")

    plan = dataset[0]

    graph = plan.get("graph")

    if graph is None:
        print("No graph found")
        return

    print("Graph type:", type(graph))

    if isinstance(graph, nx.Graph):

        print("Nodes:", graph.number_of_nodes())
        print("Edges:", graph.number_of_edges())

        print("\nSample edges:")

        for edge in list(graph.edges())[:10]:
            print(edge)


def inspect_sample_plan(dataset):

    print("\n==============================")
    print("SAMPLE PLAN FULL STRUCTURE")
    print("==============================")

    plan = dataset[0]

    for key, value in plan.items():

        if isinstance(value, (Polygon, MultiPolygon)):
            geoms = get_geometries(value)
            print(f"{key:15} polygons:", len(geoms))

        else:
            print(f"{key:15} value:", value)


def main():

    print("\nLoading dataset...")
    

    with open(DATASET_PATH, "rb") as f:
        dataset = pickle.load(f)
        print(dataset[0])

    # inspect_dataset(dataset)

    # inspect_key_types(dataset)

    # inspect_sample_plan(dataset)

    # inspect_room_statistics(dataset)

    # inspect_coordinate_ranges(dataset)

    # inspect_area_relationship(dataset)

    # inspect_room_dimensions(dataset)

    # inspect_graph(dataset)


if __name__ == "__main__":
    main()