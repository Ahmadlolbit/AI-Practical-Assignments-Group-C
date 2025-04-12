from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

class Node(BaseModel):
    id: int
    x: float
    y: float
    letter: str
    cost: int

class Connection(BaseModel):
    fromNode: int
    to: int

class GraphPayload(BaseModel):
    nodes: list[Node]
    connections: list[Connection]

def save_to_history(data: GraphPayload):
    history_file = "History.txt"
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    with open(history_file, "a") as f:
        f.write(f"\n\n=== Entry at {timestamp} ===\n")

        # Write nodes
        f.write("Nodes:\n")
        for node in data.nodes:
            f.write(f"  Node {node.id}:\n")
            f.write(f"    Position: ({node.x}, {node.y})\n")
            f.write(f"    Letter: {node.letter}\n")
            f.write(f"    Cost: {node.cost}\n")

        # Write connections
        f.write("\nConnections:\n")
        for conn in data.connections:
            f.write(f"  From node {conn.fromNode} to node {conn.to}\n")

        f.write("="*40)

@app.post("/save-graph")
async def save_graph(data: GraphPayload):
    try:
        # Print to console
        print("\n=== Nodes ===")
        for node in data.nodes:
            print(f"Node {node.id}:")
            print(f"  Position: ({node.x}, {node.y})")
            print(f"  Letter: {node.letter}")
            print(f"  Cost: {node.cost}\n")

        print("\n=== Connections ===")
        for conn in data.connections:
            print(f"From node {conn.fromNode} to node {conn.to}")

        # Save to history file
        save_to_history(data)

        return {"message": "Graph data processed and saved successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    # Create empty history file if it doesn't exist
    if not os.path.exists("History.txt"):
        open("History.txt", "w").close()
