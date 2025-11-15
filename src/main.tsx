import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import App from './App.tsx'

import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {ReactQueryDevtools} from "@tanstack/react-query-devtools";
import {ThemeContextProvider} from "./theme/ThemeProvider.tsx";
import {AuthProvider} from "./auth/AuthProvider.tsx";

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ThemeContextProvider>
            <AuthProvider>
                <QueryClientProvider client={queryClient}>
                    <App />
                    <ReactQueryDevtools initialIsOpen={false} />
                </QueryClientProvider>
            </AuthProvider>
        </ThemeContextProvider>
    </StrictMode>
)
