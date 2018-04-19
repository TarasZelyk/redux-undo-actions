
import assert from 'assert';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import listReducer from './list';
import * as listActions from './list/actions';
import * as listActionTypes from './list/types';
import { undoActionsMiddleware } from '../src';
import * as undoActions from '../src/actions';

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
        [asyncActions.WAIT_DONE]: ({
            actionCreator: ({ ms }) => asyncActions.wait(ms),
            mapStateToArgs: (action) => ({ ms: action.ms })
        }),
        [asyncActions.WAIT_DONE_PROMISE]: ({
            actionCreator: ({ ms }) => asyncActions.waitWithPromise(ms),
            mapStateToArgs: (action) => ({ ms: action.ms })
        }),
        [asyncActions.COMPLEX_ASYNC_DONE]: ({
            actionCreator: ({ ms }) => asyncActions.complexAsync(ms),
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
        store.dispatch(action);
        const actualActions = store.getActions();
        const expectedActions = [undoActions.addToHistory(action, { list: [] }), action];
        assert.deepEqual(actualActions, expectedActions);
    });

    it('Dispatches ADD_TO_HISTORY for asynchronous action', () => {
        const store = mockStore({ undoHistory: { past: [], future: [] }, list: [] });
        const action = asyncActions.wait(100);
        store.dispatch(action);
        const actualActions = store.getActions();
        const expectedActions = [
            undoActions.addToHistory(asyncActions.waitDone(101), { list: [] }), 
            asyncActions.waitDone(101),
            undoActions.addToHistory(asyncActions.waitDone(102), { list: [] }), 
            asyncActions.waitDone(102),
            undoActions.addToHistory(asyncActions.waitDone(103), { list: [] }), 
            asyncActions.waitDone(103)

        ];
        assert.deepEqual(actualActions, expectedActions);
    });

    it('Dispatches ADD_TO_HISTORY for asynchronous action that returns Promise', () => {
        const store = mockStore({ undoHistory: { past: [], future: [] }, list: [] });
        const action = asyncActions.waitWithPromise(100);
        return store.dispatch(action).then(() => {
            const actualActions = store.getActions();
            const expectedActions = [
                undoActions.addToHistory(asyncActions.waitDonePromise(101), { list: [] }), 
                asyncActions.waitDonePromise(101),
                undoActions. addToHistory(asyncActions.waitDonePromise(102), { list: [] }), 
                asyncActions.waitDonePromise(102),
                undoActions.addToHistory(asyncActions.waitDonePromise(103), { list: [] }), 
                asyncActions.waitDonePromise(103)
            ];
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
        const action = asyncActions.waitDone(100);
        const store = mockStore({
            undoHistory: { past: [{ action, state: [] }], future: [] }
        });
        store.dispatch(undoActions.undo());
        const actualActions = store.getActions();
        const expectedActions = [
            undoActions.historyUndo(),
            asyncActions.waitDone(101),
            asyncActions.waitDone(102),
            asyncActions.waitDone(103)
        ];
        assert.deepEqual(actualActions, expectedActions);
    });

    it('Dispatches asynchronous reverting action that returns a Promise when UNDO is called', () => {
        const action = asyncActions.waitDonePromise(100);
        const store = mockStore({
            undoHistory: { past: [{ action, state: [] }], future: [] }
        });
        return store.dispatch(undoActions.undo()).then(() => {
            const actualActions = store.getActions();
            const expectedActions = [
                undoActions.historyUndo(),
                asyncActions.waitDonePromise(101),
                asyncActions.waitDonePromise(102),
                asyncActions.waitDonePromise(103)
            ];
            assert.deepEqual(actualActions, expectedActions);
        });
    });

    it('Dispatches ADD_TO_HISTORY after UNDO', () => {
        const action = asyncActions.waitDonePromise(100);
        const store = mockStore({
            undoHistory: { past: [{ action, state: [] }], future: [] }
        });
        return store.dispatch(undoActions.undo()).then(() => {
            store.dispatch(asyncActions.wait(100));
            const actualActions = store.getActions();
            const expectedActions = [
                undoActions.historyUndo(),
                asyncActions.waitDonePromise(101),
                asyncActions.waitDonePromise(102),
                asyncActions.waitDonePromise(103),
                undoActions.addToHistory(asyncActions.waitDone(101), []),
                asyncActions.waitDone(101),
                undoActions.addToHistory(asyncActions.waitDone(102), []),
                asyncActions.waitDone(102),
                undoActions.addToHistory(asyncActions.waitDone(103), []),
                asyncActions.waitDone(103)
            ];
            assert.deepEqual(actualActions, expectedActions);
        });
    });
    it('Dispatches complex async action when UNDO is called', () => {
        const action = asyncActions.complexAsyncDone(100);
        const store = mockStore({
            undoHistory: { past: [{ action, state: [] }], future: [] }
        });
        return store.dispatch(undoActions.undo()).then(() => {
            const actualActions = store.getActions();
            const expectedActions = [
                undoActions.historyUndo(),
                asyncActions.waitDonePromise(131),
                asyncActions.waitDonePromise(132),
                asyncActions.waitDonePromise(133),
                asyncActions.waitDonePromise(121),
                asyncActions.waitDonePromise(122),
                asyncActions.waitDonePromise(123),
                asyncActions.waitDonePromise(111),
                asyncActions.waitDonePromise(112),
                asyncActions.waitDonePromise(113)
            ];
            assert.deepEqual(actualActions, expectedActions);
        });
    });
    // it('Dispatches asynchronous actions when UNDO is called in order', () => {
    //     const store = mockStore({
    //         undoHistory: {
    //             past: [
    //                 { action: asyncActions.waitDonePromise(200), state: [] },
    //                 { action: asyncActions.waitDonePromise(1000), state: [] }
    //             ], future: []
    //         }
    //     });

    //     return Promise.all([
    //         store.dispatch(undoActions.undo()),
    //         store.dispatch(undoActions.undo(2))
    //     ]).then(() => {
    //         const actualActions = store.getActions();
    //         const expectedActions = [
    //             undoActions.historyUndo(1),
    //             asyncActions.waitDonePromise(1001),
    //             asyncActions.waitDonePromise(1002),
    //             asyncActions.waitDonePromise(1003),
    //             undoActions.historyUndo(2),
    //             asyncActions.waitDonePromise(201),
    //             asyncActions.waitDonePromise(202),
    //             asyncActions.waitDonePromise(203)
    //         ];
    //         assert.deepEqual(actualActions, expectedActions);
    //     });
    // });
});
