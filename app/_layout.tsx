import { PlayerProvider } from "@spyon/context/playerContext"
import { SalaProvider } from "@spyon/context/salaContext"
import { ThemeProvider } from "@spyon/context/themeContext"
import { VoiceProvider } from "@spyon/context/VoiceContext"
import { Stack } from "expo-router"

export default function Layout() {
  return (
    <ThemeProvider>
      <PlayerProvider>
        <SalaProvider>
          <VoiceProvider>
            <Stack screenOptions={{ headerShown: false, gestureEnabled: false }} />
          </VoiceProvider>
        </SalaProvider>
      </PlayerProvider>
    </ThemeProvider>
  )
}
