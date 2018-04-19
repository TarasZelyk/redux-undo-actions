import undoHistory, { getPastHistoryItem, getFutureHistoryItem, canUndo, canRedo } from './reducers';
import * as types from './types';
import * as undoActions from './actions';
import * as _ from 'lodash';
const dispatchSkipActions = (dispatch) => (action) => {
    if (typeof action === 'function') {
        return action(dispatchSkipActions(dispatch));
    } else {
        return dispatch({ ...action, undoSkipAction: true });
    }
};
export const undoActionsMiddleware = config => {
    return ({ dispatch, getState }) => next => async action => {
        const { undoHistory, ...restState } = getState();
        if (action.undoSkipAction) {
            return next(_.omit(action, 'undoSkipAction'));
        }
        if (action.type in config.revertibleActions) {
            dispatch(undoActions.addToHistory(action, restState));
            return dispatchSkipActions(dispatch)(action);
        } else if (action.type === types.UNDO && canUndo(undoHistory)) {
            const { action: pastAction, state: pastState } = getPastHistoryItem(undoHistory, action.index);
            let revertingAction = config.revertibleActions[pastAction.type];
            dispatch(undoActions.historyUndo(action.index));
            if (revertingAction.actionCreator && revertingAction.mapStateToArgs) {
                const { actionCreator, mapStateToArgs } = revertingAction;
                const args = mapStateToArgs(pastAction, pastState);
                revertingAction = actionCreator(args);
            }
            return dispatchSkipActions(dispatch)(revertingAction);
        } else if (action.type === types.REDO && canRedo(undoHistory)) {
            const { action: futureAction } = getFutureHistoryItem(undoHistory, action.index);
            dispatch(undoActions.historyRedo(action.index));
            return dispatchSkipActions(dispatch)(futureAction);

        }
        return next(action);
    };
};
export { undoActions };

export default undoHistory;