import { useFeedbackStore } from "../../hooks/feedback/feedbackStore.ts"
import ShowResults from "./ShowResults.tsx";

export function FeedbackUI() {
    const { open, success, message, autoHideDuration, close } = useFeedbackStore();

    return open ? (
        <ShowResults
            snackbarOpen={open}
            onClose={close}
            isSuccess={success}
            message={message}
            autoHideDuration={autoHideDuration}
        />
    ) : null;
}
