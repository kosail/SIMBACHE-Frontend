import {
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    FormControlLabel,
    FormGroup,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    SxProps,
    TextField,
    Typography,
} from '@mui/material';
import {CloseRounded, CloudUpload} from '@mui/icons-material';
import useAuth from '../../hooks/auth/useAuth.ts';
import {ChangeEvent, useEffect, useState} from 'react';
import VisuallyHiddenInput from '../misc/VisuallyHiddenInput.tsx';
import {useGeoStates} from '../../hooks/geography/states/useGeoStates.ts';
import {useMunicipalities} from '../../hooks/geography/municipalities/useMunicipalities.ts';
import {useLocalities} from '../../hooks/geography/localities/useLocalities.ts';
import {useStreetsPerLocality} from '../../hooks/geography/streets/useStreets.ts';
import {Street} from '../../types/geography/Street.ts';
import {useLocationsByZipCode, useZipCodeByLocation,} from '../../hooks/geography/zipCodes/useZipCodeLookup.ts';
import {api} from "../../utils/api.ts";
import {PotholeCreateDto} from "../../types/pothole/PotholeCreateDto.ts";
import {Location} from "../../types/geography/Location.ts";
import {AxiosError} from "axios";
import {useFeedbackStore} from "../../hooks/feedback/feedbackStore.ts";
import {PotholeStatus} from "../../types/pothole/PotholeStatus.ts";
import {usePotholeCategories} from "../../hooks/potholes/usePotholeCategories.ts";
import {PotholeCategory} from "../../types/pothole/PotholeCategory.ts";
import {FileUploadResponse} from "../../types/FileUploadResponse.ts";
import { useCitizenLookup } from '../../hooks/citizens/useCitizenLookup';
import { CitizenCreateDto } from '../../types/citizen/CitizenCreateDto';

type PostalCodeSource = 'manual' | 'location';

interface NewPotholeDialogProps {
    open: boolean;
    onClose: () => void;
    newReportId: number;
    sx?: SxProps;
}

