import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

interface GAParams {
    board: number[][];
}

interface CombinedGAResponse {
    solved: boolean;
    grid?: number[][];
    message?: string;
}

export const startGASolver = async (params: GAParams): Promise<number[][]> => {
    try {
        const response = await axios.post<CombinedGAResponse>(`${API_BASE_URL}/start_ga`, params);

        if (!response.data.solved) {
            throw new Error(response.data.message || 'Failed to solve the Sudoku.');
        }

        const solvedBoard = response.data.grid;

        if (!solvedBoard) {
            throw new Error('Invalid response from the backend: missing solved board.');
        }

        return solvedBoard;
    } catch (error) {
        console.error('Error calling startGASolver:', error);
        throw new Error('Failed to solve the Sudoku. Please check your input or backend.');
    }
};