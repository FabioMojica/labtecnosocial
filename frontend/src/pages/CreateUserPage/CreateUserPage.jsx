// 1. Librerías externas
import { useEffect, useRef, useState } from "react";
import { CreateUserInfoPanel } from "./components/CreateUserInfoPanel";


// 5. Servicios / UseCases
import { createUserApi } from "../../api";
import { Box, Divider, Typography } from "@mui/material";


// 6. Assets (imágenes, íconos)
// ninguno por ahora

// 7. Estilos
// ninguno por ahora

// 8. Tipos

export const CreateUserPage = () => {
    const headerRef = useRef(null);
    const [headerHeight, setHeaderHeight] = useState(0);

    useEffect(() => {
        if (!headerRef.current) return;

        const observer = new ResizeObserver(entries => {
            for (let entry of entries) {
                setHeaderHeight(entry.contentRect.height);
            }
        });

        observer.observe(headerRef.current);

        return () => observer.disconnect();
    }, []);
    
    return (
        <Box sx={{ p: 1 }}>
            <Box ref={headerRef}>
                <Typography
                    variant="h4"
                    fontWeight="bold"
                    sx={{
                        fontSize: {
                            xs: '1.5rem',
                            sm: '2rem'
                        },
                        width: { xs: '100%', sm: 'auto' },
                        textAlign: {
                            xs: 'center',
                            lg: 'left'
                        },
                    }}
                >
                    Registrar Nuevo Usuario
                </Typography>
                <Divider sx={{ mb: { xs: 2, lg: 1 } }} />
            </Box>

            {/* 🔹 ESTO SOLO CUANDO YA HAY MEDIDA */}
            {headerHeight > 0 && (
                <CreateUserInfoPanel panelHeight={headerHeight} />
            )}
        </Box>
    );
}; 