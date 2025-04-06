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
    const [path, setPath] = useState<Coordinate[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const getCellClass = (rowIdx: number, colIdx: number, value: CellValue): string => {
        const isPath = path.some(coord => coord[0] === rowIdx && coord[1] === colIdx);

        const base = "w-12 h-12 sm:w-16 sm:h-16 border flex items-center justify-center text-sm sm:text-xl font-bold transition-colors";

        if (isPath) return `${base} bg-yellow-400`;
        if (value === 'S') return `${base} bg-green-500`;
        if (value === 'X') return `${base} bg-red-500`;
        if (value === 0) return `${base} bg-blue-300`;
        return `${base} bg-white`;
    };

    const findPath = async () => {
        setIsLoading(true);
        setError('');
        try {
            const { data } = await axios.post<ApiResponse>('http://localhost:8000/find-path', {
                island
            });
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
        setPath([]);
        setError('');
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">
                    🏴‍☠️ Treasure Island Pathfinder
                </h1>

                <div className="flex gap-4 mb-6">
                    <button
                        onClick={findPath}
                        disabled={isLoading}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                    >
                        {isLoading ? '🔍 Finding Path...' : '🚀 Find Path'}
                    </button>

                    <button
                        onClick={resetGrid}
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        🔄 Reset Grid
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                        ⚠️ Error: {error}
                    </div>
                )}

                <div className="bg-white p-4 rounded-lg shadow-lg overflow-x-auto">
                    <div className="inline-block min-w-full">
                        {island.map((row, rowIdx) => (
                            <div key={rowIdx} className="flex">
                                {row.map((cell, colIdx) => (
                                    <div
                                        key={`${rowIdx}-${colIdx}`}
                                        className={getCellClass(rowIdx, colIdx, cell)}
                                    >
                                        {cell}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {path.length > 0 && (
                    <div className="mt-6 p-4 bg-white rounded-lg shadow-lg">
                        <h2 className="text-lg sm:text-xl font-semibold mb-3">
                            🗺️ Path Found ({path.length} steps):
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {path.map((coord, idx) => (
                                <span
                                    key={idx}
                                    className="bg-yellow-100 px-2 py-1 rounded-full text-xs sm:text-sm"
                                >
                  ({coord[0]}, {coord[1]}){idx < path.length - 1 && ' →'}
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