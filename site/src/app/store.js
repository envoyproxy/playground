
import {combineReducers} from 'redux';
import {createSlice, configureStore} from '@reduxjs/toolkit';


const repoSlice = createSlice({
    name: 'repo',
    initialState: {
        value: {}
    },
    reducers: {
        updateRepo: (state, action) => {
            state.value = {...state.value, ...action.payload};
        },
    }
});

export const {updateRepo} = repoSlice.actions;



const serviceSlice = createSlice({
    name: 'service',
    initialState: {
        value: {}
    },
    reducers: {
        updateServices: (state, action) => {
            state.value = {...state.value, ...action.payload};
        },
    }
});

export const {updateServices} = serviceSlice.actions;


const rootReducer = combineReducers({
    repo: repoSlice.reducer,
    service: serviceSlice.reducer,
});


const store = configureStore({
    reducer: rootReducer,
});


export default store;
