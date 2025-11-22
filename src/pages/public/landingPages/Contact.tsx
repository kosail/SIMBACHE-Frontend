import {
    BusinessRounded,
    EmailRounded,
    ExpandMoreRounded,
    PhoneEnabledRounded,
    type SvgIconComponent
} from "@mui/icons-material";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Card,
    Grid,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import {Footer} from "../../../components/Footer.tsx";
import type {FormEvent} from "react";

type ContactFormTextFieldType = {
    title: string;
    placeholder: string,
    text: string,
    onTextChange: (e: any) => void,
    multiline?: boolean,
};

type FaqItemType = {
    question: string;
    answer: string;
};

type ContactMethodsType = {
    Icon: SvgIconComponent;
    title: string;
    description: string;
};

const contactMethods: ContactMethodsType[] = [
    {
        Icon: EmailRounded,
        title: 'Email',
        description: 'soporte@simbache.gov.mx',
    },
    {
        Icon: PhoneEnabledRounded,
        title: 'Teléfono',
        description: '+52 (844) 444-4444',
    },
    {
        Icon: BusinessRounded,
        title: 'Dirección',
        description: '123 Torre Metrópolis, Saltillo, Coahuila de Zaragoza. MX. 25000',
    },
];

const faqList: FaqItemType[] = [
    {
        question: '¿Cómo reporto un bache?',
        answer: 'Puedes reportar un bache desde nuestra página principal, haciendo click en el botón "Reportar un bache".\n\nLa página actual es solamente para contactos directos, no relacionados a nuevos reportes de baches. Aquí puedes, por ejemplo, solicitar informes del estatus de solicitudes previas.'
    },
    {
        question: '¿Qué sigue luego de hacer el reporte?',
        answer: 'Un inspector acudirá a revisar el bache en el lugar reportado, en no más de 72 horas. Luego se emitirá un veredicto al caso, que determinará el tiempo que tardará el bache en ser reparado.'
    },
    {
        question: '¿Cuánto tiempo tarda la reparación?',
        answer: 'Depende de la cantidad de baches en el area. En promedio, puede tardar de 1 a 3 meses debido a la cadena de responsabilidad entre el municipio y la constructora asignada a la reparación.\n\nNo obstante, el tiempo real está sujeto a cambios, dependiendo del material disponible, los contratistas y del trabajo realizado y por realizar.'
    }
];

export default function Contact() {
    return (
        <Stack direction={'column'}>
            <Grid container spacing={8} sx={{ mt: 8 }}>
                {/* Contenido del lado izquierdo */}
                <Grid size={6}>
                    <Box sx={{ p: 5}}>
                        <Typography variant={'h3'} fontWeight={700} color={'textPrimary'} sx={{mb: 2}}>
                            Contáctanos
                        </Typography>

                        <Typography variant={'body1'} color={'textDisabled'} sx={{mb: 4}}>
                            Estamos aquí para ayudarte. Si tienes alguna pregunta o sugerencia, o si buscas una oportunidad de colaboración, no dudes en contactarnos.
                        </Typography>

                        <Typography variant={'h5'} color={'textPrimary'} fontWeight={700} sx={{mb: 2}}>
                            Otras maneras de contactarnos
                        </Typography>

                        { contactMethods.map( card => ContactMethodCard(card) )}

                        <Typography variant={'h5'} color={'textPrimary'} fontWeight={700} sx={{mb: 2}}>
                            Preguntas frecuentes
                        </Typography>

                        <Stack direction={'column'} spacing={2} sx={{ mb: 2 }} flexWrap={'wrap'}>
                            {faqList.map((faqItem) => Faq(faqItem)) }
                        </Stack>
                    </Box>
                </Grid>

                {/* Contenido del lado derecho */}
                <Grid size={6}>
                    <Box sx={{ p: 8 }}>
                        <ContactForm />
                    </Box>
                </Grid>
            </Grid>

            <Footer />
        </Stack>

    );
}

function ContactMethodCard({Icon, title, description}: ContactMethodsType) {
    return (
        <Stack
            direction={'row'}
            spacing={2}
            sx={{ width: '100%', ml: 4 }}
            key={title}
            flexWrap={'wrap'}
        >
            <Box sx={{ fontSize: 50 }}>
                <Icon
                    fontSize={'inherit'}
                    color={'primary'}
                    sx={{
                        backgroundColor: 'primary.light',
                        p: 1,
                        borderRadius: 2,
                    }} />
            </Box>

            <Stack direction={'column'} spacing={0} flexWrap={'wrap'}>
                <Typography variant={'h6'} fontWeight={700} color={'textPrimary'}>{title}</Typography>
                <Typography variant={'body1'} color={'textDisabled'}>{description}</Typography>
            </Stack>
        </Stack>
    )
}


function ContactFormTextField({title, placeholder, text, onTextChange, multiline}: ContactFormTextFieldType) {
    const keyId: string = title.toLowerCase().replace(' ', '-');

    return (
        <>
            <Typography key={keyId} variant={'body1'} color={'textDisabled'}>{title}</Typography>

            <TextField
                key={`${keyId}-textfield`}
                variant={'outlined'}
                placeholder={placeholder}
                sx={{ mb: 4 }}
                onChange={onTextChange}
                slotProps={{
                    input: {
                        sx: {
                            borderRadius: 2
                        }
                    }
                }}
                required
                multiline={multiline}
            />
        </>
    );
}

async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
}

function ContactForm() {
    return (
        <Card
            component={'form'}
            onSubmit={handleSubmit}
            variant={'elevation'}
            elevation={2}
            sx={{ p: 4, width: '100%', boxShadow: '0 10px 20px 3px rgba(0,0,0,0.1)' }}
        >
            <Stack direction={'column'} flexWrap={'wrap'}>
                <ContactFormTextField
                    title={'Nombre'}
                    text={''}
                    placeholder={'Ingresa tu nombre'}
                    onTextChange={() => {}}
                />

                <ContactFormTextField
                    title={'Correo electrónico'}
                    text={''}
                    placeholder={'Ingresa tu correo'}
                    onTextChange={() => {}}
                />

                <ContactFormTextField
                    title={'Asunto o razón del contacto'}
                    text={''}
                    placeholder={'Ingresa el asunto'}
                    onTextChange={() => {}}
                />

                <ContactFormTextField
                    title={'Mensaje'}
                    text={''}
                    placeholder={'Escribe tu mensaje'}
                    onTextChange={() => {}}
                />

                <Button
                    variant={'contained'}
                    type={'submit'}
                    sx={{ mt: 4, width: '40%', alignSelf: 'self-end', borderRadius: 2, py: 2 }}
                >
                    <Typography variant={'body1'} color={'white'}>Enviar mensaje</Typography>
                </Button>
            </Stack>
        </Card>
    );
}

function Faq({question, answer}: FaqItemType) {
    const keyId: string = question.toLowerCase().replace(' ', '-');
    return (
        <Accordion key={keyId} elevation={0} sx={{ p: 1}}>
            <AccordionSummary
                expandIcon={<ExpandMoreRounded />}
            >
                <Typography variant={'body1'} fontWeight={600} color={'textPrimary'}>{question}</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Typography variant={'body1'} whiteSpace={'break-spaces'}>{answer}</Typography>
            </AccordionDetails>
        </Accordion>
    );
}