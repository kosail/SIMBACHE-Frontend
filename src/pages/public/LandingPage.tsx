import {Box, Fade} from "@mui/material";
import Navbar from "../../components/Navbar.tsx";
import {useState} from "react";
import {AllLandingPages, type LandingPage} from './landingPages/AllLandingPages.ts'

export default function LandingPage() {
    const [page, setPage] = useState<LandingPage>(AllLandingPages[0]);
    const Content = page.Element;

    return (
            <Box position={'absolute'} width={'100vw'} maxWidth={'100%'} height={'100vh'} top={0} left={0}>
                <Navbar
                    activePage={page}
                    onPageChange={(page: LandingPage) => setPage(page)}
                />

                <Fade key={page.Element.name} in={true} timeout={250}>
                    <Box sx={{ height: 100 }}>
                        <Content />
                    </Box>
                </Fade>
            </Box>
    );
}