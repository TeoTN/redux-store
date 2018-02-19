class Store {
    constructor(initialState = {}, reducers) {
        this.state = initialState;
        this.reducers = reducers;
        this.listeners = [];
    }

    dispatch(action) {
        let nextState = {};
        for (const scope in this.reducers) {
            const reducer = this.reducers[scope];
            nextState[scope] = reducer(this.state[scope], action);
        }
        this.state = nextState;
        this.notify(nextState);
    }

    notify(nextState) {
        this.listeners.forEach(listener => listener(nextState));
    }

    subscribe(listener) {
        const index = this.listeners.push(listener);
        return () => {
            this.listeners.splice(index - 1, 1);
        };
    }
}

module.exports = Store;
