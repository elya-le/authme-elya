import { csrfFetch } from './csrf';

const API_BASE_URL = process.env.NODE_ENV === 'production' ? 'https://meetpup-elya.onrender.com/api' : 'http://localhost:5173/api';

const SET_USER = "session/setUser";
const REMOVE_USER = "session/removeUser";

const setUser = (user) => {
    return {
        type: SET_USER,
        payload: user
    };
};

const removeUser = () => {
    return {
        type: REMOVE_USER
    };
}; 

export const login = (user) => async (dispatch) => {
    const { credential, password } = user;
    const response = await csrfFetch(`${API_BASE_URL}/session`, {
        method: "POST",
        body: JSON.stringify({
            credential,
            password
        })
    });
    const data = await response.json();
    dispatch(setUser(data.user));
    return response;
};

const initialState = { user: null };

export const restoreUser = () => async (dispatch) => {
    const response = await csrfFetch(`${API_BASE_URL}/session`);
    const data = await response.json();
    dispatch(setUser(data.user));
    return response;
};

export const signup = (user) => async (dispatch) => {
    const { username, firstName, lastName, email, password } = user;
    const response = await csrfFetch(`${API_BASE_URL}/users`, {
        method: "POST",
        body: JSON.stringify({
            username,
            firstName,
            lastName,
            email,
            password
        })
    });
    const data = await response.json();
    dispatch(setUser(data.user)); // set the session user with the response
    return response;
};

export const logout = () => async (dispatch) => {
    const response = await csrfFetch(`${API_BASE_URL}/session`, {
        method: 'DELETE'
    });
    dispatch(removeUser());
    return response;
};

const sessionReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_USER:
            return { ...state, user: action.payload };
        case REMOVE_USER:
            return { ...state, user: null };
        default:
            return state;
    }
};

export default sessionReducer;
