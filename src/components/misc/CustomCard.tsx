import {Paper, SxProps} from "@mui/material";
import {ReactNode} from "react";

interface CustomCardProps {
    children: ReactNode;
    sx?: SxProps;
}

export default function CustomCard({ children, sx }: CustomCardProps) {
    return (
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2, boxShadow: 0, ...sx }}>
            {children}
        </Paper>
    );
}