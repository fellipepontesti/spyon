import { useEffect, useState } from "react"
import { View, Text, Modal, TouchableOpacity } from "react-native"
import { useLocalSearchParams, router } from "expo-router"
import LottieView from "lottie-react-native"
import { darkTheme, lightTheme } from "@/styles/theme"
import { useTheme } from "@/context/themeContext"
import { useSala } from "@/context/salaContext"
import { socket, voltarPraSala } from "@/services/socket"
import { usePlayer } from "@/context/playerContext"
import { RoomDataDTO } from "@/dto/roomDTO"

export default function Vencedor() {
  const {player} = usePlayer()
  const { sala, setSala } = useSala()
  const params = useLocalSearchParams()
  const { theme } = useTheme()
  const styles = theme === 'dark' ? darkTheme : lightTheme
  const [tempo, setTempo] = useState(5)
  const [mostrarResultado, setMostrarResultado] = useState(false)
  const [mostrarBotoes, setMostrarBotoes] = useState(false)

  const vencedor = params.vencedor === "espião" ? "espião" : "equipe"
  const mensagem = vencedor === "espião" ? "🎉 O Espião venceu!" : "🎉 A Equipe venceu!"

  useEffect(() => {
    const handleSalaEncontrada = (sala: RoomDataDTO) => {
      console.log('---> novasala: ', sala)
      setSala(sala)
      router.replace({ pathname: "/room", params: { data: JSON.stringify(sala) } })
    }
  
    socket.on("salaEncontrada", handleSalaEncontrada)
  
    return () => {
      socket.off("salaEncontrada", handleSalaEncontrada)
    }
  }, [])

  useEffect(() => {
    const intervalo = setInterval(() => {
      setTempo(prev => {
        if (prev === 1) {
          clearInterval(intervalo)
          setMostrarResultado(true)
          setTimeout(() => {
            setMostrarBotoes(true)
          }, 8000)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(intervalo)
  }, [])

  return (
    <Modal visible transparent animationType="fade">
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        {mostrarResultado && (
          <LottieView
            source={require("@/assets/animations/fireworks.json")}
            autoPlay
            loop
            style={{ position: "absolute", width: "100%", height: "100%" }}
          />
        )}
        <Text style={styles.title}>
          {!mostrarResultado
            ? `Revelando resultado em ${tempo} ${tempo === 1 ? "segundo" : "segundos"}...`
            : mensagem}
        </Text>
        {mostrarResultado && mostrarBotoes && (
          <>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                voltarPraSala(sala!.codigo, player)
              }}
            >
              <Text style={styles.buttonText}>Voltar pro lobby</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.redButton}
              onPress={() => {
                router.replace("/home")
              }}
            >
              <Text style={styles.gameButtonText}>Sair do jogo</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </Modal>
  )
}
