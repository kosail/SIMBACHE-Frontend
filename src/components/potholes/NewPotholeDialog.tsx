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
    SelectChangeEvent,
    Stack,
    SxProps,
    TextField,
    Typography,
} from '@mui/material';
import { CloseRounded, CloudUpload } from '@mui/icons-material';
import useAuth from '../../hooks/auth/useAuth.ts';
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import VisuallyHiddenInput from '../misc/VisuallyHiddenInput.tsx';
import { useGeoStates } from '../../hooks/geography/states/useGeoStates.ts';
import { useMunicipalities } from '../../hooks/geography/municipalities/useMunicipalities.ts';
import { useLocalities } from '../../hooks/geography/localities/useLocalities.ts';
import { useStreetsPerLocality } from '../../hooks/geography/streets/useStreets.ts';
import { useLocationsByZipCode, useZipCodeByLocation } from '../../hooks/geography/zipCodes/useZipCodeLookup.ts';
import { api } from '../../utils/api.ts';
import { PotholeCreateDto } from '../../types/pothole/PotholeCreateDto.ts';
import { Location } from '../../types/geography/Location.ts';
import { AxiosError } from 'axios';
import { useFeedbackStore } from '../../hooks/feedback/feedbackStore.ts';
import { PotholeStatus } from '../../types/pothole/PotholeStatus.ts';
import { usePotholeCategories } from '../../hooks/potholes/usePotholeCategories.ts';
import { FileUploadResponse } from '../../types/FileUploadResponse.ts';
import { useCitizenLookup } from '../../hooks/citizens/useCitizenLookup.ts';
import { CitizenCreateDto } from '../../types/citizen/CitizenCreateDto.ts';

// ============================================================================
// Types & Interfaces
// ============================================================================

type PostalCodeSource = 'manual' | 'location';

interface NewPotholeDialogProps {
    open: boolean;
    onClose: () => void;
    newReportId: number;
    sx?: SxProps;
}

interface CitizenFormState {
    firstName: string;
    middleName: string;
    lastName: string;
    secondLastName: string;
    phone: string;
    email: string;
}

interface LocationFormState {
    stateId: number | null;
    municipalityId: number | null;
    localityId: number | null;
    mainStreetId: number | null;
    streetOneId: number | null;
    streetTwoId: number | null;
}

interface PostalCodeState {
    value: string;
    source: PostalCodeSource;
}

// ============================================================================
// Constants
// ============================================================================

const INITIAL_CITIZEN_STATE: CitizenFormState = {
    firstName: '',
    middleName: '',
    lastName: '',
    secondLastName: '',
    phone: '',
    email: '',
};

const INITIAL_LOCATION_STATE: LocationFormState = {
    stateId: null,
    municipalityId: null,
    localityId: null,
    mainStreetId: null,
    streetOneId: null,
    streetTwoId: null,
};

const INITIAL_POSTAL_CODE_STATE: PostalCodeState = {
    value: '',
    source: 'manual',
};

const MIN_PHONE_DIGITS = 10;
const MIN_PHONE_LOOKUP_DIGITS = 7;
const POSTAL_CODE_LENGTH = 5;

const DIALOG_PAPER_PROPS = {
    sx: { width: 800, maxWidth: 800 },
};

// ============================================================================
// Helper Functions
// ============================================================================

const parseSelectValue = (value: string | number): number | null =>
    value === '' ? null : Number(value);

const getPhoneHelperText = (
    isLoading: boolean,
    isAutoFilled: boolean,
    hasLookupPhone: boolean,
    hasData: boolean
): string => {
    if (isLoading) return 'Buscando ciudadano...';
    if (isAutoFilled) return '✓ Ciudadano encontrado - datos autocompletados';
    if (hasLookupPhone && !hasData) return 'Ciudadano no registrado - se creará uno nuevo';
    return 'Ingresa el número para buscar ciudadano existente';
};

