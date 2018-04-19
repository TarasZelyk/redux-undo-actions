export const WAIT_DONE = 'WAIT_DONE';
export const WAIT_DONE_PROMISE = 'WAIT_DONE_PROMISE';
export const COMPLEX_ASYNC_DONE = 'COMPLEX_ASYNC_DONE';

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

export const waitDonePromise = (ms) => {
    return {
        type: WAIT_DONE_PROMISE,
        ms
    };
};
export const waitWithPromise = (ms) => dispatch => {
    return delay(ms).then(() => {
        dispatch(waitDonePromise(ms + 1));
        dispatch(waitDonePromise(ms + 2));
        dispatch(waitDonePromise(ms + 3));
    });
};

export const waitDone = (ms) => {
    return {
        type: WAIT_DONE,
        ms
    };
};
export const wait = (ms) => dispatch => {
    dispatch(waitDone(ms + 1));
    dispatch(waitDone(ms + 2));
    dispatch(waitDone(ms + 3));
};
export const complexAsyncDone = (ms) => {
    return {
        type: COMPLEX_ASYNC_DONE,
        ms
    };
};

export const complexAsync = (ms = 100) => async dispatch => {
    await delay(ms);
    await dispatch(waitWithPromise(ms + 30));
    await dispatch(waitWithPromise(ms + 20));
    await dispatch(waitWithPromise(ms + 10));
};
