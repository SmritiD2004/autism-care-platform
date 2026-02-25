import { useTheme } from "../contexts/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme, colors } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={{
        background: colors.bgElevated,
        border: `1px solid ${colors.borderSm}`,
        borderRadius: 8,
        width: 40,
        height: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        color: colors.text1,
        fontSize: 18,
        transition: "all 0.3s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = colors.bgCard;
        e.currentTarget.style.borderColor = colors.teal500;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = colors.bgElevated;
        e.currentTarget.style.borderColor = colors.borderSm;
      }}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
