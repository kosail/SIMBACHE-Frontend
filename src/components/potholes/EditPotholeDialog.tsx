// src/components/potholes/EditPotholeDialog.tsx
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
    TextField,
    Typography,
} from '@mui/material';
import {CloseRounded, CloudUpload} from '@mui/icons-material';
import {ChangeEvent, useEffect, useMemo, useState} from 'react';
import {UseMutationResult} from '@tanstack/react-query';
import VisuallyHiddenInput from '../misc/VisuallyHiddenInput';
import {useGeoStates} from '../../hooks/geography/states/useGeoStates';
import {useMunicipalities} from '../../hooks/geography/municipalities/useMunicipalities';
import {useLocalities} from '../../hooks/geography/localities/useLocalities';
import {useStreetsPerLocality} from '../../hooks/geography/streets/useStreets';
import {Street} from '../../types/geography/Street';
import {
    useLocationsByZipCode,
    useZipCodeByLocation,
} from '../../hooks/geography/zipCodes/useZipCodeLookup';
import {PotholeResponseDto} from '../../types/pothole/PotholeResponseDto';
import {PotholeUpdateDto} from '../../types/pothole/PotholeUpdateDto';
import {Location} from '../../types/geography/Location';
import {FileUploadResponse} from '../../types/FileUploadResponse';
import {api} from '../../utils/api';
import {AxiosError} from 'axios';
import {useFeedbackStore} from '../../hooks/feedback/feedbackStore';
import {usePotholeCategories} from '../../hooks/potholes/usePotholeCategories';
import {PotholeCategory} from '../../types/pothole/PotholeCategory';

type PostalCodeSource = 'manual' | 'location';

interface EditPotholeDialogProps {
    open: boolean;
    onClose: () => void;
    pothole: PotholeResponseDto;
    updateMutation: UseMutationResult<PotholeResponseDto, unknown, PotholeUpdateDto>;
}

