
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    selectedSerialNumber: {
        title: "All SerialNumber",
        value: "all"
    }
};

export const serialNumber = createSlice({
    name: "serialNumber",
    initialState,
    reducers: {
        setSelectedSerialNumber: (state, action) => {
            state.selectedSerialNumber = action.payload;
        },

        removeAll: (state) => {
            Object.assign(state, initialState);
        },
    },
});

// Action creators are generated for each case reducer function
export const { setSelectedSerialNumber, removeAll } = serialNumber.actions;

export default serialNumber.reducer;
