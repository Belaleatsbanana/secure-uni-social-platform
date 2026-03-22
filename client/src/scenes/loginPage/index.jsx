import { Box, Typography, useTheme, useMediaQuery } from "@mui/material";
import Form from "./Form";

const LoginPage = () => {
  const theme = useTheme();
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");
  return (
    <Box>
      <Box
        width="100%"
        backgroundColor={theme.palette.background.alt}
        p="1rem 6%"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
      >
        <Box display="flex" alignItems="center" gap="0.75rem">
          <img
            src="/logo.jpeg"
            alt="logo"
            style={{ width: "150px", height: "150px", borderRadius: "8px" }}
          />
          <Typography fontWeight="bold" fontSize="32px">    <span style={{ color: "#1F4E79" }}>Safe</span>    <span style={{ color: "#3FA34D" }}>Campus</span>  </Typography></Box>
      </Box>

      <Box
        width={isNonMobileScreens ? "50%" : "93%"}
        p="2rem"
        m="2rem auto"
        borderRadius="1.5rem"
        backgroundColor={theme.palette.background.alt}
      >
        <Typography fontWeight="500" variant="h5" sx={{ mb: "1.5rem" }}>
          Welcome to SafeCampus, your secure social network for university life.
        </Typography>
        <Form />
      </Box>
    </Box>
  );
};

export default LoginPage;