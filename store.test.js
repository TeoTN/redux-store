const Store = require('./store');
const deepfreeze = require('deepfreeze');


describe('Store', function() {
    const initialState = {
        auth: { token: 'sessiontoken', lastSignedIn: '09/09/2018'},
    };

    it('should create a store', function() {
        const store = new Store;
        expect(store).toBeTruthy();
        expect(store.state).toEqual({});
    });

    it('should create a store with some initial state', function() {
        const store = new Store(initialState);
        expect(store.state).toEqual(initialState);
    });

    it('should create a store with initial state and reducers', function() {
        const reducers = {
            auth: function(state, action) {
                return state;
            },
        };

        const store = new Store(initialState, reducers);

        expect(store.state).toEqual(initialState);
        expect(store.reducers).toEqual(reducers);
    });

    it('should dispatch an action to a reducer', function() {
        const reducers = {
            auth: jest.fn(),
        };
        const action = {
            type: 'AUTH::DUMMY',
        }

        const store = new Store(initialState, reducers);
        store.dispatch(action);

        expect(reducers.auth).toHaveBeenCalledWith(initialState.auth, action);
    });

    it('should dispatch an action to all reducers', function() {
        const reducers = {
            auth: jest.fn(),
            users: jest.fn(),
        };
        const action = {
            type: 'AUTH::DUMMY',
        }

        const store = new Store(initialState, reducers);
        store.dispatch(action);

        expect(reducers.auth).toHaveBeenCalledWith(initialState.auth, action);
        expect(reducers.users).toHaveBeenCalledWith(undefined, action);
    });

    it('should dispatch an action to reducers and update state', function() {
        const reducers = {
            auth: jest.fn(function(state, action) {
                if (action.type === 'AUTH::SIGN_OUT') {
                    delete state.token;
                }
                return state;
            }),
            users: jest.fn(),
        };
        const action = {
            type: 'AUTH::SIGN_OUT',
        }
        const stateAfter = {
            auth: { lastSignedIn: '09/09/2018' },
            users: undefined,
        };

        const store = new Store(initialState, reducers);
        store.dispatch(action);

        expect(reducers.auth).toHaveBeenCalledWith(initialState.auth, action);
        expect(reducers.users).toHaveBeenCalledWith(undefined, action);
        expect(store.state).toEqual(stateAfter);
    });

    it('should dispatch an action to reducers and update state immutably', function() {
        const reducers = {
            auth: jest.fn(function(state, action) {
                if (action.type === 'AUTH::SIGN_OUT') {
                    return {
                        ...state,
                        token: undefined,
                    }
                }
                return state;
            }),
            users: jest.fn(),
        };
        const action = {
            type: 'AUTH::SIGN_OUT',
        }
        const stateAfter = {
            auth: { token: undefined, lastSignedIn: '09/09/2018' },
            users: undefined,
        };

        const store = new Store(initialState, reducers);
        deepfreeze(initialState);
        deepfreeze(action);
        store.dispatch(action);

        expect(reducers.auth).toHaveBeenCalledWith(initialState.auth, action);
        expect(reducers.users).toHaveBeenCalledWith(undefined, action);
        expect(store.state).toEqual(stateAfter);
    });

    it('should notify subscribers on state update', function() {
        const reducers = {
            auth: jest.fn(function(state, action) {
                if (action.type === 'AUTH::SIGN_OUT') {
                    return {
                        ...state,
                        token: undefined,
                    }
                }
                return state;
            }),
            users: jest.fn(),
        };
        const action = {
            type: 'AUTH::SIGN_OUT',
        }
        const stateAfter = {
            auth: { token: undefined, lastSignedIn: '09/09/2018' },
            users: undefined,
        };

        const listener = jest.fn();
        const store = new Store(initialState, reducers);
        const unsubscribe = store.subscribe(listener);
        store.dispatch(action);
        expect(listener).toHaveBeenCalledWith(stateAfter);
        expect(listener).toHaveBeenCalledTimes(1);

        unsubscribe();
        store.dispatch(action);
        expect(listener).toHaveBeenCalledTimes(1);
    });
});
