import React, {useState} from 'react';
import {SudokuContainer} from './components/SudokuContainer';
import {GAControls} from './components/GAControls';
import {SolutionProgress} from './components/SolutionProgress';
import {BestSolution} from './components/BestSolution';
import {ThemeToggle} from './components/ThemeToggle';
import {HistoryList} from './components/HistoryList';
import {ThemeProvider} from './contexts/ThemeContext';

import type {GAResponse, SudokuBoard as BoardType} from './types/sudoku';
import {notification} from "antd";

type NotificationType = 'success' | 'info' | 'warning' | 'error';

function App() {
    const [board, setBoard] = useState<BoardType>([[0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0],]);

    const [originalBoard, setOriginalBoard] = useState<BoardType>(board);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
    const [selectedNumber, setSelectedNumber] = useState<number | null>(null);

    const [settings, setSettings] = useState({
        populationSize: 1000, generations: 1000, mutationRate: 0.1, maxNoImprovement: 100,
    });

    const handleCellClick = (row: number, col: number) => {
    };

    const handleNumberSelect = (number: number, row?: number, col?: number) => {
    };

    const [api, contextHolder] = notification.useNotification();

    const openNotificationWithIcon = ({type, message, title}: { type: NotificationType, message: any, title: any }) => {
    };

    const handleStart = async () => {
    };

    const handleSettingsChange = (setting: string, value: number) => {
        setSettings((prev) => ({...prev, [setting]: value}));
    };

    return (<>
        {contextHolder}
        <ThemeProvider>
            <div className = "min-h-screen bg-gray-100 dark:bg-gray-900 py-8 transition-colors">
                <ThemeToggle/>
                <div className = "mx-auto px-4">
                    <h1 className = "text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
                        Sudoku Solver
                    </h1>

                    <div className = "grid grid-cols-12 gap-4">
                        <div className = "grid grid-cols-1 col-span-6 space-y-4">
                            <div
                                className = "col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors">
                                <GAControls
                                    onStart = {handleStart}
                                    isLoading = {isLoading}
                                    populationSize = {settings.populationSize}
                                    generations = {settings.generations}
                                    mutationRate = {settings.mutationRate}
                                    maxNoImprovement = {settings.maxNoImprovement}
                                    onSettingsChange = {handleSettingsChange}
                                />
                            </div>
                            <div className = {"col-span-1"}>
                                <SolutionProgress history = {graphData}/>
                            </div>
                        </div>

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

                        <div className = "col-span-12 grid grid-cols-8 gap-4">
                            <div className = "col-span-4">
                                <HistoryList history = {history}/>
                            </div>
                            <div className = "col-span-4">
                                <BestSolution history = {history}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ThemeProvider>
    </>);
}

export default App;