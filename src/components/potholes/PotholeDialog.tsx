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
import { CloseRounded, CloudUpload, Delete } from '@mui/icons-material';
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
import { PotholeUpdateDto } from '../../types/pothole/PotholeUpdateDto.ts';
import { PotholeResponseDto } from '../../types/pothole/PotholeResponseDto.ts';
import { Location } from '../../types/geography/Location.ts';
import { AxiosError } from 'axios';
import { useFeedbackStore } from '../../hooks/feedback/feedbackStore.ts';
import { PotholeStatus } from '../../types/pothole/PotholeStatus.ts';
import { usePotholeCategories } from '../../hooks/potholes/usePotholeCategories.ts';
import { FileUploadResponse } from '../../types/FileUploadResponse.ts';
import { useCitizenLookup } from '../../hooks/citizens/useCitizenLookup.ts';
import { CitizenCreateDto } from '../../types/citizen/CitizenCreateDto.ts';
import { UseMutationResult } from '@tanstack/react-query';

// ============================================================================
// Types & Interfaces
// ============================================================================

type DialogMode = 'create' | 'edit';
type PostalCodeSource = 'manual' | 'location';

interface BasePotholeDialogProps {
    open: boolean;
    onClose: () => void;
    sx?: SxProps;
}

interface CreateModeProps extends BasePotholeDialogProps {
    mode: 'create';
    newReportId: number;
    pothole?: never;
    updateMutation?: never;
}

interface EditModeProps extends BasePotholeDialogProps {
    mode: 'edit';
    pothole: PotholeResponseDto;
    updateMutation: UseMutationResult<PotholeResponseDto, unknown, PotholeUpdateDto>;
    newReportId?: never;
}

type PotholeDialogProps = CreateModeProps | EditModeProps;

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

