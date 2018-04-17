import * as types from './types';

const reducer = (state = [], action) => {
    switch (action.type) {
        case types.FETCH_SUCCESS:
            return action.items;
        case types.CREATE:
            return [
                ...state,
                {
                    id: action.id,
                    text: action.text
                }
            ];
        case types.REMOVE:
            return state.filter(el => el.id !== action.id);
        case types.CLEAR:
            return [];
        default:
            return state;
    }
};


export default reducer;