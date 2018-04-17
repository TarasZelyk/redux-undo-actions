import * as types from './types';

const defaultState = {
    past: [],
    future: []
};

const undoHistory = (state = defaultState, action) => {
    const { past, future } = state;
    switch (action.type) {
        case types.HISTORY_UNDO:
            return canUndo(state)
                ? {
                    past: past.slice(0, past.length - action.index),
                    future: [
                        ...past.slice(past.length - action.index, past.length),
                        ...future
                    ]
                }
                : state;
        case types.HISTORY_REDO:
            return canRedo(state)
                ? {
                    past: [
                        ...past,
                        ...future.slice(0, action.index)
                    ],
                    future: future.slice(action.index, future.length)
                }
                : state;

        case types.HISTORY_ADD:
            return {
                past: [
                    ...past,
                    {
                        action: action.action,
                        state: action.state
                    }
                ],
                future: []
            };
        case types.HISTORY_CLEAR:
            return {
                past: [],
                future: []
            };
        default:
            return state;
    }
};
export const getPastHistoryItem = (state, index = 1) => state.past[state.past.length - index];
export const getFutureHistoryItem = (state, index = 1) => state.future[index - 1];
export const canUndo = (state) => state.past.length > 0;
export const canRedo = (state) => state.future.length > 0;

export default undoHistory;
