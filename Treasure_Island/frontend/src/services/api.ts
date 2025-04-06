import axios from 'axios';

// Base URL of your backend API
const API_BASE_URL = 'http://localhost:8000';

// Define the type for the request payload
interface GAParams {
  board: number[][];
}

// Define the type for the response from the backend
interface CombinedGAResponse {
  solved: boolean;
  grid?: number[][];
  message?: string;
}

// Function to send the Sudoku board to the backend and receive the solved board
export const startGASolver = async (params: GAParams): Promise<number[][]> => {
  try {
    // Send a POST request to the backend with the Sudoku board
    const response = await axios.post<CombinedGAResponse>(`${API_BASE_URL}/start_ga`, params);

    // Check if the puzzle was solved successfully
    if (!response.data.solved) {
      throw new Error(response.data.message || 'Failed to solve the Sudoku.');
    }

    // Extract the solved board from the response
    const solvedBoard = response.data.grid;

    if (!solvedBoard) {
      throw new Error('Invalid response from the backend: missing solved board.');
    }

    // Return the solved board
    return solvedBoard;
  } catch (error) {
    // Handle errors gracefully
    console.error('Error calling startGASolver:', error);
    throw new Error('Failed to solve the Sudoku. Please check your input or backend.');
  }
};