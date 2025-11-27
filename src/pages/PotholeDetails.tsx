import {Box, Button, CardActionArea, Divider, Grid, Paper, Stack, Typography} from "@mui/material";
import {useParams} from "react-router-dom";
import CustomCard from "../components/misc/CustomCard.tsx";
import {useSinglePothole} from "../hooks/potholes/usePotholes.ts";
import Loading from "../components/Loading.tsx";
import {useNavigate} from "react-router-dom";
import {PotholeResponseDto} from "../types/pothole/PotholeResponseDto.ts";
import ImagePreviewer from "../components/potholes/ImagePreviewer.tsx";
import {useState} from "react";
import useAuth from "../hooks/auth/useAuth.ts";
import {formatPhoneNumber} from "../utils/SimplePhoneNumberFormat.ts";
import DeletePotholeDialog from "../components/potholes/DeletePotholeDialog.tsx";
import {EditRounded, DeleteRounded} from "@mui/icons-material";
import EditPotholeDialog from "../components/potholes/EditPotholeDialog.tsx";

export default function PotholeDetails() {
    const {id} = useParams();
    if (!id) return null;

    const {loginData: user} = useAuth();
    const navigate = useNavigate();
    const query = useSinglePothole(parseInt(id));

    const [isFullScreen, setIsFullScreen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    if (query.isLoading && !query.data) return <Loading />;

    const pothole: PotholeResponseDto = query.data!;

    return (
        <Stack direction={'column'} spacing={2} sx={{ p: 4 }}>
            <Box sx={{ width: '100%', pb: 4 }}>
                <Button variant={'text'} onClick={() => navigate(-1)}>
                    <Typography variant={'h6'} sx={{ color: 'primary.main' }}>Regresar</Typography>
                </Button>
            </Box>

            <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
                <Typography variant="h4" sx={{ mb: 2 }} gutterBottom>Reporte de bache #{id}</Typography>
                { user!.admin && (
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant={'contained'}
                            color={'info'}
                            startIcon={<EditRounded />}
                            onClick={() => setEditDialogOpen(true) }
                            disabled={query.updatePothole.isPending}
                        >
                            Editar
                        </Button>

                        <Button
                            variant={'contained'}
                            color={"error"}
                            startIcon={<DeleteRounded />}
                            onClick={() => setDeleteDialogOpen(true) }
                        >
                            Eliminar
                        </Button>
                    </Box>
                )}
            </Stack>

            {user!.admin && pothole && (
                <DeletePotholeDialog
                    open={deleteDialogOpen}
                    onClose={() => setDeleteDialogOpen(false)}
                    id={pothole.potholeId}
                />
            )}


            {user!.admin && pothole && (
                <EditPotholeDialog
                    open={editDialogOpen}
                    onClose={() => setEditDialogOpen(false)}
                    pothole={pothole}
                    updateMutation={query.updatePothole}
                />
            )}

            { pothole.photoUrl && (
                <>
                    <CustomCard padding={0} sx={{ height: 400 }}>
                        <CardActionArea
                            sx={{
                                height: '100%',
                                '&:hover .overlay': {
                                    opacity: 1,
                                }
                            }}
                            onClick={() => setIsFullScreen(true)}
                        >
                            <Box
                                component={'img'}
                                src={pothole.photoUrl}
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    objectPosition: 'center',
                                    borderRadius: 2
                                }}
                            />
                            {/* Hover Overlay */}
                            <Box
                                className="overlay"
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: 2,
                                    opacity: 0,
                                    transition: 'opacity 0.3s ease-in-out',
                                }}
                            >
                                <Typography
                                    variant="h6"
                                    color="white"
                                    sx={{
                                        fontWeight: 'bold',
                                        textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                                    }}
                                >
                                    Abrir fotografia en pantalla completa
                                </Typography>
                            </Box>
                        </CardActionArea>
                    </CustomCard>
                    <ImagePreviewer open={isFullScreen} onClose={() => setIsFullScreen(false)} photoUrl={pothole.photoUrl} />
                </>
            )}

            <CustomCard>
                <Typography
                    variant="h5"
                    gutterBottom
                    sx={{ mb: 2 }}
                >
                    Informacion del reporte
                </Typography>

                <Grid container spacing={3}>
                    {/*  First row  */}
                    <Grid size={4}>
                        <Typography variant="h6" gutterBottom>Registrado por:</Typography>
                        <Typography variant="body1">{`${pothole.registeredByUser.firstName} ${pothole.registeredByUser.lastName}`}</Typography>
                        <Typography variant="subtitle1">{pothole.registeredByUser.roleName}</Typography>
                    </Grid>

                    <Grid size={4}>
                        <Typography variant="h6" gutterBottom>Reporte ciudadano:</Typography>
                        { pothole.reporterCitizen ?
                            (
                                <Paper>
                                    <Typography variant="body1">{`${pothole.reporterCitizen.firstName} ${pothole.reporterCitizen.lastName}`}</Typography>
                                    <Typography variant="body1">{pothole.reporterCitizen.email}</Typography>
                                    <Typography variant="body1">{formatPhoneNumber(pothole.reporterCitizen.phoneNumber)}</Typography>
                                </Paper>
                            ) :
                            (
                                <Typography variant="body1">NO</Typography>
                            )
                        }
                    </Grid>

                    <Grid size={4}>
                        <Typography variant="h6" gutterBottom>Fecha de reporte:</Typography>
                        <Typography variant="body1">{new Date(pothole.dateReported).toLocaleString()}</Typography>
                    </Grid>

                    <Grid size={4}>
                        <Typography variant="h6" gutterBottom>Categoria:</Typography>
                        <Typography variant="body1">{pothole.category.categoryName}</Typography>
                    </Grid>

                    <Grid size={8}>
                        <Typography variant="h6" gutterBottom>Notas:</Typography>
                        <Typography variant="body1">{pothole.category.description}</Typography>
                    </Grid>

                    <Grid size={12}>
                        <Divider />
                    </Grid>

                    <Grid size={4}>
                        <Typography variant="h6" gutterBottom>Localidad:</Typography>
                        <Typography variant="body1">{pothole.location.locality.localityName}</Typography>
                    </Grid>

                    <Grid size={4}>
                        <Typography variant="h6" gutterBottom>Municipio:</Typography>
                        <Typography variant="body1">{pothole.location.municipality.municipalityName}</Typography>
                    </Grid>

                    <Grid size={4}>
                        <Typography variant="h6" gutterBottom>Estado:</Typography>
                        <Typography variant="body1">{pothole.location.state.stateName}</Typography>
                    </Grid>

                    <Grid size={8}>
                        <Typography variant="h6" gutterBottom>Ubicación o calle:</Typography>
                        <Typography variant="body1">
                            <FormatStreetLocation
                                mainStreetName={pothole.location.mainStreet.streetName}
                                streetOneName={pothole.location.streetOne?.streetName}
                                streetTwoName={pothole.location.streetTwo?.streetName}
                            />
                        </Typography>
                    </Grid>

                    <Grid size={4}>
                        <Typography variant="h6" gutterBottom>Código postal:</Typography>
                        <Typography variant="body1">{pothole.location.postalCode}</Typography>
                    </Grid>

                    <Grid size={12}>
                        <Divider />
                    </Grid>

                    <Grid size={4}>
                        <Typography variant="h6" gutterBottom>Estatus:</Typography>
                        <Typography variant="body1">{pothole.status}</Typography>
                    </Grid>

                    <Grid size={4}>
                        <Typography variant="h6" gutterBottom>Fecha de validación:</Typography>
                        <Typography variant="body1">{
                            pothole.dateValidated ?
                                new Date(pothole.dateValidated).toLocaleString() :
                                "PENDIENTE DE INSPECCIÓN"
                        }</Typography>
                    </Grid>

                    <Grid size={4}>
                        <Typography variant="h6" gutterBottom>Fecha resuelto:</Typography>
                        <Typography variant="body1">{
                            pothole.dateClosed ?
                                new Date(pothole.dateClosed).toLocaleString() :
                                "PENDIENTE DE REPARACIÓN"
                        }</Typography>
                    </Grid>
                </Grid>
            </CustomCard>

            <CustomCard>
                <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>Inspecciones</Typography>
                <Typography variant="body1" sx={{ pb: 2 }}>Este bache todavía no ha sido validado por un inspector.</Typography>

                <Button
                    variant={'contained'}
                    color={'info'}
                    // onClick={() => navigate(`/secure/potholes/${id}/inspect`)}
                >
                    <Typography variant={'body1'}>Registrar inspección</Typography>
                </Button>
            </CustomCard>

        </Stack>
    );
}

function FormatStreetLocation({
                                  mainStreetName,
                                  streetOneName,
                                  streetTwoName
                              }: {
    mainStreetName: string;
    streetOneName: string | null | undefined;
    streetTwoName: string | null | undefined;
}) {
    // Only main street
    if (!streetOneName && !streetTwoName) {
        return <>En <b>{mainStreetName}</b>.</>;
    }

    // Main street and street one
    if (streetOneName && !streetTwoName) {
        return <>En <b>{mainStreetName}</b>, cerca de <b>{streetOneName}</b>.</>;
    }

    // Main street and street two (but no street one)
    if (!streetOneName && streetTwoName) {
        return <>En <b>{mainStreetName}</b>, cerca de <b>{streetTwoName}</b>.</>;
    }

    // All three streets
    if (streetOneName && streetTwoName) {
        return <>En <b>{mainStreetName}</b>, entre <b>{streetOneName}</b> y <b>{streetTwoName}</b>.</>;
    }

    return <>En <b>{mainStreetName}</b>.</>;
}