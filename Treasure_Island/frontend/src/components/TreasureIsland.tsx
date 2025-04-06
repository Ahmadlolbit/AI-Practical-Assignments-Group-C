import { useState } from 'react';
import axios, { AxiosError } from 'axios';

type CellValue = 'S' | 'X' | 0 | 1;
type Coordinate = [number, number];

interface ApiResponse {
    path: Coordinate[];
}

const TreasureIsland = () => {
    const initialIsland: CellValue[][] = [
        ['S', 1, 0, 1, 'X'],
        [1, 1, 0, 1, 1],
        [0, 1, 1, 1, 0],
        [1, 0, 1, 1, 1]
    ];

    const [island, setIsland] = useState<CellValue[][]>(initialIsland);
    const [gridRows, setGridRows] = useState(4);
    const [gridCols, setGridCols] = useState(5);
    const [path, setPath] = useState<Coordinate[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedCellType, setSelectedCellType] = useState<CellValue>(1);

    const handleGenerateGrid = () => {
        const rows = Math.max(1, Number(gridRows));
        const cols = Math.max(1, Number(gridCols));

        const newGrid: CellValue[][] = [];
        for (let i = 0; i < rows; i++) {
            const row: CellValue[] = [];
            for (let j = 0; j < cols; j++) {
                if (i === 0 && j === 0) row.push('S');
                else if (i === rows - 1 && j === cols - 1) row.push('X');
                else row.push(1);
            }
            newGrid.push(row);
        }

        setIsland(newGrid);
        setPath([]);
        setError('');
    };

    const handleCellClick = (rowIdx: number, colIdx: number) => {
        const newIsland = [...island.map(row => [...row])];

        if (selectedCellType === 'S' || selectedCellType === 'X') {
            for (let i = 0; i < newIsland.length; i++) {
                for (let j = 0; j < newIsland[i].length; j++) {
                    if (newIsland[i][j] === selectedCellType) {
                        newIsland[i][j] = 1;
                    }
                }
            }
        }

        newIsland[rowIdx][colIdx] = selectedCellType;
        setIsland(newIsland);
        setPath([]);
        setError('');
    };

    const getCellClass = (rowIdx: number, colIdx: number, value: CellValue): string => {
        const isPath = path.some(coord => coord[0] === rowIdx && coord[1] === colIdx);
        const base = "w-12 h-12 sm:w-16 sm:h-16 border border-gray-700 flex items-center justify-center text-sm sm:text-xl font-bold transition-all cursor-pointer hover:scale-105";

        if (isPath) return `${base} bg-yellow-600/70 text-yellow-100 shadow-lg shadow-yellow-800/50`;
        if (value === 'S') return `${base} bg-gradient-to-br from-green-600 to-emerald-700 text-green-50 shadow-lg shadow-green-800/50`;
        if (value === 'X') return `${base} bg-gradient-to-br from-red-600 to-rose-700 text-red-50 shadow-lg shadow-red-800/50`;
        if (value === 0) return `${base} bg-gradient-to-br from-blue-600 to-sky-700 text-blue-100 shadow-inner shadow-blue-900/30`;
        return `${base} bg-gradient-to-br from-gray-800 to-gray-900 text-gray-300 hover:bg-gray-700/50`;
    };

    const findPath = async () => {
        setIsLoading(true);
        setError('');
        try {
            const { data } = await axios.post<ApiResponse>('http://localhost:8000/find-path', { island });
            setPath(data.path);
        } catch (err) {
            const error = err as AxiosError<{ detail?: string }>;
            setError(error.response?.data?.detail || 'Failed to find path');
            setPath([]);
        }
        setIsLoading(false);
    };

    const resetGrid = () => {
        setIsland(initialIsland);
        setGridRows(4);
        setGridCols(5);
        setPath([]);
        setError('');
        setSelectedCellType(1);
    };

    return (
        <div className="min-h-screen bg-gray-900 p-4 sm:p-8 flex items-center justify-center">
            <div className="w-full max-w-2xl xl:max-w-4xl backdrop-blur-lg bg-gray-900/80 rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-800">
                <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 text-center">
                    Treasure Island Pathfinder
                </h1>

                <div className="flex flex-col sm:flex-row gap-4 mb-8 items-center justify-between">
                    <div className="flex gap-3">
                        <button
                            onClick={findPath}
                            disabled={isLoading}
                            className="bg-indigo-600 hover:bg-indigo-700 text-gray-100 px-5 py-3 rounded-xl disabled:bg-gray-700 transition-all hover:scale-105 shadow-lg shadow-indigo-900/30 flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            {isLoading ? 'Finding Path...' : 'Find Path'}
                        </button>

                        <button
                            onClick={resetGrid}
                            className="bg-gray-700 hover:bg-gray-600 text-gray-100 px-5 py-3 rounded-xl transition-all hover:scale-105 shadow-lg shadow-gray-900/30 flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Reset
                        </button>
                    </div>

                    <div className="flex gap-3 items-center">
                        <div className="flex gap-2 bg-gray-800 p-2 rounded-lg border border-gray-700">
                            <input
                                type="number"
                                min="1"
                                value={gridRows}
                                onChange={(e) => setGridRows(Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-16 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Rows"
                            />
                            <span className="text-gray-400 my-auto">×</span>
                            <input
                                type="number"
                                min="1"
                                value={gridCols}
                                onChange={(e) => setGridCols(Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-16 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Cols"
                            />
                        </div>
                        <button
                            onClick={handleGenerateGrid}
                            className="bg-emerald-600 hover:bg-emerald-700 text-gray-100 px-5 py-3 rounded-xl transition-all hover:scale-105 shadow-lg shadow-emerald-900/30 flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Generate
                        </button>
                    </div>
                </div>

                <div className="mb-8 flex gap-3 flex-wrap justify-center">
                    {(['S', 'X', 0, 1] as const).map((type) => (
                        <button
                            key={type}
                            onClick={() => setSelectedCellType(type)}
                            className={`px-5 py-2.5 rounded-xl border-2 transition-all font-semibold flex items-center gap-2
                                ${selectedCellType === type
                                ? `scale-110 shadow-lg ${
                                    type === 'S' ? 'border-green-500 bg-green-600/30 text-green-300 shadow-green-900/30' :
                                        type === 'X' ? 'border-red-500 bg-red-600/30 text-red-300 shadow-red-900/30' :
                                            type === 0 ? 'border-blue-500 bg-blue-600/30 text-blue-300 shadow-blue-900/30' :
                                                'border-purple-500 bg-purple-600/30 text-purple-300 shadow-purple-900/30'
                                }`
                                : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700/50 hover:text-gray-300'}`}
                        >
                            {type}
                            {type === 'S' && <span className="text-xs">(Start)</span>}
                            {type === 'X' && <span className="text-xs">(End)</span>}
                        </button>
                    ))}
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-900/30 border border-red-800 text-red-300 rounded-xl flex items-center gap-3">
                        <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span>{error}</span>
                    </div>
                )}

                <div className="bg-gray-900 p-4 rounded-xl shadow-2xl border border-gray-800 overflow-x-auto">
                    <div className="inline-block mx-auto">
                        {island.map((row, rowIdx) => (
                            <div key={rowIdx} className="flex">
                                {row.map((cell, colIdx) => (
                                    <div
                                        key={`${rowIdx}-${colIdx}`}
                                        className={getCellClass(rowIdx, colIdx, cell)}
                                        onClick={() => handleCellClick(rowIdx, colIdx)}
                                    >
                                        {cell}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {path.length > 0 && (
                    <div className="mt-8 p-5 bg-gray-900/50 rounded-xl shadow-lg border border-gray-800 backdrop-blur-sm">
                        <h2 className="text-xl font-semibold mb-4 text-gray-300">
                            Optimal Path Found <span className="text-yellow-400">({path.length} steps)</span>
                        </h2>
                        <div className="flex flex-wrap gap-3">
                            {path.map((coord, idx) => (
                                <span
                                    key={idx}
                                    className="bg-yellow-900/40 text-yellow-300 px-3 py-1.5 rounded-full text-sm flex items-center gap-2"
                                >
                                    <span className="text-yellow-500 text-xs">●</span>
                                    ({coord[0]}, {coord[1]})
                                    {idx < path.length - 1 && <span className="text-gray-500 ml-1">→</span>}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TreasureIsland;