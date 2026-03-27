import { DarkTheme, DefaultTheme, Theme } from "@react-navigation/native";

export const palette = {
  sand: "#F4E7D3",
  cream: "#FFF9F0",
  ink: "#13212E",
  slate: "#42586B",
  sky: "#D7E8F8",
  ocean: "#1E5F8B",
  mint: "#BDE4CE",
  success: "#167C5B",
  warning: "#C27712",
  danger: "#B63D2D",
  charcoal: "#09111A",
  charcoalSoft: "#13202B",
  smoke: "#8CA0B2",
  white: "#FFFFFF",
  shadow: "rgba(19, 33, 46, 0.12)"
} as const;

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  xxl: 36
} as const;

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  pill: 999
} as const;

export const lightTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: palette.cream,
    card: palette.white,
    border: "#E5D5BE",
    text: palette.ink,
    primary: palette.ocean,
    notification: palette.danger
  }
};

export const darkTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: palette.charcoal,
    card: palette.charcoalSoft,
    border: "#1D3245",
    text: palette.white,
    primary: "#68B5E3",
    notification: "#FF7E6D"
  }
};
