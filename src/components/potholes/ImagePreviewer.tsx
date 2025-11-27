import {Box, Dialog} from "@mui/material";

interface ImagePreviewerProps {
    open: boolean;
    onClose: () => void;
    photoUrl: string;
}

export default function ImagePreviewer({ open, onClose, photoUrl }: ImagePreviewerProps) {
    return (
        <Dialog  open={open} onClose={onClose}>
            <Box component={'img'} src={photoUrl} sx={{ width: '100%', height: '90%' }} />
        </Dialog>
    );
}