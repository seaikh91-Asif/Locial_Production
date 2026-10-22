import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    connections: [], 
    pendingConnections: [], 
    followers: [], 
    following: []
};

const connectionSlice = createSlice({
    name: 'connection', 
    initialState, // <-- 'initialSlate' পরিবর্তন করে 'initialState' করা হয়েছে
    reducers: {}
});

export default connectionSlice.reducer;