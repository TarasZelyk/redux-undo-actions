import * as types from './types';

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

export const create = (id, text) => {
    return {
        type: types.CREATE,
        id,
        text
    };
};

export const remove = (id) => {
    return {
        type: types.REMOVE,
        id
    };
};

export const fetchSuccess = () => {
    return {
        type: types.FETCH_SUCCESS,
        items: [
            { id: 1, text: 'item1' },
            { id: 2, text: 'item2' }
        ]
    };
};

export const fetch = () => dispatch => {
    return delay(100).then(() => {
        dispatch(fetchSuccess());
    });
};

export const clear = () => {
    return {
        type: types.CLEAR
    };
};