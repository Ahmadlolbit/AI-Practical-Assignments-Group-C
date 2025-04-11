from fastapi import FastAPI
from pydantic import BaseModel
import math
import heapq

app = FastAPI()


class Node(BaseModel):
    x: int
    y: int


class Edge(BaseModel):
    node1: str
    node2: str


nodes_db = {}
edges_db = set()  # Changed to a set


class AStarNode:
    def __init__(self, node_id, parent=None):
        self.node_id = node_id
        self.parent = parent
        self.g = 0  # Actual cost
        self.h = 0  # Heuristic cost
        self.f = 0  # Total cost

    def __lt__(self, other):
        return self.f < other.f


def euclidean_distance(node1, node2):
    return math.sqrt((node1.x - node2.x) ** 2 + (node1.y - node2.y) ** 2)


def a_star(start_id, goal_id):
    open_list = []
    closed_set = set()

    start_node = AStarNode(start_id)
    goal_node = nodes_db[goal_id]
    start_node.h = euclidean_distance(nodes_db[start_id], goal_node)
    start_node.f = start_node.g + start_node.h
    heapq.heappush(open_list, start_node)

    while open_list:
        current = heapq.heappop(open_list)

        if current.node_id == goal_id:
            path = []
            while current:
                path.insert(0, {
                    'node_id': current.node_id,
                    'g': current.g,
                    'h': current.h
                })
                current = current.parent
            return path

        closed_set.add(current.node_id)

        for edge in [e for e in edges_db if e[0] == current.node_id]:
            neighbor_id = edge[1]
            if neighbor_id in closed_set:
                continue

            neighbor_node = AStarNode(neighbor_id, current)
            neighbor_node.g = current.g + euclidean_distance(
                nodes_db[current.node_id], nodes_db[neighbor_id]
            )
            neighbor_node.h = euclidean_distance(
                nodes_db[neighbor_id], goal_node
            )
            neighbor_node.f = neighbor_node.g + neighbor_node.h

            in_open = False
            for n in open_list:
                if n.node_id == neighbor_id and n.f <= neighbor_node.f:
                    in_open = True
                    break
            if not in_open:
                heapq.heappush(open_list, neighbor_node)

    return []


@app.post("/nodes/")
def add_node(node_id: str, node: Node):
    nodes_db[node_id] = node
    return {"status": f"Node {node_id} added"}


@app.post("/edges/")
def add_edge(edge: Edge):
    edges_db.add((edge.node1, edge.node2))
    return {"status": "Edge added"}


@app.get("/path/{start_id}/{goal_id}")
def calculate_path(start_id: str, goal_id: str):
    if start_id not in nodes_db or goal_id not in nodes_db:
        return {"error": "Invalid nodes"}

    path = a_star(start_id, goal_id)
    if not path:
        return {"error": "No path found"}

    return {
        "path": [step['node_id'] for step in path],
        "costs": [{
            "node": step['node_id'],
            "coordinates": (nodes_db[step['node_id']].x, nodes_db[step['node_id']].y),
            "g_cost": step['g'],
            "h_cost": step['h']
        } for step in path]
    }