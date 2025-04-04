import { PlayerProvider } from "@/context/playerInfo"
import { ThemeProvider } from "@/context/themeContext"
import { Stack } from "expo-router"

export default function Layout() {
  return (
    <ThemeProvider>
      <PlayerProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </PlayerProvider>
    </ThemeProvider>
  )
}
