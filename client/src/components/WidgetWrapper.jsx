import { Box } from "@mui/material";
import { styled } from "@mui/system";

const WidgetWrapper = styled(Box)(({ theme }) => ({
  padding: "1.5rem",
  backgroundColor: theme.palette.background.alt,
  borderRadius: "1rem",

  /* 🔥 NEW DESIGN */
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
  border: "1px solid rgba(0, 0, 0, 0.04)",
  transition: "all 0.2s ease",

  "&:hover": {
    transform: "translateY(-3px)",
    boxShadow: "0 12px 28px rgba(0, 0, 0, 0.12)",
  },
}));

export default WidgetWrapper;