import {create} from "zustand";

/*
 * @summary This is a store that holds the states for a global feedback dialog.
 * It is used to show success or error messages to the user.
 *
 * @usage It is simple: just use the successMsg or errorMsg functions to show the dialog.
 * It will automatically set itself to open = true, and automatically close based on the autoHideDuration field.
 *
 * By default, the autoHideDuration is set to 2000ms (2 seconds), but you can customize it PER CALL by just passing as
 * argument the time in ms, in the errorMsg function.
 *
 * The feedback component automatically resets the states when the dialog is closed thanks to the close function this
 * store provides, so each call to the dialog is independent of previous calls/usages.
 * You can forget about resetting previous states manually.
*/

export interface FeedbackState {
    open: boolean;
    success: boolean;
    message?: string;
    autoHideDuration: number;

    successMsg: (msg: string, duration?: number) => void;
    errorMsg: (msg: string, duration?: number) => void;
    close: () => void;
}

export const useFeedbackStore = create<FeedbackState>((set) => ({
    open: false,
    success: false,
    message: undefined,
    autoHideDuration: 2000,

    // Called when success needs to be shown.
    // TODO: Currently, it have hardcoded one single string when is success. Make it dynamic in the future
    successMsg: (msg: string, duration = 2000) =>
        set({
            open: true,
            success: true,
            message: msg,
            autoHideDuration: duration
        }),

    // Called when error needs to be shown
    errorMsg: (msg: string, duration = 2000) =>
        set({
            open: true,
            success: false,
            message: msg,
            autoHideDuration: duration
        }),

    // Close and reset
    close: () =>
        set({
            open: false,
            success: false,
            message: undefined,
            autoHideDuration: 2000
        }),
}));