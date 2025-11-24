import {Box, Button, Stack, Typography} from "@mui/material";
import {usePotholes} from "../hooks/potholes/usePotholes.ts";
import {DataGrid} from "@mui/x-data-grid";
import {useNavigate} from "react-router-dom";
import {useState} from "react";
import NewPotholeDialog from "../components/potholes/NewPotholeDialog.tsx";
import {PotholeResponseDto} from "../types/PotholeResponseDto.ts";

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

            {/*<Typography variant={'h6'} sx={{ mb: 2 }}>Filtrar por:</Typography>*/}
            {/*<Stack direction={'row'} spacing={2} alignItems={'center'} justifyContent={'space-between'}>*/}
            {/*    <FormControl>*/}
            {/*        <InputLabel>Estado</InputLabel>*/}
            {/*        <Select variant={'outlined'} label={'Estado'} displayEmpty></Select>*/}
            {/*    </FormControl>*/}

            {/*    <FormControl>*/}
            {/*        <InputLabel>Estado</InputLabel>*/}
            {/*        <Select variant={'outlined'} label={'Municipio'}displayEmpty></Select>*/}
            {/*    </FormControl>*/}

            {/*    <FormControl>*/}
            {/*        <InputLabel>Estado</InputLabel>*/}
            {/*        <Select variant={'outlined'} label={'Localidad'}displayEmpty></Select>*/}
            {/*    </FormControl>*/}

            {/*    <FormControl>*/}
            {/*        <InputLabel>Estado</InputLabel>*/}
            {/*        <Select variant={'outlined'} label={'Colonia'}displayEmpty></Select>*/}
            {/*    </FormControl>*/}

            {/*    <FormControl>*/}
            {/*        <InputLabel>Estado</InputLabel>*/}
            {/*        <Select variant={'outlined'} label={'Calle'}displayEmpty></Select>*/}
            {/*    </FormControl>*/}
            {/*</Stack>*/}

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
                        valueGetter: (_, row) => row?.location.stateName
                    },
                    {
                        field: 'municipality',
                        headerName: 'Municipalidad',
                        flex: 1,
                        valueGetter: (_, row) => row?.location.municipalityName
                    },
                    {
                        field: 'locality',
                        headerName: 'Localidad',
                        flex: 1,
                        valueGetter: (_, row) => row?.location.localityName
                    },
                    {
                        field: 'dateReported',
                        headerName: 'Reportado en',
                        width: 200,
                        type: 'dateTime',
                        valueFormatter: (value) => new Date(value).toLocaleString(),
                    },
                    {
                        field: 'dateValidated',
                        headerName: 'Validado en',
                        width: 200,
                        type: 'dateTime',
                        valueFormatter: (value) => value === null ? "SIN VALIDAR" : new Date(value).toLocaleString()
                    },
                    {
                        field: 'status',
                        headerName: 'Estatus',
                        width: 170
                    },
                ]}
                onRowClick={(params) => navigate(`/secure/potholes/${params.row.potholeId}`)}
            />

            <NewPotholeDialog
                open={createDialog}
                onClose={() => setCreateDialog(false)}
                newReportId={ potholesData?.data?.at(-1)?.potholeId + 1 ?? 0 }
            />

        </Box>
    );
}