import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../../api/axios'

const initialState = {
    messages: [],
}

// _id diye sort: Atlas-e hat diye insert kora message-eo (createdAt chhara) thik order-e ashe
const sortById = (list) =>
    [...list].sort((a, b) => String(a._id).localeCompare(String(b._id)))

// Ekta chat-er purono message backend theke ana
export const fetchMessages = createAsyncThunk('messages/fetchMessages', async ({ token, userId }) => {
    const { data } = await api.post('/api/message/get', { to_user_id: userId }, {
        headers: { Authorization: `Bearer ${token}` }
    })
    return data.success ? data : null
})

const messagesSlice = createSlice({
    name: 'messages',
    initialState,
    reducers: {
        setMessages: (state, action) => {
            state.messages = action.payload
        },
        addMessage: (state, action) => {
            // ekoi message object (ekoi _id) duibar dhukbe na
            const exists = state.messages.some((m) => m._id && m._id === action.payload._id)
            if (!exists) {
                state.messages = [...state.messages, action.payload]
            }
        },
        resetMessages: (state) => {
            state.messages = []
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchMessages.fulfilled, (state, action) => {
            if (action.payload) {
                state.messages = sortById(action.payload.messages)
            }
        })
    },
})

export const { setMessages, addMessage, resetMessages } = messagesSlice.actions

export default messagesSlice.reducer