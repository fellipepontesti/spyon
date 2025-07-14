import { useEffect, useState } from "react"
import { View, Text, Modal, TouchableOpacity } from "react-native"
import { useLocalSearchParams, router } from "expo-router"
import LottieView from "lottie-react-native"
import { darkTheme, lightTheme } from "@/styles/theme"
import { useTheme } from "@/context/themeContext"
import { useSala } from "@/context/salaContext"
import { entrarSala, socket, voltarPraSala } from "@/services/socket"
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
  const [esperandoDonoDaSala, setEsperandoDonoDaSala] = useState(false)
  const [salaLiberada, setSalaLiberada] = useState(false)
  const [redirecionar, setRedirecionar] = useState(false)

  const vencedor = params.vencedor === "espião" ? "espião" : "equipe"
  const mensagem = vencedor === "espião" ? "🎉 O Espião venceu!" : "🎉 A Equipe venceu!"

  const voltarPraSala = () => {
    socket.emit('voltarParaSala', {
      player,
      codigo: sala?.codigo
    })

    if (salaLiberada && socket.id !== sala?.socketIdOwner) {
      entrarSala(sala!.codigo, player)
    } else {
      setEsperandoDonoDaSala(true)
      setRedirecionar(true)
    }
  }

  useEffect(() => {
    const handleVoltarOwner = () => {
      entrarSala(sala!.codigo, player, undefined, true)
    }

    const handleLiberarSala = () => { setSalaLiberada(true) }

    const handleSalaEncontrada = (sala: RoomDataDTO) => {
      setSalaLiberada(false)
      setRedirecionar(false)
      setEsperandoDonoDaSala(false)
      setSala(sala)
      router.replace({ pathname: "/room", params: { data: JSON.stringify(sala) } })
    }
  
    socket.on("voltarOwner", handleVoltarOwner)
    socket.on("salaEncontrada", handleSalaEncontrada)
    socket.on("salaLiberada", handleLiberarSala)
    
    return () => {
      socket.off("voltarOwner", handleVoltarOwner)
      socket.off("salaLiberada", handleLiberarSala)
      socket.off("salaEncontrada", handleSalaEncontrada)
    }
  }, [])

  useEffect(() => {
    if (sala?.socketIdOwner !== socket.id && redirecionar) {
      entrarSala(sala!.codigo, player)
    }
  }, [salaLiberada])

  useEffect(() => {
    const intervalo = setInterval(() => {
      setTempo(prev => {
        if (prev === 1) {
          clearInterval(intervalo)
          setMostrarResultado(true)
          setTimeout(() => {
            setMostrarBotoes(true)
          }, 2000)
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
              onPress={() => voltarPraSala()}
            >
              <Text style={styles.buttonText}>Voltar pra sala</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.redButton}
              onPress={() => {
                router.replace("/home")
              }}
            >
              <Text style={styles.gameButtonText}>Sair do jogo</Text>
            </TouchableOpacity>

            <Text style={styles.title}>
              {esperandoDonoDaSala &&
                'Aguardando o dono abrir a sala...'}
            </Text>

            <Text style={styles.title}>
              {`Sala liberada: ${salaLiberada}, Redirecionar: ${redirecionar}, Esperando dono da sala: ${esperandoDonoDaSala}`}
            </Text>
          </>

        )}
      </View>
    </Modal>
  )
}
