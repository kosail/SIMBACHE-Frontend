import {
    Box,
    Checkbox,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    FormGroup,
    FormControlLabel,
    Stack,
    SxProps,
    Typography,
    FormControl,
    InputLabel,
    Grid,
    Select, Button, Divider, MenuItem
} from "@mui/material";
import {CloseRounded} from '@mui/icons-material';
import useAuth from "../../hooks/auth/useAuth.ts";
import {useEffect, useState} from "react";
import VisuallyHiddenInput from "../misc/VisuallyHiddenInput.tsx";
import {CloudUpload} from "@mui/icons-material";
import {useGeoStates} from "../../hooks/geography/states/useGeoStates.ts";
import {useMunicipalities} from "../../hooks/geography/municipalities/useMunicipalities.ts";
import {useLocalities} from "../../hooks/geography/localities/useLocalities.ts";
import {useColonias} from "../../hooks/geography/colonias/useColonias.ts";
import {useStreetsPerLocality} from "../../hooks/geography/streets/useStreets.ts";
import {useStreetsPerColonia} from "../../hooks/geography/streets/useStreets.ts";
import {Street} from "../../types/geography/Street.ts";

interface NewPotholeDialogProps {
    open: boolean;
    onClose: () => void;
    newReportId: number;
    sx?: SxProps;
}

