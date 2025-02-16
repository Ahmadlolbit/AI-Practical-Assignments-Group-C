import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware

M = 9

app = FastAPI(title="Sudoku Solver (backtracking)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class StartGARequest(BaseModel):
    board: List[List[int]]

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
    if row == M - 1 and col == M:
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

@app.post("/start_ga")
def start_ga(request: StartGARequest):
    board = request.board
    if not validate_board(np.array(board)):
        raise HTTPException(status_code=400, detail="Invalid Sudoku board: contains duplicates in fixed cells")
    if sudoko(board, 0, 0):
        return {"solved": True, "grid": board}
    else:
        return {"solved": False, "message": "The Sudoku puzzle is not solvable."}

def validate_board(board: np.ndarray) -> bool:
    for i in range(9):
        row = board[i, :]
        if not is_unique(row[row != 0]):
            return False
        column = board[:, i]
        if not is_unique(column[column != 0]):
            return False
    for bi in range(3):
        for bj in range(3):
            block = board[bi * 3:(bi + 1) * 3, bj * 3:(bj + 1) * 3].flatten()
            if not is_unique(block[block != 0]):
                return False
    return True

def is_unique(arr):
    return len(arr) == len(set(arr))