interface PhotoState {
    file: File | null;
    existingUrl: string | null;
    markedForDeletion: boolean;
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

const INITIAL_PHOTO_STATE: PhotoState = {
    file: null,
    existingUrl: null,
    markedForDeletion: false,
};

const MIN_PHONE_DIGITS = 10;
const MIN_PHONE_LOOKUP_DIGITS = 7;
const POSTAL_CODE_LENGTH = 5;

const DIALOG_PAPER_PROPS = {
    sx: { width: 800, maxWidth: 800 },
};

const DIALOG_CONFIG = {
    create: {
        title: 'Nuevo reporte de bache',
        submitLabel: 'Reportar nuevo bache',
        submittingLabel: 'Registrando...',
        successMessage: 'Bache registrado correctamente.',
        errorMessage: 'Ha ocurrido un error registrando el bache. Inténtalo de nuevo más tarde.',
    },
    edit: {
        title: 'Editar reporte de bache',
        submitLabel: 'Guardar cambios',
        submittingLabel: 'Guardando...',
        successMessage: 'Bache actualizado correctamente.',
        errorMessage: 'No se pudo actualizar el bache. Inténtalo de nuevo.',
    },
} as const;

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

const extractFilenameFromUrl = (url: string): string => {
    try {
        const parsed = new URL(url);
        return parsed.pathname.split('/').pop() ?? '';
    } catch {
        return url.split('/').pop() ?? '';
    }
};

const buildLocationFormFromPothole = (pothole: PotholeResponseDto): LocationFormState => ({
    stateId: pothole.location?.state?.stateId ?? null,
    municipalityId: pothole.location?.municipality?.municipalityId ?? null,
    localityId: pothole.location?.locality?.localityId ?? null,
    mainStreetId: pothole.location?.mainStreet?.streetId ?? null,
    streetOneId: pothole.location?.streetOne?.streetId ?? null,
    streetTwoId: pothole.location?.streetTwo?.streetId ?? null,
});

const buildCitizenFormFromPothole = (pothole: PotholeResponseDto): CitizenFormState => {
    const citizen = pothole.reporterCitizen;
    if (!citizen) return INITIAL_CITIZEN_STATE;

    return {
        firstName: citizen.firstName ?? '',
        middleName: citizen.middleName ?? '',
        lastName: citizen.lastName ?? '',
        secondLastName: citizen.secondLastName ?? '',
        phone: citizen.phoneNumber?.toString() ?? '',
        email: citizen.email ?? '',
    };
};

const hasLocationChanged = (
    current: LocationFormState,
    original: PotholeResponseDto
): boolean => {
    const origLoc = original.location;
    return (
        current.stateId !== origLoc?.state?.stateId ||
        current.municipalityId !== origLoc?.municipality?.municipalityId ||
        current.localityId !== origLoc?.locality?.localityId ||
        current.mainStreetId !== (origLoc?.mainStreet?.streetId ?? null) ||
        current.streetOneId !== (origLoc?.streetOne?.streetId ?? null) ||
        current.streetTwoId !== (origLoc?.streetTwo?.streetId ?? null)
    );
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

interface PhotoSectionProps {
    mode: DialogMode;
    photo: PhotoState;
    onFileChange: (file: File | null) => void;
    onMarkForDeletion: () => void;
    previewUrl: string | null;
}

function PhotoSection({
                          mode,
                          photo,
                          onFileChange,
                          onMarkForDeletion,
                          previewUrl,
                      }: PhotoSectionProps) {
    const displayUrl = previewUrl ?? (photo.markedForDeletion ? null : photo.existingUrl);
    const hasExistingPhoto = photo.existingUrl && !photo.file && !photo.markedForDeletion;

    const uploadButtonLabel = useMemo(() => {
        if (mode === 'create') return 'Subir fotografía';
        if (photo.file) return 'Reemplazar fotografía';
        return 'Actualizar fotografía';
    }, [mode, photo.file]);

    const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        onFileChange(e.target.files?.[0] ?? null);
    };

    return (
        <>
            <Grid size={12}>
                <Typography variant="h6">Fotografía del bache</Typography>
            </Grid>

            <Grid
                size={displayUrl ? 6 : 12}
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
                    {uploadButtonLabel}
                    <VisuallyHiddenInput
                        type="file"
                        accept="image/*"
                        onChange={handleFileInputChange}
                    />
                </Button>

                {mode === 'edit' && hasExistingPhoto && (
                    <Button
                        variant="text"
                        color="error"
                        startIcon={<Delete />}
                        sx={{ mt: 1.5 }}
                        onClick={onMarkForDeletion}
                        fullWidth
                    >
                        Eliminar fotografía
                    </Button>
                )}

                {photo.markedForDeletion && (
                    <Typography variant="body2" color="error" sx={{ mt: 2, textAlign: 'center' }}>
                        La imagen se eliminará al guardar los cambios.
                    </Typography>
                )}

                {photo.file && (
                    <Typography variant="subtitle1" textAlign="center" sx={{ pt: 2 }}>
                        Nombre del archivo:
                        <br />
                        {photo.file.name}
                    </Typography>
                )}
            </Grid>

            {displayUrl && (
                <Grid size={6}>
                    <Box
                        component="img"
                        src={displayUrl}
                        alt="Vista previa del bache"
                        sx={{
                            width: '100%',
                            height: 220,
                            objectFit: 'cover',
                            borderRadius: 2,
                        }}
                    />
                </Grid>
            )}
        </>
    );
}

interface DialogHeaderProps {
    mode: DialogMode;
    newReportId?: number;
    pothole?: PotholeResponseDto;
    userName: string;
    date: string;
}

function DialogHeader({ mode, newReportId, pothole, userName, date }: DialogHeaderProps) {
    if (mode === 'create') {
        return (
            <>
                <Typography variant="body1">
                    <b>Número de folio:</b> {newReportId}
                </Typography>
                <Stack direction="row" justifyContent="space-between" sx={{ pb: 2 }}>
                    <Typography variant="body1">
                        <b>Registra:</b> {userName}
                    </Typography>
                    <Typography variant="body1">
                        <b>Fecha:</b> {date}
                    </Typography>
                </Stack>
            </>
        );
    }

    return (
        <>
            <Typography variant="body1">
                <b>Folio:</b> {pothole?.potholeId}
            </Typography>
            <Stack direction="row" justifyContent="space-between" sx={{ pb: 2 }}>
                <Typography variant="body1">
                    <b>Registrado por:</b>{' '}
                    {`${pothole?.registeredByUser?.firstName ?? ''} ${pothole?.registeredByUser?.lastName ?? ''}`}
                </Typography>
                <Typography variant="body1">
                    <b>Reportado el:</b>{' '}
                    {pothole?.dateReported ? new Date(pothole.dateReported).toLocaleString() : '-'}
                </Typography>
            </Stack>
        </>
    );
}

// ============================================================================
// Main Component
// ============================================================================

export default function PotholeDialog(props: PotholeDialogProps) {
    const { open, onClose, sx, mode } = props;
    const { loginData: user } = useAuth();
    const feedback = useFeedbackStore();
    const config = DIALOG_CONFIG[mode];

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
    const [photo, setPhoto] = useState<PhotoState>(INITIAL_PHOTO_STATE);
    const [confirmation, setConfirmation] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // -------------------------------------------------------------------------
    // Derived Values
    // -------------------------------------------------------------------------
    const today = useMemo(() => new Date().toLocaleString(), []);
    const userName = useMemo(
        () => `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim(),
        [user]
    );

    const filePreviewUrl = useMemo(
        () => (photo.file ? URL.createObjectURL(photo.file) : null),
        [photo.file]
    );

    useEffect(() => {
        return () => {
            if (filePreviewUrl) {
                URL.revokeObjectURL(filePreviewUrl);
            }
        };
    }, [filePreviewUrl]);

    const isFormValid = useMemo(() => {
        const baseValid = Boolean(
            locationForm.stateId &&
            locationForm.municipalityId &&
            locationForm.localityId &&
            locationForm.mainStreetId &&
            selectedCategory &&
            !isSubmitting
        );

        if (mode === 'create') {
            return baseValid && confirmation;
        }

        return baseValid;
    }, [locationForm, selectedCategory, confirmation, isSubmitting, mode]);

    const isPending = mode === 'edit' ? props.updateMutation?.isPending : false;
    const readyToSubmit = isFormValid && !isPending;

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
        enabled:
            mode === 'create' &&
            reporterCitizen &&
            (citizenLookupPhone ?? 0) > Math.pow(10, MIN_PHONE_LOOKUP_DIGITS - 1),
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

    // Initialize form for edit mode
    useEffect(() => {
        if (!open) return;

        if (mode === 'edit' && props.pothole) {
            const pothole = props.pothole;
            setReporterCitizen(Boolean(pothole.reporterCitizen));
            setCitizenForm(buildCitizenFormFromPothole(pothole));
            setExistingCitizenId(pothole.reporterCitizen?.citizenId ?? null);
            setLocationForm(buildLocationFormFromPothole(pothole));
            setPostalCode({
                value: pothole.location?.postalCode?.toString() ?? '',
                source: 'location',
            });
            setSelectedCategory(pothole.category?.categoryId ?? null);
            setPhoto({
                file: null,
                existingUrl: pothole.photoUrl ?? null,
                markedForDeletion: false,
            });
            setIsAutoFilled(Boolean(pothole.reporterCitizen));
        }
    }, [open, mode, props.pothole]);

    // Set default state on load (create mode)
    useEffect(() => {
        if (mode !== 'create') return;
        if (!states.isLoading && locationForm.stateId === null && states.data?.length) {
            setLocationForm((prev) => ({ ...prev, stateId: states.data![0].stateId }));
        }
    }, [states.isLoading, states.data, locationForm.stateId, mode]);

    // Reverse lookup: fill postal code from location
    useEffect(() => {
        if (reverseLookupData?.postalCode && postalCode.source !== 'manual') {
            setPostalCode({
                value: String(reverseLookupData.postalCode),
                source: 'location',
            });
        }
    }, [reverseLookupData, postalCode.source]);

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

    // Citizen lookup auto-fill (create mode only)
    useEffect(() => {
        if (mode !== 'create') return;

        if (citizenLookup.data && !citizenLookup.isLoading) {
            const citizen = citizenLookup.data;
            setExistingCitizenId(citizen.citizenId);
            setCitizenForm((prev) => ({
                ...prev,
                firstName: citizen.firstName ?? '',
                middleName: citizen.middleName ?? '',
                lastName: citizen.lastName ?? '',
                secondLastName: citizen.secondLastName ?? '',
                email: citizen.email ?? '',
            }));
            setIsAutoFilled(true);
        } else if (citizenLookup.data === null && !citizenLookup.isLoading && citizenLookupPhone) {
            setExistingCitizenId(null);
            setIsAutoFilled(false);
        }
    }, [citizenLookup.data, citizenLookup.isLoading, citizenLookupPhone, mode]);

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

    const handlePhoneChange = useCallback(
        (value: string) => {
            const digitsOnly = value.replace(/\D/g, '');
            setCitizenForm((prev) => ({ ...prev, phone: digitsOnly }));

            if (isAutoFilled) {
                setIsAutoFilled(false);
                setExistingCitizenId(null);
            }

            if (mode === 'create') {
                setCitizenLookupPhone(
                    digitsOnly.length >= MIN_PHONE_DIGITS ? Number(digitsOnly) : undefined
                );
            }
        },
        [isAutoFilled, mode]
    );

    const handleStateChange = useCallback((value: number | null) => {
        setLocationForm({
            stateId: value,
            municipalityId: null,
            localityId: null,
            mainStreetId: null,
            streetOneId: null,
            streetTwoId: null,
        });
        setPostalCode(INITIAL_POSTAL_CODE_STATE);
    }, []);

    const handleMunicipalityChange = useCallback((value: number | null) => {
        setLocationForm((prev) => ({
            ...prev,
            municipalityId: value,
            localityId: null,
            mainStreetId: null,
            streetOneId: null,
            streetTwoId: null,
        }));
        setPostalCode(INITIAL_POSTAL_CODE_STATE);
    }, []);

    const handleLocalityChange = useCallback((value: number | null) => {
        setLocationForm((prev) => ({
            ...prev,
            localityId: value,
            mainStreetId: null,
            streetOneId: null,
            streetTwoId: null,
        }));
        setPostalCode(INITIAL_POSTAL_CODE_STATE);
    }, []);

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

    const handleFileChange = useCallback((file: File | null) => {
        setPhoto((prev) => ({
            ...prev,
            file,
            markedForDeletion: file ? false : prev.markedForDeletion,
        }));
    }, []);

    const handleMarkPhotoForDeletion = useCallback(() => {
        setPhoto((prev) => ({
            ...prev,
            markedForDeletion: true,
            file: null,
        }));
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
        setPhoto(INITIAL_PHOTO_STATE);
        setConfirmation(false);
    }, []);

    const handleClose = useCallback(() => {
        resetForm();
        onClose();
    }, [resetForm, onClose]);

    // -------------------------------------------------------------------------
    // Submit Handlers
    // -------------------------------------------------------------------------

    const uploadPhoto = useCallback(async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);
        const { data } = await api.post<FileUploadResponse>(
            '/api/files/upload/pothole-image',
            formData
        );
        return data.url;
    }, []);

    const deletePhoto = useCallback(async (url: string): Promise<void> => {
        const filename = extractFilenameFromUrl(url);
        if (filename) {
            await api.delete('/api/files/delete', { params: { filename } });
        }
    }, []);

    const createLocation = useCallback(async (): Promise<number> => {
        const locationDto: Location = {
            stateId: locationForm.stateId!,
            municipalityId: locationForm.municipalityId!,
            localityId: locationForm.localityId!,
            mainStreetId: locationForm.mainStreetId!,
            streetOneId: locationForm.streetOneId,
            streetTwoId: locationForm.streetTwoId,
        };
        const { data } = await api.post<number>('/api/geography/locations/add', locationDto);
        return data;
    }, [locationForm]);

    const createCitizen = useCallback(
        async (locationId: number): Promise<number> => {
            const citizenDto: CitizenCreateDto = {
                firstName: citizenForm.firstName,
                middleName: citizenForm.middleName || null,
                lastName: citizenForm.lastName,
                secondLastName: citizenForm.secondLastName || null,
                email: citizenForm.email,
                phoneNumber: citizenForm.phone ? Number(citizenForm.phone) : null,
                registeredLocationId: locationId,
            };
            const { data } = await api.post<number>('/api/citizens/add', citizenDto);
            return data;
        },
        [citizenForm]
    );

    const handleCreateSubmit = useCallback(async () => {
        setIsSubmitting(true);

        try {
            const locationId = await createLocation();

            let citizenId: number | null = null;
            if (reporterCitizen) {
                citizenId = existingCitizenId ?? (await createCitizen(locationId));
            }

            let photoUrl: string | null = null;
            if (photo.file) {
                photoUrl = await uploadPhoto(photo.file);
            }

            const pothole: PotholeCreateDto = {
                reporterCitizenId: citizenId,
                locationId,
                categoryId: selectedCategory!,
                statusId: PotholeStatus.REPORTED,
                photoUrl,
                dateReported: null,
            };
            await api.post('/api/potholes/add', pothole);

            feedback.successMsg(config.successMessage);
            handleClose();
        } catch (error: unknown) {
            const errorMessage =
                error instanceof AxiosError
                    ? `Error: ${error.response?.data?.message ?? error.message}`
                    : config.errorMessage;
            feedback.errorMsg(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    }, [
        createLocation,
        reporterCitizen,
        existingCitizenId,
        createCitizen,
        photo.file,
        uploadPhoto,
        selectedCategory,
        feedback,
        config,
        handleClose,
    ]);

    const handleEditSubmit = useCallback(async () => {
        if (mode !== 'edit' || !props.pothole || !props.updateMutation) return;

        setIsSubmitting(true);

        try {
            let locationId = props.pothole.location?.locationId;
            let photoUrl = photo.existingUrl;

            // Create new location if changed
            if (hasLocationChanged(locationForm, props.pothole)) {
                locationId = await createLocation();
            }

            // Handle photo changes
            if (photo.markedForDeletion && photo.existingUrl) {
                await deletePhoto(photo.existingUrl);
                photoUrl = null;
            } else if (photo.file) {
                photoUrl = await uploadPhoto(photo.file);
            }

            const payload: PotholeUpdateDto = {
                reportByCitizenId: existingCitizenId,
                locationId,
                categoryId: selectedCategory!,
                photoUrl,
            };

            await props.updateMutation.mutateAsync(payload);

            feedback.successMsg(config.successMessage);
            handleClose();
        } catch (error: unknown) {
            const errorMessage =
                error instanceof AxiosError
                    ? error.response?.data?.message ?? config.errorMessage
                    : config.errorMessage;
            feedback.errorMsg(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    }, [
        mode,
        props,
        photo,
        locationForm,
        createLocation,
        deletePhoto,
        uploadPhoto,
        existingCitizenId,
        selectedCategory,
        feedback,
        config,
        handleClose,
    ]);

    const handleSubmit = mode === 'create' ? handleCreateSubmit : handleEditSubmit;

    // -------------------------------------------------------------------------
    // Render Helpers
    // -------------------------------------------------------------------------

    const citizenFieldsDisabled = isAutoFilled && existingCitizenId !== null;
    const showCitizenLookupHelpers = mode === 'create';

    const phoneHelperText = showCitizenLookupHelpers
        ? getPhoneHelperText(
            citizenLookup.isLoading,
            isAutoFilled,
            citizenLookupPhone !== undefined,
            !!citizenLookup.data
        )
        : undefined;

    const phoneHelperColor = showCitizenLookupHelpers
        ? getPhoneHelperColor(isAutoFilled, citizenLookupPhone !== undefined, !!citizenLookup.data)
        : undefined;

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    return (
        <Dialog open={open} onClose={handleClose} slotProps={{ paper: DIALOG_PAPER_PROPS }}>
            <DialogTitle>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h5">{config.title}</Typography>
                    <IconButton onClick={handleClose} aria-label="Cerrar diálogo">
                        <CloseRounded />
                    </IconButton>
                </Stack>
            </DialogTitle>

            <DialogContent sx={sx}>
                <DialogHeader
                    mode={mode}
                    newReportId={mode === 'create' ? props.newReportId : undefined}
                    pothole={mode === 'edit' ? props.pothole : undefined}
                    userName={userName}
                    date={today}
                />

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
                        {mode === 'create' && isAutoFilled && existingCitizenId && (
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
                                    slotProps={
                                        phoneHelperColor
                                            ? { formHelperText: { sx: { color: phoneHelperColor } } }
                                            : undefined
                                    }
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
                    <PhotoSection
                        mode={mode}
                        photo={photo}
                        onFileChange={handleFileChange}
                        onMarkForDeletion={handleMarkPhotoForDeletion}
                        previewUrl={filePreviewUrl}
                    />
                </Grid>

                {/* Confirmation Section (Create mode only) */}
                {mode === 'create' && (
                    <>
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
                    </>
                )}

                {mode === 'edit' && <Divider sx={{ mt: 4 }} />}

                <Button
                    variant="contained"
                    sx={{ mt: 2 }}
                    disabled={!readyToSubmit}
                    onClick={handleSubmit}
                    fullWidth
                >
                    <Typography variant="h6">
                        {isSubmitting || isPending ? config.submittingLabel : config.submitLabel}
                    </Typography>
                </Button>
            </DialogContent>
        </Dialog>
    );
}