export default function EditPotholeDialog({
                                              open,
                                              onClose,
                                              pothole,
                                              updateMutation,
                                          }: EditPotholeDialogProps) {
    const feedback = useFeedbackStore();

    const [reportedByCitizen, setReportedByCitizen] = useState(Boolean(pothole.reporterCitizen));
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(pothole.photoUrl ?? null);

    const [selectedState, setSelectedState] = useState<number | null>(null);
    const [selectedMunicipality, setSelectedMunicipality] = useState<number | null>(null);
    const [selectedLocality, setSelectedLocality] = useState<number | null>(null);
    const [selectedStreet, setSelectedStreet] = useState<number | null>(null);
    const [selectedStreet1, setSelectedStreet1] = useState<number | null>(null);
    const [selectedStreet2, setSelectedStreet2] = useState<number | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

    const [postalCode, setPostalCode] = useState('');
    const [postalCodeSource, setPostalCodeSource] = useState<PostalCodeSource>('location');

    const [photoMarkedForDeletion, setPhotoMarkedForDeletion] = useState(false);

    const states = useGeoStates();
    const municipalities = useMunicipalities(selectedState ?? 0);
    const localities = useLocalities(selectedMunicipality ?? 0);
    const streetsPerLocality = useStreetsPerLocality(selectedLocality ?? 0);
    const categories = usePotholeCategories();

    const readyToSave = Boolean(
        selectedState &&
        selectedMunicipality &&
        selectedLocality &&
        selectedStreet &&
        selectedCategory,
    );

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
        if (!open) return;

        setReportedByCitizen(Boolean(pothole.reporterCitizen));
        setSelectedState(pothole.location.state.stateId);
        setSelectedMunicipality(pothole.location.municipality.municipalityId);
        setSelectedLocality(pothole.location.locality.localityId);
        setSelectedStreet(pothole.location.mainStreet.streetId ?? null);
        setSelectedStreet1(pothole.location.streetOne?.streetId ?? null);
        setSelectedStreet2(pothole.location.streetTwo?.streetId ?? null);
        setSelectedCategory(pothole.category.categoryId);
        setPostalCode(pothole.location.postalCode ? String(pothole.location.postalCode) : '');
        setPostalCodeSource('location');
        setExistingPhotoUrl(pothole.photoUrl ?? null);
        setSelectedFile(null);
        setPhotoMarkedForDeletion(false);

    }, [open, pothole]);

    const previewUrl = useMemo(() => {
        if (!selectedFile) return null;
        return URL.createObjectURL(selectedFile);
    }, [selectedFile]);

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const {data: reverseLookupData} = useZipCodeByLocation({
        stateId: selectedState ?? undefined,
        municipalityId: selectedMunicipality ?? undefined,
        localityId: selectedLocality ?? undefined,
        enabled: Boolean(selectedState && selectedMunicipality && selectedLocality),
    });

    useEffect(() => {
        if (reverseLookupData?.postalCode && postalCodeSource !== 'manual') {
            setPostalCode(String(reverseLookupData.postalCode));
            setPostalCodeSource('location');
        }
    }, [reverseLookupData, postalCodeSource]);

    const shouldLookupLocation = postalCodeSource === 'manual' && postalCode.length >= 5;
    const postalCodeNumber = shouldLookupLocation ? Number(postalCode) : undefined;

    const {data: locationsFromZip} = useLocationsByZipCode({
        postalCode: postalCodeNumber,
        enabled: Boolean(postalCodeNumber),
    });

    const extractFileName = (url: string) => {
        try {
            const parsed = new URL(url);
            return parsed.pathname.split('/').pop() ?? '';
        } catch {
            return url.split('/').pop() ?? '';
        }
    };

    useEffect(() => {
        if (!locationsFromZip?.length || postalCodeSource !== 'manual') return;

        const [match] = locationsFromZip;
        setSelectedState(match.stateId);
        setSelectedMunicipality(match.municipalityId);
        setSelectedLocality(match.localityId);
        resetStreetFields();
        setPostalCodeSource('location');
    }, [locationsFromZip, postalCodeSource]);

    const handleSave = async () => {
        if (!readyToSave || updateMutation.isPending) return;

        try {
            let photoUrl = existingPhotoUrl;
            let locationId = pothole.location.locationId;

            const locationChanged =
                selectedState !== pothole.location.state.stateId ||
                selectedMunicipality !== pothole.location.municipality.municipalityId ||
                selectedLocality !== pothole.location.locality.localityId ||
                selectedStreet !== (pothole.location.mainStreet.streetId ?? null) ||
                (selectedStreet1 ?? null) !== (pothole.location.streetOne?.streetId ?? null) ||
                (selectedStreet2 ?? null) !== (pothole.location.streetTwo?.streetId ?? null);

            if (locationChanged) {
                const locationDto: Location = {
                    stateId: selectedState!,
                    municipalityId: selectedMunicipality!,
                    localityId: selectedLocality!,
                    mainStreetId: selectedStreet!,
                    streetOneId: selectedStreet1,
                    streetTwoId: selectedStreet2,
                };

                const locationResponse = await api.post<bigint>('/api/geography/locations/add', locationDto);
                locationId = locationResponse.data;
            }

            if (photoMarkedForDeletion && existingPhotoUrl) {
                const filename = extractFileName(existingPhotoUrl);

                if (filename) {
                    await api.delete('/api/files/delete', {params: {filename}});
                }

                photoUrl = null;
            } else if (selectedFile) {
                const formData = new FormData();
                formData.append('file', selectedFile);

                const uploadResponse = await api.post<FileUploadResponse>(
                    '/api/files/upload/pothole-image',
                    formData,
                );
                photoUrl = uploadResponse.data.url;
            }

            const payload: PotholeUpdateDto = {
                reportByCitizenId: null, // TODO
                locationId,
                categoryId: selectedCategory!,
                photoUrl,
            };

            await updateMutation.mutateAsync(payload);

            feedback.successMsg('Bache actualizado correctamente.');
            onClose();
        } catch (error: unknown) {
            const defaultMessage = 'No se pudo actualizar el bache. Inténtalo de nuevo.';
            const axiosError = error as AxiosError<{message?: string}>;
            const message = axiosError?.response?.data?.message ?? defaultMessage;
            feedback.errorMsg(message);
        }
    };

    const photoToShow = previewUrl ?? (photoMarkedForDeletion ? null : existingPhotoUrl);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            slotProps={{
                paper: {sx: {width: 800, maxWidth: 800}},
            }}
        >
            <DialogTitle>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h5">Editar reporte de bache</Typography>
                    <IconButton onClick={onClose}>
                        <CloseRounded />
                    </IconButton>
                </Stack>
            </DialogTitle>

            <DialogContent>
                <Typography variant="body1">
                    <b>Folio:</b> {pothole.potholeId}
                </Typography>
                <Stack direction="row" justifyContent="space-between" sx={{pb: 2}}>
                    <Typography variant="body1">
                        <b>Registrado por:</b> {`${pothole.registeredByUser.firstName} ${pothole.registeredByUser.lastName}`}
                    </Typography>
                    <Typography variant="body1">
                        <b>Reportado el:</b> {new Date(pothole.dateReported).toLocaleString()}
                    </Typography>
                </Stack>

                <FormGroup>
                    <FormControlLabel
                        control={<Checkbox checked={reportedByCitizen} onChange={() => setReportedByCitizen(!reportedByCitizen)} />}
                        label="Es reporte de un ciudadano"
                    />
                </FormGroup>

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
                                value={postalCode}
                                onChange={handlePostalCodeChange}
                                inputProps={{inputMode: 'numeric', pattern: '[0-9]*', maxLength: 5}}
                            />
                        </FormControl>
                    </Grid>

                    <Grid size={12}>
                        <Typography variant="h6">Calles</Typography>
                    </Grid>

                    <Grid size={12}>
                        <FormControl fullWidth>
                            <InputLabel>Calle afectada</InputLabel>
                            <Select
                                label="Calle afectada"
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
                                label="Entre calle 1"
                                value={selectedStreet1 ?? ''}
                                onChange={(e) => setSelectedStreet1(e.target.value ? Number(e.target.value) : null)}
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
                                label="Entre calle 2"
                                value={selectedStreet2 ?? ''}
                                onChange={(e) => setSelectedStreet2(e.target.value ? Number(e.target.value) : null)}
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

                    <Grid size={12}>
                        <Divider />
                    </Grid>

                    <Grid size={4} sx={{alignSelf: 'center'}}>
                        <Typography variant="h6">Severidad</Typography>
                    </Grid>

                    <Grid size={8}>
                        <FormControl fullWidth>
                            <InputLabel>Categoría del bache</InputLabel>
                            <Select
                                label="Categoría del bache"
                                value={selectedCategory ?? ''}
                                onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
                            >
                                {categories?.data?.map((cat: PotholeCategory) => (
                                    <MenuItem key={cat.categoryId} value={cat.categoryId} title={cat.description}>
                                        {cat.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid size={12}>
                        <Typography variant="h6">Fotografía del bache</Typography>
                    </Grid>

                    <Grid
                        size={photoToShow ? 6 : 12}
                        sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}
                    >
                        <Button
                            component="label"
                            variant="contained"
                            tabIndex={-1}
                            startIcon={<CloudUpload />}
                            color="secondary"
                            fullWidth
                        >
                            {selectedFile ? 'Reemplazar fotografía' : 'Actualizar fotografía'}
                            <VisuallyHiddenInput
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0] ?? null;
                                    setSelectedFile(file);
                                    if (file) {
                                        setPhotoMarkedForDeletion(false);
                                    }
                                }}
                            />
                        </Button>

                        {existingPhotoUrl && !selectedFile && !photoMarkedForDeletion && (
                            <Button
                                variant="text"
                                color="error"
                                sx={{mt: 1.5}}
                                onClick={() => {
                                    setPhotoMarkedForDeletion(true);
                                    setSelectedFile(null);
                                }}
                                fullWidth
                            >
                                Eliminar fotografía
                            </Button>
                        )}
                        {photoMarkedForDeletion && (
                            <Typography variant="body1" color="error" sx={{mt: 2, textAlign: 'center'}}>
                                La imagen se eliminará al guardar los cambios.
                            </Typography>
                        )}

                        {selectedFile && (
                            <Typography variant="subtitle1" textAlign="center" sx={{pt: 2}}>
                                Nombre del archivo:<br /> {selectedFile.name}
                            </Typography>
                        )}
                    </Grid>

                    {photoToShow && (
                        <Grid size={6}>
                            <Box
                                component="img"
                                src={photoToShow}
                                sx={{
                                    width: '100%',
                                    height: 220,
                                    objectFit: 'cover',
                                    borderRadius: 2,
                                }}
                            />
                        </Grid>
                    )}
                </Grid>

                <Divider sx={{mt: 4}} />

                <Button
                    variant="contained"
                    sx={{mt: 2}}
                    disabled={!readyToSave || updateMutation.isPending}
                    onClick={handleSave}
                    fullWidth
                >
                    <Typography variant="h6">
                        {updateMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
                    </Typography>
                </Button>
            </DialogContent>
        </Dialog>
    );
}