from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional, Tuple
import math
import heapq

app = FastAPI()

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define data models
class Node(BaseModel):
    x: float
    y: float
    label: str
    type: str
    visitWeight: float = 0

class Connection(BaseModel):
    from_: int
    to: int
    weight: float

    class Config:
        fields = {
            'from_': 'from'
        }

class PathStep(BaseModel):
    from_: int
    to: int

    class Config:
        fields = {
            'from_': 'from'
        }

class PathRequest(BaseModel):
    nodes: List[Node]
    connections: List[Connection]
    startNodeIndex: int
    goalNodeIndex: int

class PathResponse(BaseModel):
    path: List[PathStep]
    stepLabels: List[str]
    algorithmSteps: List[str]
    totalCost: float

# Priority Queue for A* algorithm
class PriorityQueue:
    def __init__(self):
        self.elements = []
        self.count = 0

    def empty(self):
        return len(self.elements) == 0

    def put(self, item, priority):
        heapq.heappush(self.elements, (priority, self.count, item))
        self.count += 1

    def get(self):
        return heapq.heappop(self.elements)[2]

# Helper functions
def euclidean_distance(node1: Node, node2: Node) -> float:
    """Calculate Euclidean distance between two nodes"""
    dx = node2.x - node1.x
    dy = node2.y - node1.y
    return math.sqrt(dx * dx + dy * dy)

def get_neighbors(node_index: int, nodes: List[Node], connections: List[Connection]) -> List[Tuple[int, float]]:
    """Get all neighboring nodes and their connection weights"""
    neighbors = []

    for conn in connections:
        if conn.from_ == node_index:
            neighbors.append((conn.to, conn.weight))
        elif conn.to == node_index:
            neighbors.append((conn.from_, conn.weight))

    return neighbors

@app.post("/api/find-path", response_model=PathResponse)
async def find_path(request: PathRequest) -> PathResponse:
    # Validate request
    if request.startNodeIndex < 0 or request.startNodeIndex >= len(request.nodes):
        raise HTTPException(status_code=400, detail="Invalid start node index")

    if request.goalNodeIndex < 0 or request.goalNodeIndex >= len(request.nodes):
        raise HTTPException(status_code=400, detail="Invalid goal node index")

    # Run A* algorithm
    came_from, cost_so_far, algorithm_steps = a_star_search(
        request.nodes,
        request.connections,
        request.startNodeIndex,
        request.goalNodeIndex
    )

    # Check if path was found
    if request.goalNodeIndex not in came_from:
        return PathResponse(
            path=[],
            stepLabels=[],
            algorithmSteps=algorithm_steps + ["No path found!"],
            totalCost=0
        )

    # Reconstruct path
    path, step_labels = reconstruct_path(
        came_from,
        request.startNodeIndex,
        request.goalNodeIndex,
        request.nodes
    )

    return PathResponse(
        path=path,
        stepLabels=step_labels,
        algorithmSteps=algorithm_steps,
        totalCost=cost_so_far[request.goalNodeIndex]
    )

def a_star_search(nodes: List[Node], connections: List[Connection], start: int, goal: int) -> Tuple[Dict[int, int], Dict[int, float], List[str]]:
    """A* search algorithm implementation"""
    frontier = PriorityQueue()
    frontier.put(start, 0)

    came_from = {}
    cost_so_far = {}
    came_from[start] = None
    cost_so_far[start] = 0

    algorithm_steps = [f"Starting A* search from {nodes[start].label} to {nodes[goal].label}"]

    while not frontier.empty():
        current = frontier.get()

        # Check if we reached the goal
        if current == goal:
            algorithm_steps.append(f"Goal reached! Node {nodes[current].label}")
            break

        algorithm_steps.append(f"Examining node {nodes[current].label} (f={round(cost_so_far[current] + euclidean_distance(nodes[current], nodes[goal]), 2)})")

        # Process neighbors of current node
        neighbors = get_neighbors(current, nodes, connections)

        for next_node, edge_weight in neighbors:
            # Calculate new cost
            # Include the visit weight of the next node
            new_cost = cost_so_far[current] + edge_weight + nodes[next_node].visitWeight

            if next_node not in cost_so_far or new_cost < cost_so_far[next_node]:
                cost_so_far[next_node] = new_cost
                # Calculate f = g + h where g is cost_so_far and h is the Euclidean distance heuristic
                priority = new_cost + euclidean_distance(nodes[next_node], nodes[goal])
                frontier.put(next_node, priority)
                came_from[next_node] = current

                heuristic = euclidean_distance(nodes[next_node], nodes[goal])
                algorithm_steps.append(
                    f"Updated node {nodes[next_node].label}: "
                    f"g={round(new_cost, 2)}, "
                    f"h={round(heuristic, 2)}, "
                    f"f={round(new_cost + heuristic, 2)}"
                    + (f" (includes visit weight: {nodes[next_node].visitWeight})" if nodes[next_node].visitWeight > 0 else "")
                )

    return came_from, cost_so_far, algorithm_steps

def reconstruct_path(came_from: Dict[int, int], start: int, goal: int, nodes: List[Node]) -> Tuple[List[PathStep], List[str]]:
    """Reconstruct the path from the came_from dictionary"""
    current = goal
    path = []
    step_labels = [nodes[goal].label]

    while current != start:
        if current not in came_from:
            break

        parent = came_from[current]
        path.append(PathStep(from_=parent, to=current))
        step_labels.insert(0, nodes[parent].label)
        current = parent

    # Reverse to get the path from start to goal
    path.reverse()

    return path, step_labels

@app.get("/")
async def root():
    return {"message": "A* Pathfinder API is running"}