import undoHistory, { getPastHistoryItem, getFutureHistoryItem, canUndo, canRedo } from './reducers';
import * as types from './types';
import { addToHistory, historyUndo, historyRedo } from './actions';

export const undoActionsMiddleware = config => ({ dispatch, getState }) => next => action => {
    const { undoHistory, ...restState } = getState();
    if (action.type === types.UNDOABLE && action.body) {
        dispatch(addToHistory(action.body, restState));
        return next(action.body);
    } else if (action.type === types.UNDO && canUndo(undoHistory)) {
        const { action: pastAction, state: pastState } = getPastHistoryItem(undoHistory, action.index);
        dispatch(historyUndo(action.index));
        const revertingAction = config.revertibleActions[pastAction.type];
        if (typeof revertingAction === 'function') {
            return next(revertingAction);
        } else {
            const { actionCreator, mapStateToArgs } = revertingAction;
            const args = mapStateToArgs(pastAction, pastState);
            return next(actionCreator(args));
        }
    } else if (action.type === types.REDO && canRedo(undoHistory)) {
        const { action: futureAction } = getFutureHistoryItem(undoHistory, action.index);
        dispatch(historyRedo(action.index));
        return next(futureAction);
    }
    return next(action);

};

export default undoHistory;