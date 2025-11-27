import {Box, Button, Stack, Typography} from "@mui/material";
import {usePotholes} from "../hooks/potholes/usePotholes.ts";
import {DataGrid} from "@mui/x-data-grid";
import {useNavigate} from "react-router-dom";
import {useState} from "react";
import PotholeDialog from "../components/potholes/PotholeDialog.tsx";

export default function Home() {
    const navigate = useNavigate();
    const potholesData = usePotholes();

    const [createDialog, setCreateDialog] = useState(false);

    return (
        <Box sx={{ p: 4 }}>
            <Stack direction={'row'} spacing={2} alignItems={'center'} justifyContent={'space-between'} sx={{ pb: 4 }}>
                <Typography
                    variant="h4"
                    gutterBottom
                >
                    Reporte de baches activos
                </Typography>

                <Button variant={'contained'} onClick={() => setCreateDialog(true)}>
                    <Typography variant={'body1'}>Reportar nuevo bache</Typography>
                </Button>
            </Stack>

            <DataGrid
                loading={potholesData.isLoading}
                rows={potholesData.data}
                getRowId={(row) => row.potholeId}
                columns={[
                    {
                        field: 'potholeId',
                        headerName: 'ID',
                        width: 50,
                    },
                    {
                        field: 'postalCode',
                        headerName: 'Código postal',
                        width: 130,
                        valueGetter: (_, row) => row?.location.postalCode
                    },
                    {
                        field: 'state',
                        headerName: 'Estado',
                        flex: 1,
                        valueGetter: (_, row) => row?.location.state.stateName
                    },
                    {
                        field: 'municipality',
                        headerName: 'Municipalidad',
                        flex: 1,
                        valueGetter: (_, row) => row?.location.municipality.municipalityName
                    },
                    {
                        field: 'locality',
                        headerName: 'Localidad',
                        flex: 1,
                        valueGetter: (_, row) => row?.location.locality.localityName
                    },
                    {
                        field: 'size',
                        headerName: 'Tamaño',
                        width: 200,
                        valueFormatter: (_, row) => row.category.categoryName
                    },
                    {
                        field: 'dateReported',
                        headerName: 'Reportado en',
                        width: 200,
                        type: 'dateTime',
                        valueFormatter: (value) => new Date(value).toLocaleString(),
                    },
                    {
                        field: 'status',
                        headerName: 'Estatus',
                        width: 170
                    },
                ]}
                onRowClick={(params) => navigate(`/secure/potholes/${params.row.potholeId}`)}
            />

            <PotholeDialog
                mode="create"
                open={createDialog}
                onClose={() => setCreateDialog(false)}
                newReportId={(potholesData?.data?.at(-1)?.potholeId ?? 0) + 1}
            />

        </Box>
    );
}