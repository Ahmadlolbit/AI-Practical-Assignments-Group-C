from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware

M = 9

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SudokuGrid(BaseModel):
    grid: List[List[int]]

def solve(grid, row, col, num):
    for x in range(9):
        if grid[row][x] == num:
            return False
    for x in range(9):
        if grid[x][col] == num:
            return False
    startRow = row - row % 3
    startCol = col - col % 3
    for i in range(3):
        for j in range(3):
            if grid[i + startRow][j + startCol] == num:
                return False
    return True

def sudoko(grid, row, col):
    if (row == M - 1 and col == M):
        return True
    if col == M:
        row += 1
        col = 0
    if grid[row][col] > 0:
        return sudoko(grid, row, col + 1)
    for num in range(1, M + 1, 1):
        if solve(grid, row, col, num):
            grid[row][col] = num
            if sudoko(grid, row, col + 1):
                return True
        grid[row][col] = 0
    return False

@app.post("/solve-sudoku/")
async def solve_sudoku_endpoint(sudoku_grid: SudokuGrid):
    grid = sudoku_grid.grid
    if sudoko(grid, 0, 0):
        return {"solved": True, "grid": grid}
    else:
        return {"solved": False, "message": "The Sudoku puzzle is not solvable."}