# redux-undo-actions

## Overview
redux-undo-actions is a Redux middleware for undo/redo actions. It doesn't change the state as [redux-undo](https://github.com/omnidan/redux-undo). Instead of changing the state of application it dispatches an action that is the opposite of the one that is in the history.

## Installation
To start using redux-undo-actions, you need to run following command:

`npm install --save redux-undo-actions`

## Usage

To start using this middleware, you need to add it to your redux middlewares and pass config as a parameter:

```js
import {undoActionsMiddleware} from 'redux-undo-actions'


export const config = {
    revertibleActions: {
        [actionTypes.INCREMENT]: actions.decrement(),
        [actionTypes.DECREMENT]: actions.increment()
    }
};

const middlewares = [
    undoActionsMiddleware(config),
    // other middlewares that you want to use
];

const store = createStore(
    reducer,
    applyMiddleware(...middlewares)
);

```

Here `config` is an object that contains currently only one field `revertibleActions`. It's a mapping between original actions and reverting action. So, when undo is called, it takes action from the history, searches for reverting action in this `revertibleActions` and if it was found, then a new reverting action is dispatched. There can be situations when new action needs arguments that can be obtained from the state or the original actions. In this case, you need to use the more complex notation:

```js
export const config = {
    revertibleActions: {
        [actionTypes.CREATE]: ({
            actionCreator: ({ id }) => actions.remove(id),
            mapStateToArgs: (action) => ({ id: action.id })
        }),
        [actionTypes.REMOVE]: ({
            actionCreator: ({ id, text }) => actions.create(id, text),
            mapStateToArgs: (action, state) => ({
                id: action.id,
                text: state.list.filter(el => el.id === action.id)[0].text
            })
        })
    }
};
```

`mapStateToArgs` is a function that takes original action and previous state and returns an object of arguments for the new action.

When this is done, you need to add undoHistory to your top-level reducer:

```js
import undoHistory from 'redux-undo-actions';

export default combineReducers({
    application,
    undoHistory
});

## Undo/Redo Actions

```
Then you can use this actions when you want to call undo/redo:

```js
import {undoActions} from 'redux-undo-actions';

store.dispatch(undoActions.undo()) // undo the last action
store.dispatch(undoActions.redo()) // redo the last action

store.dispatch(undoActions.clearHistory()) // clear undo/redo history

```


## Contribution
This is the list of features to be done:
 - Store asynchronous actions in the history in the order they are dispatched including their children
 - When undo is called two times, wait for the first reverting action to be done and then dispatch second
 - ~~Add support for asynchronous actions~~ 

If you feel that you have some time to improve this package, feel free to fork this repo and make a pull request with your changes.

## License & Author
This package is distributed under the MIT License by [Taras Zelyk](mailto:taras.zelyk@gmail.com)