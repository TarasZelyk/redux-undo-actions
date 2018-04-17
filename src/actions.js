import * as types from './types';

export const undo = (index = 1) => ({ type: types.UNDO, index });
export const redo = (index = 1) => ({ type: types.REDO, index });

export const historyUndo = (index = 1) => ({ type: types.HISTORY_UNDO, index });
export const historyRedo = (index = 1) => ({ type: types.HISTORY_REDO, index });

export const addToHistory = (action, state) => ({ type: types.HISTORY_ADD, action, state });
export const clearHistory = () => ({ type: types.HISTORY_CLEAR });

export const undoable = (action) => ({ type: types.UNDOABLE, body: action });
