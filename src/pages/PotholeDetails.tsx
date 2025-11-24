import {Box, Button, Grid, Typography} from "@mui/material";
import {useParams} from "react-router-dom";
import CustomCard from "../components/misc/CustomCard.tsx";
import {useSinglePothole} from "../hooks/potholes/usePotholes.ts";
import Loading from "../components/Loading.tsx";
import {useNavigate} from "react-router-dom";

export default function PotholeDetails() {
    const {id} = useParams();
    if (!id) return null;

    const navigate = useNavigate();
    const pothole = useSinglePothole(parseInt(id));

    return (
        <Box sx={{ p: 4 }}>
            <Box sx={{ width: '100%', pb: 4 }}>
                <Button variant={'text'} onClick={() => navigate(-1)}>
                    <Typography variant={'h6'} sx={{ color: 'primary.main' }}>Regresar</Typography>
                </Button>
            </Box>
            <Typography
                variant="h4"
                gutterBottom
                sx={{ mb: 2 }}
            >
                Bache #{id}
            </Typography>

            { pothole.isLoading ? <Loading /> :
                <CustomCard>
                    <Typography
                        variant="h5"
                        gutterBottom
                        sx={{ mb: 2 }}
                    >
                        Informacion del reporte
                    </Typography>

                    <Grid container spacing={2}>
                        {pothole?.data?.dateReported}
                    </Grid>
                </CustomCard>
            }

        </Box>
    );
}