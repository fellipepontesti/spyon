import { PlayerProvider } from "@/context/playerContext"
import { SalaProvider } from "@/context/salaContext"
import { ThemeProvider } from "@/context/themeContext"
import { Stack } from "expo-router"

export default function Layout() {
  return (
    <ThemeProvider>
      <PlayerProvider>
        <SalaProvider>
          <Stack screenOptions={{ headerShown: false, gestureEnabled: false }} />
        </SalaProvider>
      </PlayerProvider>
    </ThemeProvider>
  )
}
