import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    token: null,               // access token (when backend adds it)
    user: null,                // store minimal user info from backend
    status: 'idle',            // 'idle' | 'loading' | 'authenticated' | 'error'
    error: null,               // last error message (if any)
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // Set token + user after successful login/register
        setCredentials: (state, action) => {
            const { token = null, user = null } = action.payload || {};
            state.token = token;
            state.user = user;
            state.status = user ? 'authenticated' : 'idle';
            state.error = null;
        },

        // Update only the token (used on refresh)
        tokenRefreshed: (state, action) => {
            const { token = null } = action.payload || {};
            state.token = token;
            // keep user as-is; status remains authenticated if user exists
        },

        // Set loading state when starting an auth request
        setAuthStatus: (state, action) => {
            const next = action.payload;
            if (next === 'idle' || next === 'loading' || next === 'authenticated' || next === 'error') {
                state.status = next;
            }
        },

        // Record an auth-related error
        setAuthError: (state, action) => {
            state.error = action.payload || null;
            state.status = 'error';
        },

        // Clear all auth state
        logout: (state) => {
            state.token = null;
            state.user = null;
            state.status = 'idle';
            state.error = null;
        },
    },
});

// Selectors (convenience for components)
export const selectIsAuthenticated = (state) => Boolean(state.auth && state.auth.user);
export const selectUser = (state) => (state.auth ? state.auth.user : null);
export const selectAccessToken = (state) => (state.auth ? state.auth.token : null);
export const selectAuthStatus = (state) => (state.auth ? state.auth.status : 'idle');
export const selectAuthError = (state) => (state.auth ? state.auth.error : null);

// Actions
export const { setCredentials, tokenRefreshed, setAuthStatus, setAuthError, logout } = authSlice.actions;

// Reducer
export default authSlice.reducer;