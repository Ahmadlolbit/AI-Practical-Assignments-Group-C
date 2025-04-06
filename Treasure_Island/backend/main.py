from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Union

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class IslandRequest(BaseModel):
    island: List[List[Union[str, int]]]

def find_start_end(island):
    rows = len(island)
    if rows == 0:
        return None, None
    cols = len(island[0])
    start = None
    end = None
    for i in range(rows):
        for j in range(cols):
            if island[i][j] == 'S':
                start = (i, j)
            elif island[i][j] == 'X':
                end = (i, j)
    return start, end

def manhattan(i1, j1, i2, j2):
    return abs(i1 - i2) + abs(j1 - j2)

def treasure_island_greedy_bfs(island):
    start, end = find_start_end(island)
    if not start or not end:
        return []

    s_i, s_j = start
    x_i, x_j = end
    rows = len(island)
    cols = len(island[0]) if rows > 0 else 0

    directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]
    priority_queue = []
    initial_heuristic = manhattan(s_i, s_j, x_i, x_j)
    heapq.heappush(priority_queue, (initial_heuristic, s_i, s_j, [(s_i, s_j)]))

    visited = set()
    visited.add((s_i, s_j))

    while priority_queue:
        current_heuristic, current_i, current_j, current_path = heapq.heappop(priority_queue)

        if current_i == x_i and current_j == x_j:
            return current_path

        for di, dj in directions:
            new_i = current_i + di
            new_j = current_j + dj

            if 0 <= new_i < rows and 0 <= new_j < cols:
                if (new_i, new_j) not in visited and island[new_i][new_j] != 0:
                    new_path = current_path + [(new_i, new_j)]
                    new_heuristic = manhattan(new_i, new_j, x_i, x_j)
                    heapq.heappush(priority_queue, (new_heuristic, new_i, new_j, new_path))
                    visited.add((new_i, new_j))

    return []

@app.post("/find-path")
async def find_path(request: IslandRequest):
    try:
        path = treasure_island_greedy_bfs(request.island)
        return {"path": path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)