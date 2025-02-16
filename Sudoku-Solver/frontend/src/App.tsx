import {useState} from 'react';
import {SudokuContainer} from './components/SudokuContainer';
import {ThemeProvider} from './contexts/ThemeContext';
import { startGASolver } from "./services/api.ts";
import type {SudokuBoard as BoardType} from './types/sudoku';

function App() {
    const [board, setBoard] = useState<BoardType>([[0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0],]);

    const [originalBoard] = useState<BoardType>(board);
    const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
    const [selectedNumber, setSelectedNumber] = useState<number | null>(null);


    const handleCellClick = (row: number, col: number) => {
        if (originalBoard[row][col] !== 0) return;

        if (selectedCell?.row === row && selectedCell?.col === col) {
            setSelectedCell(null);
        } else {
            setSelectedCell({row, col});
            if (selectedNumber !== null) {
                handleNumberSelect(selectedNumber, row, col);
            }
        }
    };



    const handleNumberSelect = async (number: number, row?: number, col?: number) => {
        if (number == -1) {
            setBoard(originalBoard);
            setSelectedCell(null);
            setSelectedNumber(null);
            return;
        }
        if (number == -2) {
            try {
                // Call the backend API to solve the Sudoku
                const solvedBoard = await startGASolver({ board });

                // Update the board with the solved board
                setBoard(solvedBoard);
            } catch (error) {
                console.error('Error solving Sudoku:', error);
                alert('Failed to solve the Sudoku. Please check your input.');
            }
            setSelectedCell(null);
            setSelectedNumber(null);
            return;
        }
        if (row !== undefined && col !== undefined) {
            const newBoard = board.map((r, i) => i === row ? r.map((c, j) => (j === col ? number : c)) : r);
            setBoard(newBoard);
            setSelectedCell(null);
            setSelectedNumber(null);
        } else if (selectedCell) {
            const newBoard = board.map((r, i) => i === selectedCell.row ? r.map((c, j) => (j === selectedCell.col ? number : c)) : r);
            setBoard(newBoard);
            setSelectedCell(null);
            setSelectedNumber(null);
        } else {
            setSelectedNumber(number);
        }
    };


    return (<>

            <ThemeProvider>
                <div className = "flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 py-8 transition-colors">

                    <div className = "text-center">
                        <h1 className = "text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
                            Sudoku Solver
                        </h1>

                        <div className = "flex grid-cols-12 gap-4">
                            <div className = "col-span-6">
                                <SudokuContainer
                                    board = {board}
                                    originalBoard = {originalBoard}
                                    selectedCell = {selectedCell}
                                    selectedNumber = {selectedNumber}
                                    onCellClick = {handleCellClick}
                                    onNumberSelect = {handleNumberSelect}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </ThemeProvider>
        </>);
}

export default App;