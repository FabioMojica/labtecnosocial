// 1. Librerías externas
import { useState } from "react";
import { Box, Container, Typography, useTheme } from "@mui/material";

// 2. Hooks personalizados
import { useFetchAndLoad } from "../../hooks/useFetchAndLoad";
import { useAuthEffects } from "../../hooks";
import { useNotification } from "../../contexts";

// 3. Utilidades / helpers
import { validateEmail } from "../../utils";

// 4. Componentes 
import {
    ButtonWithLoader,
    BoxContainer,
    Image,
    TextFieldWithError,
    ThemeToggleButton,
    VolumenToggleButton
} from "../../generalComponents";

// 5. Servicios / UseCases
import { loginUserApi } from "../../api";


// 6. Assets (imágenes, íconos)
import logoLight from "../../assets/labTecnoSocialLogoLight.png"
import logoDark from "../../assets/labTecnoSocialLogoDark.png";

// 7. Estilos
import styles from './styles/LoginPage.module.css'


export const LoginPage = () => {
    const theme = useTheme();
    const { handleLogin } = useAuthEffects();
    const { notify } = useNotification();

    const logoToShow = theme.palette.mode === 'dark' ? logoDark : logoLight;

    const { loading, callEndpoint } = useFetchAndLoad();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({ email: "" });


    const handleClickLogin = async (e) => {
        e.preventDefault();

        const emailError = validateEmail(email);
        if (emailError) {
            setErrors({ email: emailError });
            return;
        }

        setErrors({ email: "" });

        try {
            const response = await callEndpoint(loginUserApi({ email, password }));
            handleLogin(response.accessToken, response.user);
        } catch (err) {
            notify(err?.message, "error");
        }
    };


    const isDisabled = !email.trim() || !password.trim() || !!validateEmail(email);

    return (
        <Container className={styles.loginPageContainer}>
            <Box className={styles.fixedTopRightButtons}>
                <VolumenToggleButton sizeIconButton="large" sizeButton="medium" />
                <ThemeToggleButton sizeIconButton="large" sizeButton="medium" />
            </Box>

            <BoxContainer className={styles.loginBoxContainer}>

                <Box className={styles.headerBoxContainer}>
                    <Typography variant="h4"
                        sx={{ color: theme => theme.palette.primary.principalText }}
                    >
                        Iniciar Sesión
                    </Typography>
                    <Image src={logoToShow} alt="Lab Tecno Social Logo" className={styles.logo} width={100} height={50} />
                    <Typography variant="body2"
                        sx={{ mb: 3, color: theme => theme.palette.primary.secondaryText }}
                    >
                        Bienvenido. Inicia sesión para continuar
                    </Typography>
                </Box>

                <Box className={styles.textFields}>
                    <TextFieldWithError
                        label="Email *"
                        maxLength={50}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        errorMessage={errors.email}
                        type="email"
                    />

                    <TextFieldWithError
                        label="Contraseña *"
                        maxLength={20}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                    />
                </Box>

                <ButtonWithLoader
                    triggerOnEnter
                    onClick={handleClickLogin}
                    loading={loading}
                    disabled={isDisabled}
                    variant="outlined"
                    fullWidth
                    className={styles.loginButton}
                >
                    <Typography variant="h6" sx={{ color: theme => theme.palette.primary.principalText }}>Iniciar sesión</Typography>
                </ButtonWithLoader>
            </BoxContainer>
        </Container>
        
    );
};
