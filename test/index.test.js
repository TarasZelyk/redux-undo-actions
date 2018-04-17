
import assert from 'assert';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import listReducer from './list';
import * as listActions from './list/actions';
import * as listActionTypes from './list/types';
import { undoActionsMiddleware } from '../src';
import * as undoActions from '../src/actions';
import { addToHistory } from '../src/actions';
import * as asyncActions from './async';


const config = {
    revertibleActions: {
        [listActionTypes.CREATE]: ({
            actionCreator: ({ id }) => listActions.remove(id),
            mapStateToArgs: (action) => ({ id: action.id })
        }),
        [listActionTypes.REMOVE]: ({
            actionCreator: ({ id, text }) => listActions.create(id, text),
            mapStateToArgs: (action, state) => ({
                id: action.id,
                text: state.list.filter(el => el.id === action.id)[0].text
            })
        }),
        [listActionTypes.FETCH_SUCCESS]: listActions.clear(),
        [listActionTypes.CLEAR]: listActions.fetch(),
        [asyncActions.WAIT_DONE]: ({
            actionCreator: ({ ms }) => asyncActions.wait(ms),
            mapStateToArgs: (action) => ({ ms: action.ms })
        })
    }
};
const middlewares = [
    undoActionsMiddleware(config),
    thunk
];
const mockStore = configureMockStore(middlewares);

describe('Middleware tests', () => {
    it('Dispatches ADD_TO_HISTORY action', () => {
        const store = mockStore({ undoHistory: { past: [], future: [] }, list: [] });
        const action = listActions.create(1, 'some text');
        store.dispatch(undoActions.undoable(action));
        const actualActions = store.getActions();
        const expectedActions = [addToHistory(action, { list: [] }), action];
        assert.deepEqual(actualActions, expectedActions);
    });
    
    it('Dispatches ADD_TO_HISTORY for asynchronous action', () => {
        const store = mockStore({ undoHistory: { past: [], future: [] }, list: [] });
        const action = listActions.fetch();
        return store.dispatch(undoActions.undoable(action)).then(() => {
            const actualActions = store.getActions();
            const expectedActions = [addToHistory(action, { list: [] }), listActions.fetchSuccess()];
            assert.deepEqual(actualActions, expectedActions);
        });
    });

    it('Dispatches reverting action when UNDO is called', () => {
        const action = listActions.create(1, 'some text');
        const initialState = [];
        const state = listReducer(initialState, action);
        const store = mockStore({
            undoHistory: { past: [{ action, state: initialState }], future: [] },
            list: state
        });
        store.dispatch(undoActions.undo());
        const actualActions = store.getActions();
        const expectedActions = [undoActions.historyUndo(), listActions.remove(1)];
        assert.deepEqual(actualActions, expectedActions);
    });

    it('Dispatches reverting action that depends on past state when UNDO is called', () => {
        const action = listActions.remove(1);
        const initialState = [{ id: 1, text: 'some text' }];
        const state = listReducer(initialState, action);
        const store = mockStore({
            undoHistory: { past: [{ action, state: { list: initialState } }], future: [] },
            list: state
        });
        store.dispatch(undoActions.undo());
        const actualActions = store.getActions();
        const expectedActions = [undoActions.historyUndo(), listActions.create(1, 'some text')];
        assert.deepEqual(actualActions, expectedActions);
    });

    it('Dispatches next action when REDO is called', () => {
        const action = listActions.remove(1);
        const initialState = [{ id: 1, text: 'some text' }];
        const state = listReducer(initialState, action);
        const store = mockStore({
            undoHistory: { past: [], future: [{ action, state: { list: state } }] },
            list: initialState
        });
        store.dispatch(undoActions.redo());
        const actualActions = store.getActions();
        const expectedActions = [undoActions.historyRedo(), listActions.remove(1)];
        assert.deepEqual(actualActions, expectedActions);
    });

    it('Dispatches asynchronous reverting action when UNDO is called', () => {
        const action = listActions.clear();
        const initialState = [{ id: 1, text: 'some text' }];
        const state = listReducer(initialState, action);
        const store = mockStore({
            undoHistory: { past: [{ action, state: initialState }], future: [] },
            list: state
        });
        return store.dispatch(undoActions.undo()).then(() => {
            const actualActions = store.getActions();
            const expectedActions = [undoActions.historyUndo(), listActions.fetchSuccess()];
            assert.deepEqual(actualActions, expectedActions);
        });
    });

    // it('Dispatches asynchronous actions when UNDO is called in order', () => {
    //     const store = mockStore({
    //         undoHistory: {
    //             past: [
    //                 { action: asyncActions.waitDone(200), state: [] },
    //                 { action: asyncActions.waitDone(1000), state: [] }
    //             ], future: []
    //         }
    //     });

    //     return Promise.all([
    //         store.dispatch(undoActions.undo()),
    //         store.dispatch(undoActions.undo(2))
    //     ]).then(() => {
    //         const actualActions = store.getActions();
    //         const expectedActions = [
    //             undoActions.historyUndo(),
    //             asyncActions.waitDone(1000),
    //             undoActions.historyUndo(),
    //             asyncActions.waitDone(200)
    //         ];
    //         console.log(actualActions);
    //         assert.deepEqual(actualActions, expectedActions);
    //     });
    // });
});
