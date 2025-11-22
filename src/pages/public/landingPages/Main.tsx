import bgImage from "../../../assets/claudio_schwarz_pothole.webp";
import companyImage1 from '../../../assets/mediensturmer.webp';
import companyImage2 from '../../../assets/hector_emilio_gonzalez.webp';
import companyImage3 from '../../../assets/morgan_von_gunten.webp';
import {Box, Button, Paper, Stack, Typography} from "@mui/material";
import {
    AccessTimeRounded,
    AddLocationRounded,
    AddRoadRounded,
    type SvgIconComponent,
    VerifiedUserRounded
} from "@mui/icons-material";
import {Footer} from "../../../components/Footer.tsx";
import {useState} from "react";
import CitizenReport from "../../../components/CitizenReport.tsx";

type CardContentType = {
    Icon: SvgIconComponent;
    title: string;
    description: string;
};

const infoCards: CardContentType[] = [
    {
        Icon: AddLocationRounded,
        title: 'Reporta un bache',
        description: 'Utiliza nuestro mapa interactivo para localizar con precisión la ubicación exacta de los baches, lo que garantiza una notificación precisa y eficaz.'
    },
    {
        Icon: AccessTimeRounded,
        title: 'Rastrear un bache',
        description: 'Siga el progreso de las reparaciones de baches en tiempo real, desde el informe inicial hasta su finalización, con actualizaciones de estado.'
    },
    {
        Icon: VerifiedUserRounded,
        title: 'Seguridad vial',
        description: 'Nuestro sistema contribuye a mantener la seguridad vial al garantizar reparaciones oportunas y reducir los riesgos para todos.'
    }
];

type ContractorsCardContentType = {
    image: string;
    title: string;
    description: string;
};

const contractorsCards: ContractorsCardContentType[] = [
    {
        image: companyImage1,
        title: 'Aplica para ser un contratista',
        description: 'Las empresas constructoras pueden presentar fácilmente su solicitud a través de nuestro portal, lo que agiliza el proceso de incorporación.'
    },
    {
        image: companyImage2,
        title: 'Reportes simplificados',
        description: 'Los contratistas pueden enviar datos sobre las reparaciones realizadas, lo que permite llevar un registro preciso y transparente.'
    },
    {
        image: companyImage3,
        title: 'Flujos modernos y eficientes',
        description: 'Nuestro sistema ofrece un flujo de trabajo eficiente para nuestros contratistas, desde la recepción de las solicitudes hasta el envío de los trabajos realizados.'
    }
];

export default function Main() {
    const [showReportForm, setShowReportForm] = useState(false);

    return (
        <>
            // Sección de Hero, o la principal, pues
            <Box
                component={'section'}
                sx={{
                    height: 800,
                    width: '100%',
                    backgroundImage: `linear-gradient(to top, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.2) 100%), url(${bgImage});`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    color: "white",
                }}
            >
                <Typography
                    variant={'h2'}
                    fontWeight={700}
                    mb={4}
                >
                    Reparemos nuestra calles, juntos.
                </Typography>

                <Typography
                    variant={'h6'}
                    whiteSpace={'break-spaces'}
                >
                    Nuestra misión es mejorar la seguridad vial y la infraestructura.<br/>
                    Informa sobre baches, realiza un seguimiento de las reparaciones y contribuye a que los desplazamientos sean más fluidos y seguros para todos.<br/>
                    ¡Por una ciudad SIMBACHES!
                </Typography>

                <Button
                    variant={'contained'}
                    color={'secondary'}
                    sx={{ mt: 6 }}
                    onClick={() => setShowReportForm(true) }
                    disableRipple
                >
                    <Typography variant={'body1'} color={'white'} sx={{ p: 1, mt: 0.5 }}>Reportar un bache</Typography>
                    <AddRoadRounded sx={{ color: 'white' }}/>
                </Button>
            </Box>

            {/* Sección de las tarjetas */}
            <Box
                component={'section'}
                width={'100%'}
                sx={{
                    textAlign: 'center',
                    py: 10,
                    pb: 4
                }}
            >
                <Typography variant={'h4'} color={'textPrimary'} fontWeight={700} sx={{ mb: 3 }}>
                    ¿Cómo funciona?
                </Typography>

                <Typography variant={'h6'} color={'textDisabled'}  sx={{ mb: 4 }}>
                    Nuestro sistema agiliza la reparación de los baches. Para los ciudadanos, los contratistas y los funcionarios públicos.
                </Typography>

                <Stack direction={'row'} spacing={4} alignItems={'center'} justifyContent={'center'} flexWrap={'wrap'}>
                    { infoCards.map( (cardContent: CardContentType) => SimpleCard(cardContent) ) }
                </Stack>
            </Box>

            {/* Para contratistas */}
            <Box
                component={'section'}
                width={'100%'}
                sx={{ py: 10, pb: 4 }}
            >
                <Typography variant={'h4'} color={'textPrimary'} fontWeight={700} textAlign={'center'} sx={{ mb: 3 }}>
                    Para empresarios
                </Typography>

                <Typography variant={'h6'} color={'textDisabled'} textAlign={'center'}  sx={{ mb: 4 }}>
                    Si tienes una constructora, puedes aplicar para ser parte de nuestros contratistas.
                    Sin licitaciones, sin complicaciones.<br />Estarás ayudando a construir un México mejor.
                </Typography>

                <Stack direction={'row'} spacing={4} justifyContent={'center'} flexWrap={'wrap'}>
                    { contractorsCards.map((card: ContractorsCardContentType) => (
                        ImageCard(card)
                    )) }
                </Stack>
            </Box>

            <Footer />

            {showReportForm &&
              <CitizenReport open={showReportForm} onClose={() => setShowReportForm(false)} />
            }
        </>
    );
}

function SimpleCard({Icon, title, description}: CardContentType) {
    return (
        <Paper
            elevation={0}
            sx={{ width: {lg: 350, xl: 450}, py: 4, p: 4  }}
            key={title}
        >
            <Box sx={{ fontSize: 85 }} >
                <Icon
                    fontSize={'inherit'}
                    color={'primary'}
                    sx={{
                        backgroundColor: 'primary.light',
                        p: 2,
                        borderRadius: 10
                    }} />
            </Box>

            <Typography variant={'h5'} fontWeight={700} sx={{ mb: 2 }}>
                {title}
            </Typography>

            <Typography variant={'body1'}>
                {description}
            </Typography>
        </Paper>
    );
}

function ImageCard({image, title, description}: ContractorsCardContentType) {
    return (
        <Paper
            elevation={0}
            sx={{ width: {lg: 350, xl: 450}, borderRadius: 4, overflow: "hidden" }}
            key={title}
        >
            <Box
                component="img"
                src={image}
                alt={title}
                sx={{
                    width: "100%",
                    height: 250,
                    backgroundImage: image,
                    objectFit: 'cover',
                    objectPosition: 'center',
                    mb: 2
                }}
            />

            <Typography variant={'h5'} fontWeight={700} sx={{ mb: 2, px: 4 }}>
                {title}
            </Typography>

            <Typography variant={'body1'} sx={{ mb: 4, px: 4 }}>
                {description}
            </Typography>
        </Paper>
    );
}