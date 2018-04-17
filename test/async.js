export const WAIT_DONE = 'WAIT_DONE';

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

export const waitDone = (ms) => {
    return {
        type: WAIT_DONE,
        ms
    };
};
export const wait = (ms) => dispatch => {
    return delay(ms).then(() => {
        dispatch(waitDone(ms));
    });
};