import {Box, FormControl, InputLabel, Select, Stack, Typography} from "@mui/material";
import {useAllPotholes} from "../hooks/potholes/useAllPotholes.ts";
import {DataGrid} from "@mui/x-data-grid";

export default function Home() {
    const potholesData = useAllPotholes();

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom>Reporte de baches activos</Typography>

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
                        field: 'locationId',
                        headerName: 'Ubicacion ID',
                        flex: 1,
                    },
                    {
                        field: 'categoryId',
                        headerName: 'Categoria ID',
                        flex: 1,
                    },
                    {
                        field: 'statusId',
                        headerName: 'Estatus ID',
                        flex: 1,
                    },
                    {
                        field: 'dateReported',
                        headerName: 'Reportado en',
                        flex: 1,
                        type: 'dateTime',
                        valueFormatter: (value) => new Date(value).toLocaleString(),
                    }
                ]}
            />

        </Box>
    );
}