export default function NewPotholeDialog({open, onClose, newReportId, sx}: NewPotholeDialogProps) {
    const {loginData: user} = useAuth();
    const feedback = useFeedbackStore();
    const today: string = new Date().toLocaleString();

    // Citizen section
    const [reporterCitizen, setReporterCitizen] = useState<boolean>(false);
    const [citizenName, setCitizenName] = useState<string | null>('');
    const [citizenSecondName, setCitizenSecondName] = useState<string | null>('');
    const [citizenLastName , setCitizenLastName] = useState<string | null>('');
    const [citizenSecondLastName , setCitizenSecondLastName] = useState<string | null>('');
    const [citizenPhone, setCitizenPhone] = useState<bigint | null>('');
    const [citizenEmail, setCitizenEmail] = useState<string | null>('');

    const [existingCitizenId, setExistingCitizenId] = useState<number | null>(null);
    const [citizenLookupPhone, setCitizenLookupPhone] = useState<number | undefined>(undefined);
    const [isAutoFilled, setIsAutoFilled] = useState<boolean>(false);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [confirmation, setConfirmation] = useState<boolean>(false);

    const [selectedState, setSelectedState] = useState<number | null>(null);
    const [selectedMunicipality, setSelectedMunicipality] = useState<number | null>(null);
    const [selectedLocality, setSelectedLocality] = useState<number | null>(null);
    const [selectedStreet, setSelectedStreet] = useState<number | null>(null);
    const [selectedStreet1, setSelectedStreet1] = useState<number | null>(null);
    const [selectedStreet2, setSelectedStreet2] = useState<number | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

    const [postalCode, setPostalCode] = useState('');
    const [postalCodeSource, setPostalCodeSource] = useState<PostalCodeSource>('manual');

    const states = useGeoStates();
    const municipalities = useMunicipalities(selectedState ?? 0);
    const localities = useLocalities(selectedMunicipality ?? 0);
    const streetsPerLocality = useStreetsPerLocality(selectedLocality ?? 0);
    const potholeCategories = usePotholeCategories();

    const citizenLookup = useCitizenLookup({
        phoneNumber: citizenLookupPhone,
        enabled: reporterCitizen && citizenLookupPhone !== undefined && citizenLookupPhone > 999999, // At least 7 digits
    });

    const readyToSend: boolean =
        Boolean(selectedState && selectedMunicipality && selectedLocality && selectedStreet && selectedCategory) && confirmation;

    const resetStreetFields = () => {
        setSelectedStreet(null);
        setSelectedStreet1(null);
        setSelectedStreet2(null);
    };

    const handleStateChange = (value: number | null) => {
        setSelectedState(value);
        setSelectedMunicipality(null);
        setSelectedLocality(null);
        resetStreetFields();
        setPostalCode('');
        setPostalCodeSource('manual');
    };

    const handleMunicipalityChange = (value: number | null) => {
        setSelectedMunicipality(value);
        setSelectedLocality(null);
        resetStreetFields();
        setPostalCode('');
        setPostalCodeSource('manual');
    };

    const handleLocalityChange = (value: number | null) => {
        setSelectedLocality(value);
        resetStreetFields();
        setPostalCode('');
        setPostalCodeSource('manual');
    };

    const handlePostalCodeChange = (event: ChangeEvent<HTMLInputElement>) => {
        const digitsOnly = event.target.value.replace(/\D/g, '').slice(0, 5);
        setPostalCode(digitsOnly);
        setPostalCodeSource('manual');
    };

    useEffect(() => {
        if (!states.isLoading && selectedState === null) {
            setSelectedState(states.data?.[0]?.stateId ?? null);
        }
    }, [states.isLoading, states.data, selectedState]);

    const {data: reverseLookupData} = useZipCodeByLocation({
        stateId: selectedState ?? undefined,
        municipalityId: selectedMunicipality ?? undefined,
        localityId: selectedLocality ?? undefined,
        enabled: Boolean(selectedState && selectedMunicipality && selectedLocality),
    });

    useEffect(() => {
        if (reverseLookupData?.postalCode) {
            setPostalCode(String(reverseLookupData.postalCode));
            setPostalCodeSource('location');
        }
    }, [reverseLookupData]);

    const shouldLookupLocation = postalCodeSource === 'manual' && postalCode.length >= 5;
    const postalCodeNumber = shouldLookupLocation ? Number(postalCode) : undefined;

    const {data: locationsFromZip} = useLocationsByZipCode({
        postalCode: postalCodeNumber,
        enabled: Boolean(postalCodeNumber),
    });

    useEffect(() => {
        if (!locationsFromZip?.length || postalCodeSource !== 'manual') return;

        const [match] = locationsFromZip;

        setSelectedState(match.stateId);
        setSelectedMunicipality(match.municipalityId);
        setSelectedLocality(match.localityId);
        resetStreetFields();
        setPostalCodeSource('location');
    }, [locationsFromZip, postalCodeSource]);

    useEffect(() => {
        if (citizenLookup.data && !citizenLookup.isLoading) {
            // Citizen found - auto-fill fields
            const citizen = citizenLookup.data;

            setExistingCitizenId(citizen.citizenId);
            setCitizenName(citizen.firstName);
            setCitizenSecondName(citizen.middleName);
            setCitizenLastName(citizen.lastName);
            setCitizenSecondLastName(citizen.secondLastName);
            setCitizenEmail(citizen.email);
            setIsAutoFilled(true);
        } else if (citizenLookup.data === null && !citizenLookup.isLoading && citizenLookupPhone) {
            // Citizen not found - clear existing citizen id but keep typed data
            setExistingCitizenId(null);
            setIsAutoFilled(false);
        }
    }, [citizenLookup.data, citizenLookup.isLoading, citizenLookupPhone]);

    const handlePhoneChange = (value: string) => {
        const digitsOnly = value.replace(/\D/g, '');
        const phoneValue = digitsOnly === '' ? null : BigInt(digitsOnly);
        setCitizenPhone(phoneValue);

        // Reset auto-fill state when phone changes
        if (isAutoFilled) {
            setIsAutoFilled(false);
            setExistingCitizenId(null);
        }

        // Trigger lookup if phone has enough digits (at least 10 for Mexican phones)
        if (digitsOnly.length >= 10) {
            setCitizenLookupPhone(Number(digitsOnly));
        } else {
            setCitizenLookupPhone(undefined);
        }
    };


    const handleClose = () => {
        setCitizenName(null);
        setCitizenSecondLastName(null);
        setCitizenPhone(null);
        setCitizenEmail(null);

        setExistingCitizenId(null);
        setCitizenLookupPhone(undefined);
        setIsAutoFilled(false);
        setReporterCitizen(false);

        setSelectedState(1);
        setSelectedMunicipality(null);
        setSelectedLocality(null);
        resetStreetFields();

        setPostalCode('');
        setPostalCodeSource('manual');

        setSelectedCategory(null);
        setSelectedFile(null);

        onClose();
    };

    const handleSubmit = async () => {
        const locationDto: Location = {
            stateId: selectedState!,
            municipalityId: selectedMunicipality!,
            localityId: selectedLocality!,
            mainStreetId: selectedStreet!,
            streetOneId: selectedStreet1,
            streetTwoId: selectedStreet2
        };

        let locationId: number = 0;
        let photoUrl: string | null = null;
        let citizenId: number | null = null;

        try {
            // Step 1: Create the location
            const locationResponse = await api.post<number>('/api/geography/locations/add', locationDto);
            locationId = locationResponse.data;

            // Step 2: Handle citizen (if this is a citizen report)
            if (reporterCitizen) {
                if (existingCitizenId) {
                    // Citizen already exists - use their ID
                    citizenId = existingCitizenId;
                } else {
                    // Citizen does not exist - create new one
                    const citizenDto: CitizenCreateDto = {
                        firstName: citizenName!,
                        middleName: citizenSecondName,
                        lastName: citizenLastName!,
                        secondLastName: citizenSecondLastName,
                        email: citizenEmail!,
                        phoneNumber: citizenPhone ? Number(citizenPhone) : null,
                        registeredLocationId: locationId
                    };

                    const citizenResponse = await api.post<number>('/api/citizens/add', citizenDto);
                    citizenId = citizenResponse.data;
                }
            }

            // Step 3: Upload photo if exists
            if (selectedFile) {
                const formData = new FormData();
                formData.append('file', selectedFile);

                const photoResponse = await api.post<FileUploadResponse>('api/files/upload/pothole-image', formData);
                photoUrl = photoResponse.data.url;
            }

            // Step 4: Create the Pothole
            const pothole: PotholeCreateDto = {
                reporterCitizenId: citizenId,
                locationId: locationId,
                categoryId: selectedCategory!,
                statusId: PotholeStatus.REPORTED,
                photoUrl: photoUrl,
                dateReported: null
            };

            await api.post('/api/potholes/add', pothole);

            feedback.successMsg('Bache registrado correctamente.');
            handleClose();

        } catch (error: unknown) {
            const errorMessage = error instanceof AxiosError
                ? `Error: ${error.response?.data.message}`
                : 'Ha ocurrido un error registrando el bache. Intentalo de nuevo mas tarde.';

            feedback.errorMsg(errorMessage);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            slotProps={{
                paper: {
                    sx: {width: 800, maxWidth: 800},
                },
            }}
        >
            <DialogTitle>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h5">Nuevo reporte de bache</Typography>
                    <IconButton onClick={handleClose}>
                        <CloseRounded />
                    </IconButton>
                </Stack>
            </DialogTitle>

            <DialogContent sx={{...sx}}>
                <Typography variant="body1">
                    <b>Número de folio:</b> {newReportId}
                </Typography>
                <Stack direction="row" justifyContent="space-between" sx={{pb: 2}}>
                    <Typography variant="body1">
                        <b>Registra:</b> {`${user?.firstName} ${user?.lastName}`}
                    </Typography>

                    <Typography variant="body1">
                        <b>Fecha:</b> {today}
                    </Typography>
                </Stack>

                <FormGroup>
                    <FormControlLabel
                        control={<Checkbox />}
                        label="Es reporte de un ciudadano"
                        checked={reporterCitizen}
                        onChange={() => setReporterCitizen(!reporterCitizen)}
                    />
                </FormGroup>

                { reporterCitizen && (
                    <>
                        {isAutoFilled && existingCitizenId && (
                            <Box sx={{
                                p: 2,
                                mb: 2,
                                backgroundColor: 'success.light',
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: 'success.main'
                            }}>
                                <Typography variant="body2" color="success.dark">
                                    <strong>Ciudadano encontrado:</strong> Los datos han sido autocompletados.
                                    El reporte se vinculará al ciudadano existente (ID: {existingCitizenId}).
                                </Typography>
                            </Box>
                        )}

                        <Grid container spacing={2}>
                            <Grid size={12}>
                                <Typography variant={'caption'}>Obligatorio (*)</Typography>
                            </Grid>
                            <Grid size={6}>
                                <TextField
                                    label={"Número de teléfono"}
                                    placeholder={'5551234567'}
                                    value={citizenPhone?.toString() ?? ''}
                                    onChange={(e) => handlePhoneChange(e.target.value)}
                                    fullWidth
                                    required
                                    helperText={
                                        citizenLookup.isLoading
                                            ? 'Buscando ciudadano...'
                                            : isAutoFilled
                                                ? '✓ Ciudadano encontrado - datos autocompletados'
                                                : citizenLookupPhone && !citizenLookup.data
                                                    ? 'Ciudadano no registrado - se creará uno nuevo'
                                                    : 'Ingresa el número para buscar ciudadano existente'
                                    }
                                    slotProps={{
                                        formHelperText: {
                                            sx: {
                                                color: isAutoFilled
                                                    ? 'success.main'
                                                    : citizenLookupPhone && !citizenLookup.data
                                                        ? 'info.main'
                                                        : 'text.secondary'
                                            }
                                        }
                                    }}
                                />
                            </Grid>

                            <Grid size={6}>
                                <TextField
                                    label={"Correo electrónico"}
                                    placeholder={'ejemplo@gmail.com'}
                                    value={citizenEmail ?? ''}
                                    onChange={(e) => setCitizenEmail(e.target.value === '' ? null : e.target.value)}
                                    fullWidth
                                    required
                                />
                            </Grid>

                            <Grid size={6}>
                                <TextField
                                    label={"Primer nombre"}
                                    placeholder={'Lorenzo'}
                                    value={citizenName ?? ''}
                                    onChange={(e) => {
                                        setCitizenName(e.target.value === '' ? null : e.target.value);
                                        if (isAutoFilled) setIsAutoFilled(false); // User is modifying auto-filled data
                                    }}
                                    fullWidth
                                    required
                                    disabled={isAutoFilled && existingCitizenId !== null}
                                    slotProps={{
                                        input: {
                                            sx: isAutoFilled ? { backgroundColor: 'action.hover' } : {}
                                        }
                                    }}
                                />
                            </Grid>

                            <Grid size={6}>
                                <TextField
                                    label={"Segundo nombre"}
                                    placeholder={'Martin'}
                                    value={citizenSecondName ?? ''}
                                    onChange={(e) => {
                                        setCitizenSecondName(e.target.value === '' ? null : e.target.value);
                                        if (isAutoFilled) setIsAutoFilled(false);
                                    }}
                                    fullWidth
                                    required
                                    disabled={isAutoFilled && existingCitizenId !== null}
                                    slotProps={{
                                        input: {
                                            sx: isAutoFilled ? { backgroundColor: 'action.hover' } : {}
                                        }
                                    }}
                                />
                            </Grid>

                            <Grid size={6}>
                                <TextField
                                    label={"Apellido paterno"}
                                    placeholder={'DiMarco'}
                                    value={citizenLastName ?? ''}
                                    onChange={(e) => {
                                        setCitizenLastName(e.target.value === '' ? null : e.target.value);
                                        if (isAutoFilled) setIsAutoFilled(false);
                                    }}
                                    fullWidth
                                    required
                                    disabled={isAutoFilled && existingCitizenId !== null}
                                    slotProps={{
                                        input: {
                                            sx: isAutoFilled ? { backgroundColor: 'action.hover' } : {}
                                        }
                                    }}
                                />
                            </Grid>

                            <Grid size={6}>
                                <TextField
                                    label={"Apellido paterno"}
                                    placeholder={'DiMarco'}
                                    value={citizenSecondLastName ?? ''}
                                    onChange={(e) => {
                                        setCitizenSecondLastName(e.target.value === '' ? null : e.target.value);
                                        if (isAutoFilled) setIsAutoFilled(false);
                                    }}
                                    fullWidth
                                    required
                                    disabled={isAutoFilled && existingCitizenId !== null}
                                    slotProps={{
                                        input: {
                                            sx: isAutoFilled ? { backgroundColor: 'action.hover' } : {}
                                        }
                                    }}
                                />
                            </Grid>

                            <Grid size={12}>
                                <Divider />
                            </Grid>
                        </Grid>
                    </>
                )}

                {/* Main section, the geographic data one */}
                <Grid size={12}>
                    <Divider />
                </Grid>
                <Grid container spacing={2} sx={{mt: 2}}>
                    <Grid size={12}>
                        <Typography variant="h6">Datos básicos</Typography>
                    </Grid>

                    <Grid size={6}>
                        <FormControl fullWidth>
                            <InputLabel>Estado</InputLabel>
                            <Select
                                label="Estado"
                                value={selectedState ?? ''}
                                onChange={(e) => handleStateChange(e.target.value === '' ? null : Number(e.target.value))}
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
                                label="Municipio"
                                required
                                value={selectedMunicipality ?? ''}
                                onChange={(e) =>
                                    handleMunicipalityChange(e.target.value === '' ? null : Number(e.target.value))
                                }
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
                                label="Localidad (ciudad o poblado)"
                                required
                                value={selectedLocality ?? ''}
                                onChange={(e) => handleLocalityChange(e.target.value === '' ? null : Number(e.target.value))}
                                disabled={!selectedMunicipality}
                            >
                                {localities?.data?.map((locality) => (
                                    <MenuItem key={locality.localityId} value={locality.localityId}>
                                        {locality.localityName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid size={6}>
                        <FormControl fullWidth>
                            <TextField
                                label="Código postal"
                                required
                                value={postalCode}
                                onChange={handlePostalCodeChange}
                                inputProps={{inputMode: 'numeric', pattern: '[0-9]*', maxLength: 5}}
                            />
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
                                {streetsPerLocality?.data?.map((street: Street) => (
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
                                {streetsPerLocality?.data?.map((street: Street) => (
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
                                {streetsPerLocality?.data?.map((street: Street) => (
                                    <MenuItem key={street.streetId} value={street.streetId}>
                                        {street.streetName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>


                    {/* THIRD GROUP */}
                    <Grid size={12}>
                        <Divider />
                    </Grid>

                    <Grid size={4} sx={{ alignSelf: 'center' }}>
                        <Typography variant={'h6'}>Severidad</Typography>
                    </Grid>

                    <Grid size={8}>
                        <FormControl fullWidth>
                            <InputLabel>Categoria del bache</InputLabel>
                            <Select
                                label={'Categoria del bache'}
                                value={selectedCategory ?? ''}
                                onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
                            >
                                {potholeCategories?.data?.map((cat: PotholeCategory) => (
                                    <MenuItem key={cat.categoryId} value={cat.categoryId} title={cat.description}>
                                        {cat.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* FOURTH GROUP */}

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
                    onClick={handleSubmit}
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