export default function NewPotholeDialog({ open, onClose, newReportId, sx }: NewPotholeDialogProps) {
    const {loginData: user} = useAuth();
    const today: string = new Date().toLocaleString();

    const [reportedByCitizen, setReportedByCitizen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [confirmation, setConfirmation] = useState(false);

    const [selectedState, setSelectedState] = useState<number | null>(null);
    const [selectedMunicipality, setSelectedMunicipality] = useState<number | null>(null);
    const [selectedLocality, setSelectedLocality] = useState<number | null>(null);
    const [selectedColonia, setSelectedColonia] = useState<number | null>(null);
    const [selectedStreet, setSelectedStreet] = useState<number | null>(null);
    const [selectedStreet1, setSelectedStreet1] = useState<number | null>(null);
    const [selectedStreet2, setSelectedStreet2] = useState<number | null>(null);

    const states = useGeoStates();
    const municipalities = useMunicipalities(selectedState ?? 0);
    const localities = useLocalities(selectedMunicipality ?? 0);
    const colonias = useColonias(selectedLocality ?? 0);

    // Conditional street loading
    const streetsPerLocality = useStreetsPerLocality(
        selectedColonia ? 0 : (selectedLocality ?? 0) // Only fetch if no colonia selected
    );
    const streetsPerColonia = useStreetsPerColonia(selectedColonia ?? 0);

    // Determine which streets to use
    const streets: Street[] | undefined = selectedColonia ? streetsPerColonia.data : streetsPerLocality.data;

    const readyToSend: boolean =
        Boolean(selectedState && selectedMunicipality && selectedLocality && selectedStreet) && confirmation;

    // Reset dependent fields when parent selection changes
    useEffect(() => {
        setSelectedMunicipality(null);
        setSelectedLocality(null);
        setSelectedColonia(null);
        setSelectedStreet(null);
        setSelectedStreet1(null);
        setSelectedStreet2(null);
    }, [selectedState]);

    useEffect(() => {
        setSelectedLocality(null);
        setSelectedColonia(null);
        setSelectedStreet(null);
        setSelectedStreet1(null);
        setSelectedStreet2(null);
    }, [selectedMunicipality]);

    useEffect(() => {
        setSelectedColonia(null);
        setSelectedStreet(null);
        setSelectedStreet1(null);
        setSelectedStreet2(null);
    }, [selectedLocality]);

    useEffect(() => {
        setSelectedStreet(null);
        setSelectedStreet1(null);
        setSelectedStreet2(null);
    }, [selectedColonia]);

    useEffect(() => {
        if (!states.isLoading) setSelectedState(states.data?.[0]?.stateId ?? null);
    }, [states.isLoading]);

    return (
        <Dialog
            open={open}
            onClose={() => {
                setSelectedFile(null);
                onClose();
            }}
            slotProps={{
                paper: {
                    sx: { width: 800, maxWidth: 800 }
                }
            }}
        >
            <DialogTitle>
                <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                    <Typography variant={'h5'}>Nuevo reporte de bache</Typography>
                    <IconButton onClick={onClose}><CloseRounded /></IconButton>
                </Stack>
            </DialogTitle>

            <DialogContent sx={{ ...sx }}>
                <Typography variant={'body1'}><b>Número de folio:</b> {newReportId}</Typography>
                <Stack direction={'row'} justifyContent={'space-between'} sx={{ pb: 2 }}>
                    <Typography
                        variant={'body1'}
                    >
                        <b>Registra:</b> {`${user?.firstName} ${user?.lastName}`}
                    </Typography>

                    <Typography
                        variant={'body1'}
                    >
                        <b>Fecha:</b> {today}
                    </Typography>
                </Stack>

                <FormGroup>
                    <FormControlLabel
                        control={<Checkbox />}
                        label="Es reporte de un ciudadano"
                        checked={reportedByCitizen}
                        onChange={() => setReportedByCitizen(!reportedByCitizen)}
                    />
                </FormGroup>

                {/*TODO: add citizen form */}
                {/*{ reportedByCitizen && }*/}

                <Grid container spacing={2} sx={{ mt: 2 }}>
                    {/* FIRST GROUP */}
                    <Grid size={12}>
                        <Typography variant={'h6'}>Datos básicos</Typography>
                    </Grid>

                    <Grid size={6}>
                        <FormControl fullWidth>
                            <InputLabel>Estado</InputLabel>
                            <Select
                                label={'Estado'}
                                value={selectedState ?? ''}
                                onChange={(e) => setSelectedState(Number(e.target.value))}
                                required
                            >
                                {states?.data?.map((state) => (
                                    <MenuItem key={state.stateId} value={state.stateId}>
                                        {state.stateName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid size={6}>
                        <FormControl fullWidth>
                            <InputLabel>Municipio</InputLabel>
                            <Select
                                label={'Municipio'}
                                required
                                value={selectedMunicipality ?? ''}
                                onChange={(e) => setSelectedMunicipality(Number(e.target.value))}
                                disabled={!selectedState}
                            >
                                {municipalities?.data?.map((municipality) => (
                                    <MenuItem key={municipality.municipalityId} value={municipality.municipalityId}>
                                        {municipality.municipalityName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid size={6}>
                        <FormControl fullWidth>
                            <InputLabel>Localidad (ciudad o poblado)</InputLabel>
                            <Select
                                label={'Localidad (ciudad o poblado)'}
                                required
                                value={selectedLocality ?? ''}
                                onChange={(e) => setSelectedLocality(Number(e.target.value))}
                                disabled={!selectedMunicipality}
                            >
                                { localities?.data?.map((locality) => (
                                    <MenuItem key={locality.localityId} value={locality.localityId}>
                                        {locality.localityName}
                                    </MenuItem>
                                )) }
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid size={6}>
                        <FormControl fullWidth>
                            <InputLabel>Colonia</InputLabel>
                            <Select
                                label={'Colonia'}
                                value={selectedColonia ?? ''}
                                onChange={(e) => setSelectedColonia(Number(e.target.value))}
                                disabled={!selectedLocality}
                            >
                                <MenuItem value="">Ninguna</MenuItem>
                                { colonias?.data?.map((col) => (
                                    <MenuItem key={col.coloniaId} value={col.coloniaId}>
                                        {col.coloniaName}
                                    </MenuItem>
                                )) }
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* SECOND GROUP */}
                    <Grid size={12}>
                        <Typography variant={'h6'}>Calles</Typography>
                    </Grid>

                    <Grid size={12}>
                        <FormControl fullWidth>
                            <InputLabel>Calle afectada</InputLabel>
                            <Select
                                label={'Calle afectada'}
                                required
                                value={selectedStreet ?? ''}
                                onChange={(e) => setSelectedStreet(Number(e.target.value))}
                                disabled={!selectedLocality}
                            >
                                {streets?.map((street: Street) => (
                                    <MenuItem key={street.streetId} value={street.streetId}>
                                        {street.streetName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid size={6}>
                        <FormControl fullWidth>
                            <InputLabel>Entre calle 1</InputLabel>
                            <Select
                                label={'Entre calle 1'}
                                value={selectedStreet1 ?? ''}
                                onChange={(e) => setSelectedStreet1(Number(e.target.value))}
                                disabled={!selectedLocality}
                            >
                                {streets?.map((street: Street) => (
                                    <MenuItem key={street.streetId} value={street.streetId}>
                                        {street.streetName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid size={6}>
                        <FormControl fullWidth>
                            <InputLabel>Entre calle 2</InputLabel>
                            <Select
                                label={'Entre calle 2'}
                                value={selectedStreet2 ?? ''}
                                onChange={(e) => setSelectedStreet2(Number(e.target.value))}
                                disabled={!selectedLocality}
                            >
                                {streets?.map((street: Street) => (
                                    <MenuItem key={street.streetId} value={street.streetId}>
                                        {street.streetName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* THIRD GROUP */}
                    <Grid size={12}>
                        <Typography variant={'h6'}>Fotografía del bache</Typography>
                    </Grid>

                    <Grid size={ selectedFile ? 6 : 12 } sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <Button
                            component="label"
                            variant="contained"
                            tabIndex={-1}
                            startIcon={<CloudUpload />}
                            color={'secondary'}
                            fullWidth
                        >
                            Subir fotografía
                            <VisuallyHiddenInput
                                type="file"
                                accept="image/*"
                                onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                            />
                        </Button>

                        { selectedFile && (
                            <Typography variant={"subtitle1"} textAlign={'center'} sx={{ pt: 2 }}>
                                Nombre del archivo:<br /> {selectedFile.name}
                            </Typography>
                        )}
                    </Grid>

                    { selectedFile && (
                        <Grid size={6}>
                            <Box component={'img'} src={URL.createObjectURL(selectedFile)} width={'100%'} />
                        </Grid>
                    )}
                </Grid>

                <Divider sx={{ mt: 4 }} />
                <FormGroup>
                    <FormControlLabel
                        control={<Checkbox />}
                        label="Declaro que la información proporcionada es veraz y completa."
                        checked={confirmation}
                        onChange={() => setConfirmation(!confirmation)}
                    />
                </FormGroup>

                <Button
                    variant={'contained'}
                    sx={{ mt: 2 }}
                    disabled={!readyToSend}
                    fullWidth
                >
                    <Typography variant={'h6'}>
                        Reportar nuevo bache
                    </Typography>
                </Button>
            </DialogContent>
        </Dialog>
    );
}