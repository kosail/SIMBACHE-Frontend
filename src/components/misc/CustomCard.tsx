import {Paper, SxProps} from "@mui/material";
import {ReactNode} from "react";

interface CustomCardProps {
    children: ReactNode;
    padding?: number;
    sx?: SxProps;
}

export default function CustomCard({ children, padding = 4, sx }: CustomCardProps) {
    return (
        <Paper elevation={3} sx={{ p: padding, borderRadius: 2, boxShadow: 0, ...sx }}>
            {children}
        </Paper>
    );
}