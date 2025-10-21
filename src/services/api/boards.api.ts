import { api } from './axios.config';
import { Board, BoardColumn } from '../../types';

export const boardsApi = {
  // Получить все доски компании
  getBoards: async (companyId: number): Promise<Board[]> => {
    const response = await api.get(`/boards?companyId=${companyId}`);
    return response.data;
  },

  // Получить доску по ID
  getBoard: async (boardId: number): Promise<Board> => {
    const response = await api.get(`/boards/${boardId}`);
    return response.data;
  },

  // Создать новую доску
  createBoard: async (board: Omit<Board, 'id' | 'createdAt' | 'updatedAt'>): Promise<Board> => {
    const response = await api.post('/boards', board);
    return response.data;
  },

  // Обновить доску
  updateBoard: async (boardId: number, board: Partial<Board>): Promise<Board> => {
    const response = await api.put(`/boards/${boardId}`, board);
    return response.data;
  },

  // Удалить доску
  deleteBoard: async (boardId: number): Promise<void> => {
    await api.delete(`/boards/${boardId}`);
  },

  // Получить колонки доски
  getBoardColumns: async (boardId: number): Promise<BoardColumn[]> => {
    const response = await api.get(`/boards/${boardId}/columns`);
    return response.data;
  },

  // Создать колонку доски
  createBoardColumn: async (boardId: number, column: Omit<BoardColumn, 'id' | 'boardId' | 'createdAt' | 'updatedAt'>): Promise<BoardColumn> => {
    const response = await api.post(`/boards/${boardId}/columns`, column);
    return response.data;
  },

  // Обновить колонку доски
  updateBoardColumn: async (columnId: number, column: Partial<BoardColumn>): Promise<BoardColumn> => {
    const response = await api.put(`/board-columns/${columnId}`, column);
    return response.data;
  },

  // Удалить колонку доски
  deleteBoardColumn: async (columnId: number): Promise<void> => {
    await api.delete(`/board-columns/${columnId}`);
  },

  // Переупорядочить колонки
  reorderColumns: async (boardId: number, columnIds: number[]): Promise<void> => {
    await api.put(`/boards/${boardId}/columns/reorder`, { columnIds });
  },
};