const getPhoneHelperColor = (
    isAutoFilled: boolean,
    hasLookupPhone: boolean,
    hasData: boolean
): string => {
    if (isAutoFilled) return 'success.main';
    if (hasLookupPhone && !hasData) return 'info.main';
    return 'text.secondary';
};

// ============================================================================
// Sub-Components
// ============================================================================

interface CitizenFoundBannerProps {
    citizenId: number;
}

function CitizenFoundBanner({ citizenId }: CitizenFoundBannerProps) {
    return (
        <Box
            sx={{
                p: 2,
                mb: 2,
                backgroundColor: 'success.light',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'success.main',
            }}
        >
            <Typography variant="body2" color="success.dark">
                <strong>Ciudadano encontrado:</strong> Los datos han sido autocompletados. El
                reporte se vinculará al ciudadano existente (ID: {citizenId}).
            </Typography>
        </Box>
    );
}

interface AutoFillTextFieldProps {
    label: string;
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
    isAutoFilled: boolean;
    isDisabled: boolean;
}

function AutoFillTextField({
                               label,
                               placeholder,
                               value,
                               onChange,
                               required = false,
                               isAutoFilled,
                               isDisabled,
                           }: AutoFillTextFieldProps) {
    return (
        <TextField
            label={label}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            fullWidth
            required={required}
            disabled={isDisabled}
            slotProps={{
                input: {
                    sx: isAutoFilled ? { backgroundColor: 'action.hover' } : {},
                },
            }}
        />
    );
}

interface FormSelectProps<T> {
    label: string;
    value: number | null;
    onChange: (value: number | null) => void;
    options: T[] | undefined;
    getOptionValue: (option: T) => number;
    getOptionLabel: (option: T) => string;
    disabled?: boolean;
    required?: boolean;
    getOptionTitle?: (option: T) => string;
}

