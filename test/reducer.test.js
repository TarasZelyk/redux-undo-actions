
import assert from 'assert';
import reducer from '../src';
import * as actions from '../src/actions';

describe('Reducer tests', () => {
    const item = (n) => ({
        action: {
            type: `TEST_ACTION${n}` 
        },
        state: {
            someKey: `someValue${n}`
        }
    });

    it('Adds item to empty history', () => {
        const state = {
            past: [],
            future: []
        };
        const action = actions.addToHistory(item(1).action, item(1).state);
        const actual = reducer(state, action);
        const expected = {
            past: [item(1)],
            future: []
        };
        assert.deepEqual(actual, expected);
    });
    it('Adds item to non-empty history', () => {
        const state = {
            past: [item(1)],
            future: []
        };
        const action = actions.addToHistory(item(2).action, item(2).state);
        const actual = reducer(state, action);
        const expected = {
            past: [item(1), item(2)],
            future: []
        };
        assert.deepEqual(actual, expected);
    });

    it('Clears future list when new item is added', () => {
        const state = {
            past: [item(1)],
            future: [item(2)]
        };
        const action = actions.addToHistory(item(3).action, item(3).state);
        const actual = reducer(state, action);
        const expected = {
            past: [item(1), item(3)],
            future: []
        };
        assert.deepEqual(actual, expected);
    });
 

    it('Undoes last action', () => {
        const state = {
            past: [item(1), item(2)],
            future: []
        };
        const action = actions.historyUndo(1);
        const actual = reducer(state, action);
        const expected = {
            past: [item(1)],
            future: [item(2)]
        };
        assert.deepEqual(actual, expected);
    });

      
    it('Redoes last action', () => {
        const state = {
            past: [item(1)],
            future: [item(2), item(3)]
        };
        const action = actions.historyRedo();
        const actual = reducer(state, action);
        const expected = {
            past: [item(1), item(2)],
            future: [item(3)]
        };
        assert.deepEqual(actual, expected);
    });

    it('Undoes action with given index', () => {
        const state = {
            past: [
                item(1), item(2), item(3), item(4)
            ],
            future: [item(5), item(6)]
        };
        const action = actions.historyUndo(3);
        const actual = reducer(state, action);
        const expected = {
            past: [item(1)],
            future: [
                item(2), item(3), item(4), item(5), item(6)
            ]
        };
        assert.deepEqual(actual, expected);
    });

    it('Redoes action with given index', () => {
        const state = {
            past: [
                item(1), item(2), item(3), item(4)
            ],
            future: [
                item(5), item(6), item(7)
            ]
        };
        const action = actions.historyRedo(2);
        const actual = reducer(state, action);
        const expected = {
            past: [
                item(1), item(2), item(3), item(4), item(5), item(6)
            ],
            future: [item(7)]
        };
        assert.deepEqual(actual, expected);
    });
});
