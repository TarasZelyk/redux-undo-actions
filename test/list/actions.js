import * as types from './types';

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

export const clear = () => {
    return {
        type: types.CLEAR
    };
};