function FormSelect<T>({
                           label,
                           value,
                           onChange,
                           options,
                           getOptionValue,
                           getOptionLabel,
                           disabled = false,
                           required = false,
                           getOptionTitle,
                       }: FormSelectProps<T>) {
    const handleChange = (e: SelectChangeEvent<number | string>) => {
        onChange(parseSelectValue(e.target.value));
    };

    return (
        <FormControl fullWidth>
            <InputLabel>{label}</InputLabel>
            <Select
                label={label}
                value={value ?? ''}
                onChange={handleChange}
                disabled={disabled}
                required={required}
            >
                {options?.map((option) => (
                    <MenuItem
                        key={getOptionValue(option)}
                        value={getOptionValue(option)}
                        title={getOptionTitle?.(option)}
                    >
                        {getOptionLabel(option)}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}

// ============================================================================
// Main Component
// ============================================================================

export default function NewPotholeDialog({ open, onClose, newReportId, sx }: NewPotholeDialogProps) {
    const { loginData: user } = useAuth();
    const feedback = useFeedbackStore();

    // -------------------------------------------------------------------------
    // Form State
    // -------------------------------------------------------------------------
    const [reporterCitizen, setReporterCitizen] = useState(false);
    const [citizenForm, setCitizenForm] = useState<CitizenFormState>(INITIAL_CITIZEN_STATE);
    const [existingCitizenId, setExistingCitizenId] = useState<number | null>(null);
    const [citizenLookupPhone, setCitizenLookupPhone] = useState<number | undefined>(undefined);
    const [isAutoFilled, setIsAutoFilled] = useState(false);

    const [locationForm, setLocationForm] = useState<LocationFormState>(INITIAL_LOCATION_STATE);
    const [postalCode, setPostalCode] = useState<PostalCodeState>(INITIAL_POSTAL_CODE_STATE);

    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [confirmation, setConfirmation] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // -------------------------------------------------------------------------
    // Derived Values
    // -------------------------------------------------------------------------
    const today = useMemo(() => new Date().toLocaleString(), []);

    const filePreviewUrl = useMemo(
        () => (selectedFile ? URL.createObjectURL(selectedFile) : null),
        [selectedFile]
    );

    // Cleanup object URL on unmount or file change
    useEffect(() => {
        return () => {
            if (filePreviewUrl) {
                URL.revokeObjectURL(filePreviewUrl);
            }
        };
    }, [filePreviewUrl]);

    const readyToSend = useMemo(
        () =>
            Boolean(
                locationForm.stateId &&
                locationForm.municipalityId &&
                locationForm.localityId &&
                locationForm.mainStreetId &&
                selectedCategory &&
                confirmation &&
                !isSubmitting
            ),
        [locationForm, selectedCategory, confirmation, isSubmitting]
    );

    // -------------------------------------------------------------------------
    // Data Fetching Hooks
    // -------------------------------------------------------------------------
    const states = useGeoStates();
    const municipalities = useMunicipalities(locationForm.stateId ?? 0);
    const localities = useLocalities(locationForm.municipalityId ?? 0);
    const streetsPerLocality = useStreetsPerLocality(locationForm.localityId ?? 0);
    const potholeCategories = usePotholeCategories();

    const citizenLookup = useCitizenLookup({
        phoneNumber: citizenLookupPhone,
        enabled: reporterCitizen && (citizenLookupPhone ?? 0) > Math.pow(10, MIN_PHONE_LOOKUP_DIGITS - 1),
    });

    const { data: reverseLookupData } = useZipCodeByLocation({
        stateId: locationForm.stateId ?? undefined,
        municipalityId: locationForm.municipalityId ?? undefined,
        localityId: locationForm.localityId ?? undefined,
        enabled: Boolean(
            locationForm.stateId && locationForm.municipalityId && locationForm.localityId
        ),
    });

    const shouldLookupLocation =
        postalCode.source === 'manual' && postalCode.value.length >= POSTAL_CODE_LENGTH;
    const postalCodeNumber = shouldLookupLocation ? Number(postalCode.value) : undefined;

    const { data: locationsFromZip } = useLocationsByZipCode({
        postalCode: postalCodeNumber,
        enabled: Boolean(postalCodeNumber),
    });

    // -------------------------------------------------------------------------
    // Effects
    // -------------------------------------------------------------------------

    // Set default state on load
    useEffect(() => {
        if (!states.isLoading && locationForm.stateId === null && states.data?.length) {
            setLocationForm((prev) => ({ ...prev, stateId: states.data[0].stateId }));
        }
    }, [states.isLoading, states.data, locationForm.stateId]);

    // Reverse lookup: fill postal code from location
    useEffect(() => {
        if (reverseLookupData?.postalCode) {
            setPostalCode({
                value: String(reverseLookupData.postalCode),
                source: 'location',
            });
        }
    }, [reverseLookupData]);

    // Forward lookup: fill location from postal code
    useEffect(() => {
        if (!locationsFromZip?.length || postalCode.source !== 'manual') return;

        const [match] = locationsFromZip;
        setLocationForm({
            stateId: match.stateId,
            municipalityId: match.municipalityId,
            localityId: match.localityId,
            mainStreetId: null,
            streetOneId: null,
            streetTwoId: null,
        });
        setPostalCode((prev) => ({ ...prev, source: 'location' }));
    }, [locationsFromZip, postalCode.source]);

    // Citizen lookup auto-fill
    useEffect(() => {
        if (citizenLookup.data && !citizenLookup.isLoading) {
            const citizen = citizenLookup.data;
            setExistingCitizenId(citizen.citizenId);
            setCitizenForm({
                firstName: citizen.firstName ?? '',
                middleName: citizen.middleName ?? '',
                lastName: citizen.lastName ?? '',
                secondLastName: citizen.secondLastName ?? '',
                phone: citizenForm.phone,
                email: citizen.email ?? '',
            });
            setIsAutoFilled(true);
        } else if (citizenLookup.data === null && !citizenLookup.isLoading && citizenLookupPhone) {
            setExistingCitizenId(null);
            setIsAutoFilled(false);
        }
    }, [citizenLookup.data, citizenLookup.isLoading, citizenLookupPhone, citizenForm.phone]);

    // -------------------------------------------------------------------------
    // Handlers
    // -------------------------------------------------------------------------

    const updateCitizenField = useCallback(
        (field: keyof CitizenFormState) => (value: string) => {
            setCitizenForm((prev) => ({ ...prev, [field]: value }));
            if (isAutoFilled && field !== 'phone') {
                setIsAutoFilled(false);
            }
        },
        [isAutoFilled]
    );

    const handlePhoneChange = useCallback((value: string) => {
        const digitsOnly = value.replace(/\D/g, '');
        setCitizenForm((prev) => ({ ...prev, phone: digitsOnly }));

        if (isAutoFilled) {
            setIsAutoFilled(false);
            setExistingCitizenId(null);
        }

        setCitizenLookupPhone(
            digitsOnly.length >= MIN_PHONE_DIGITS ? Number(digitsOnly) : undefined
        );
    }, [isAutoFilled]);

    const handleStateChange = useCallback(
        (value: number | null) => {
            setLocationForm({
                stateId: value,
                municipalityId: null,
                localityId: null,
                mainStreetId: null,
                streetOneId: null,
                streetTwoId: null,
            });
            setPostalCode(INITIAL_POSTAL_CODE_STATE);
        },
        []
    );

    const handleMunicipalityChange = useCallback(
        (value: number | null) => {
            setLocationForm((prev) => ({
                ...prev,
                municipalityId: value,
                localityId: null,
                mainStreetId: null,
                streetOneId: null,
                streetTwoId: null,
            }));
            setPostalCode(INITIAL_POSTAL_CODE_STATE);
        },
        []
    );

    const handleLocalityChange = useCallback(
        (value: number | null) => {
            setLocationForm((prev) => ({
                ...prev,
                localityId: value,
                mainStreetId: null,
                streetOneId: null,
                streetTwoId: null,
            }));
            setPostalCode(INITIAL_POSTAL_CODE_STATE);
        },
        []
    );

    const handleStreetChange = useCallback(
        (field: 'mainStreetId' | 'streetOneId' | 'streetTwoId') => (value: number | null) => {
            setLocationForm((prev) => ({ ...prev, [field]: value }));
        },
        []
    );

    const handlePostalCodeChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        const digitsOnly = event.target.value.replace(/\D/g, '').slice(0, POSTAL_CODE_LENGTH);
        setPostalCode({ value: digitsOnly, source: 'manual' });
    }, []);

    const handleFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setSelectedFile(event.target.files?.[0] ?? null);
    }, []);

    const resetForm = useCallback(() => {
        setCitizenForm(INITIAL_CITIZEN_STATE);
        setExistingCitizenId(null);
        setCitizenLookupPhone(undefined);
        setIsAutoFilled(false);
        setReporterCitizen(false);
        setLocationForm({ ...INITIAL_LOCATION_STATE, stateId: 1 });
        setPostalCode(INITIAL_POSTAL_CODE_STATE);
        setSelectedCategory(null);
        setSelectedFile(null);
        setConfirmation(false);
    }, []);

    const handleClose = useCallback(() => {
        resetForm();
        onClose();
    }, [resetForm, onClose]);

    const handleSubmit = useCallback(async () => {
        setIsSubmitting(true);

        const locationDto: Location = {
            stateId: locationForm.stateId!,
            municipalityId: locationForm.municipalityId!,
            localityId: locationForm.localityId!,
            mainStreetId: locationForm.mainStreetId!,
            streetOneId: locationForm.streetOneId,
            streetTwoId: locationForm.streetTwoId,
        };

        try {
            // Step 1: Create location
            const { data: locationId } = await api.post<number>(
                '/api/geography/locations/add',
                locationDto
            );

            // Step 2: Handle citizen
            let citizenId: number | null = null;
            if (reporterCitizen) {
                if (existingCitizenId) {
                    citizenId = existingCitizenId;
                } else {
                    const citizenDto: CitizenCreateDto = {
                        firstName: citizenForm.firstName,
                        middleName: citizenForm.middleName || null,
                        lastName: citizenForm.lastName,
                        secondLastName: citizenForm.secondLastName || null,
                        email: citizenForm.email,
                        phoneNumber: citizenForm.phone ? Number(citizenForm.phone) : null,
                        registeredLocationId: locationId,
                    };
                    const { data: newCitizenId } = await api.post<number>(
                        '/api/citizens/add',
                        citizenDto
                    );
                    citizenId = newCitizenId;
                }
            }

            // Step 3: Upload photo
            let photoUrl: string | null = null;
            if (selectedFile) {
                const formData = new FormData();
                formData.append('file', selectedFile);
                const { data: uploadResponse } = await api.post<FileUploadResponse>(
                    '/api/files/upload/pothole-image',
                    formData
                );
                photoUrl = uploadResponse.url;
            }

            // Step 4: Create pothole
            const pothole: PotholeCreateDto = {
                reporterCitizenId: citizenId,
                locationId,
                categoryId: selectedCategory!,
                statusId: PotholeStatus.REPORTED,
                photoUrl,
                dateReported: null,
            };
            await api.post('/api/potholes/add', pothole);

            feedback.successMsg('Bache registrado correctamente.');
            handleClose();
        } catch (error: unknown) {
            const errorMessage =
                error instanceof AxiosError
                    ? `Error: ${error.response?.data?.message ?? error.message}`
                    : 'Ha ocurrido un error registrando el bache. Inténtalo de nuevo más tarde.';
            feedback.errorMsg(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    }, [
        locationForm,
        reporterCitizen,
        existingCitizenId,
        citizenForm,
        selectedFile,
        selectedCategory,
        feedback,
        handleClose,
    ]);

    // -------------------------------------------------------------------------
    // Render Helpers
    // -------------------------------------------------------------------------

    const citizenFieldsDisabled = isAutoFilled && existingCitizenId !== null;

    const phoneHelperText = getPhoneHelperText(
        citizenLookup.isLoading,
        isAutoFilled,
        citizenLookupPhone !== undefined,
        !!citizenLookup.data
    );

    const phoneHelperColor = getPhoneHelperColor(
        isAutoFilled,
        citizenLookupPhone !== undefined,
        !!citizenLookup.data
    );

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    return (
        <Dialog open={open} onClose={handleClose} slotProps={{ paper: DIALOG_PAPER_PROPS }}>
            <DialogTitle>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h5">Nuevo reporte de bache</Typography>
                    <IconButton onClick={handleClose} aria-label="Cerrar diálogo">
                        <CloseRounded />
                    </IconButton>
                </Stack>
            </DialogTitle>

            <DialogContent sx={sx}>
                {/* Header Info */}
                <Typography variant="body1">
                    <b>Número de folio:</b> {newReportId}
                </Typography>
                <Stack direction="row" justifyContent="space-between" sx={{ pb: 2 }}>
                    <Typography variant="body1">
                        <b>Registra:</b> {`${user?.firstName} ${user?.lastName}`}
                    </Typography>
                    <Typography variant="body1">
                        <b>Fecha:</b> {today}
                    </Typography>
                </Stack>

                {/* Citizen Report Checkbox */}
                <FormGroup>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={reporterCitizen}
                                onChange={(_, checked) => setReporterCitizen(checked)}
                            />
                        }
                        label="Es reporte de un ciudadano"
                    />
                </FormGroup>

                {/* Citizen Section */}
                {reporterCitizen && (
                    <>
                        {isAutoFilled && existingCitizenId && (
                            <CitizenFoundBanner citizenId={existingCitizenId} />
                        )}

                        <Grid container spacing={2}>
                            <Grid size={12}>
                                <Typography variant="caption">Obligatorio (*)</Typography>
                            </Grid>

                            <Grid size={6}>
                                <TextField
                                    label="Número de teléfono"
                                    placeholder="5551234567"
                                    value={citizenForm.phone}
                                    onChange={(e) => handlePhoneChange(e.target.value)}
                                    fullWidth
                                    required
                                    helperText={phoneHelperText}
                                    slotProps={{
                                        formHelperText: { sx: { color: phoneHelperColor } },
                                    }}
                                />
                            </Grid>

                            <Grid size={6}>
                                <AutoFillTextField
                                    label="Correo electrónico"
                                    placeholder="ejemplo@gmail.com"
                                    value={citizenForm.email}
                                    onChange={updateCitizenField('email')}
                                    required
                                    isAutoFilled={isAutoFilled}
                                    isDisabled={citizenFieldsDisabled}
                                />
                            </Grid>

                            <Grid size={6}>
                                <AutoFillTextField
                                    label="Primer nombre"
                                    placeholder="Lorenzo"
                                    value={citizenForm.firstName}
                                    onChange={updateCitizenField('firstName')}
                                    required
                                    isAutoFilled={isAutoFilled}
                                    isDisabled={citizenFieldsDisabled}
                                />
                            </Grid>

                            <Grid size={6}>
                                <AutoFillTextField
                                    label="Segundo nombre"
                                    placeholder="Martin"
                                    value={citizenForm.middleName}
                                    onChange={updateCitizenField('middleName')}
                                    isAutoFilled={isAutoFilled}
                                    isDisabled={citizenFieldsDisabled}
                                />
                            </Grid>

                            <Grid size={6}>
                                <AutoFillTextField
                                    label="Apellido paterno"
                                    placeholder="DiMarco"
                                    value={citizenForm.lastName}
                                    onChange={updateCitizenField('lastName')}
                                    required
                                    isAutoFilled={isAutoFilled}
                                    isDisabled={citizenFieldsDisabled}
                                />
                            </Grid>

                            <Grid size={6}>
                                <AutoFillTextField
                                    label="Apellido materno"
                                    placeholder="Medici"
                                    value={citizenForm.secondLastName}
                                    onChange={updateCitizenField('secondLastName')}
                                    isAutoFilled={isAutoFilled}
                                    isDisabled={citizenFieldsDisabled}
                                />
                            </Grid>

                            <Grid size={12}>
                                <Divider />
                            </Grid>
                        </Grid>
                    </>
                )}

                {/* Location Section */}
                <Grid size={12}>
                    <Divider />
                </Grid>

                <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid size={12}>
                        <Typography variant="h6">Datos básicos</Typography>
                    </Grid>

                    <Grid size={6}>
                        <FormSelect
                            label="Estado"
                            value={locationForm.stateId}
                            onChange={handleStateChange}
                            options={states.data}
                            getOptionValue={(s) => s.stateId}
                            getOptionLabel={(s) => s.stateName}
                            required
                        />
                    </Grid>

                    <Grid size={6}>
                        <FormSelect
                            label="Municipio"
                            value={locationForm.municipalityId}
                            onChange={handleMunicipalityChange}
                            options={municipalities.data}
                            getOptionValue={(m) => m.municipalityId}
                            getOptionLabel={(m) => m.municipalityName}
                            disabled={!locationForm.stateId}
                            required
                        />
                    </Grid>

                    <Grid size={6}>
                        <FormSelect
                            label="Localidad (ciudad o poblado)"
                            value={locationForm.localityId}
                            onChange={handleLocalityChange}
                            options={localities.data}
                            getOptionValue={(l) => l.localityId}
                            getOptionLabel={(l) => l.localityName}
                            disabled={!locationForm.municipalityId}
                            required
                        />
                    </Grid>

                    <Grid size={6}>
                        <FormControl fullWidth>
                            <TextField
                                label="Código postal"
                                required
                                value={postalCode.value}
                                onChange={handlePostalCodeChange}
                                inputProps={{
                                    inputMode: 'numeric',
                                    pattern: '[0-9]*',
                                    maxLength: POSTAL_CODE_LENGTH,
                                }}
                            />
                        </FormControl>
                    </Grid>

                    {/* Streets Section */}
                    <Grid size={12}>
                        <Typography variant="h6">Calles</Typography>
                    </Grid>

                    <Grid size={12}>
                        <FormSelect
                            label="Calle afectada"
                            value={locationForm.mainStreetId}
                            onChange={handleStreetChange('mainStreetId')}
                            options={streetsPerLocality.data}
                            getOptionValue={(s) => s.streetId}
                            getOptionLabel={(s) => s.streetName}
                            disabled={!locationForm.localityId}
                            required
                        />
                    </Grid>

                    <Grid size={6}>
                        <FormSelect
                            label="Entre calle 1"
                            value={locationForm.streetOneId}
                            onChange={handleStreetChange('streetOneId')}
                            options={streetsPerLocality.data}
                            getOptionValue={(s) => s.streetId}
                            getOptionLabel={(s) => s.streetName}
                            disabled={!locationForm.localityId}
                        />
                    </Grid>

                    <Grid size={6}>
                        <FormSelect
                            label="Entre calle 2"
                            value={locationForm.streetTwoId}
                            onChange={handleStreetChange('streetTwoId')}
                            options={streetsPerLocality.data}
                            getOptionValue={(s) => s.streetId}
                            getOptionLabel={(s) => s.streetName}
                            disabled={!locationForm.localityId}
                        />
                    </Grid>

                    {/* Category Section */}
                    <Grid size={12}>
                        <Divider />
                    </Grid>

                    <Grid size={4} sx={{ alignSelf: 'center' }}>
                        <Typography variant="h6">Severidad</Typography>
                    </Grid>

                    <Grid size={8}>
                        <FormSelect
                            label="Categoría del bache"
                            value={selectedCategory}
                            onChange={setSelectedCategory}
                            options={potholeCategories.data}
                            getOptionValue={(c) => c.categoryId}
                            getOptionLabel={(c) => c.name}
                            getOptionTitle={(c) => c.description}
                        />
                    </Grid>

                    {/* Photo Section */}
                    <Grid size={12}>
                        <Typography variant="h6">Fotografía del bache</Typography>
                    </Grid>

                    <Grid
                        size={selectedFile ? 6 : 12}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Button
                            component="label"
                            variant="contained"
                            tabIndex={-1}
                            startIcon={<CloudUpload />}
                            color="secondary"
                            fullWidth
                        >
                            Subir fotografía
                            <VisuallyHiddenInput
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </Button>

                        {selectedFile && (
                            <Typography variant="subtitle1" textAlign="center" sx={{ pt: 2 }}>
                                Nombre del archivo:
                                <br />
                                {selectedFile.name}
                            </Typography>
                        )}
                    </Grid>

                    {selectedFile && filePreviewUrl && (
                        <Grid size={6}>
                            <Box
                                component="img"
                                src={filePreviewUrl}
                                alt="Vista previa del bache"
                                width="100%"
                            />
                        </Grid>
                    )}
                </Grid>

                {/* Confirmation Section */}
                <Divider sx={{ mt: 4 }} />
                <FormGroup>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={confirmation}
                                onChange={(_, checked) => setConfirmation(checked)}
                            />
                        }
                        label="Declaro que la información proporcionada es veraz y completa."
                    />
                </FormGroup>

                <Button
                    variant="contained"
                    sx={{ mt: 2 }}
                    disabled={!readyToSend}
                    onClick={handleSubmit}
                    fullWidth
                >
                    <Typography variant="h6">
                        {isSubmitting ? 'Registrando...' : 'Reportar nuevo bache'}
                    </Typography>
                </Button>
            </DialogContent>
        </Dialog>
    );
}