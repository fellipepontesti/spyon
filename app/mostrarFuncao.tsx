import { useEffect, useState } from "react"
import { View, Text, Modal, ActivityIndicator, Image } from "react-native"
import { useRouter } from "expo-router"
import { useLocalSearchParams } from "expo-router"
import { socket } from "@spyon/services/socket"
import { RoomDataDTO } from "@spyon/dto/roomDTO"
import { useTheme } from "@spyon/context/themeContext"
import { darkTheme, lightTheme } from "@spyon/styles/theme"
import images from "@spyon/helpers/images"
import { setMessageFuncao } from "@spyon/helpers/mostrarFuncao"
import { FuncaoDTO } from "@spyon/dto/playerDTO"

export default function MostrarFuncao() {
  const router = useRouter()
  const [espiao, setEspiao] = useState(false)
  const [lugar, setLugar] = useState('')
  const [visible, setVisible] = useState(true)
  const [tempoRestante, setTempoRestante] = useState(5)
  const params = useLocalSearchParams()
  const { theme } = useTheme()
  const styles = theme === "dark" ?  darkTheme : lightTheme

  const sala: RoomDataDTO = params.data ? JSON.parse(params.data as string) : null

  useEffect(() => {
    if (sala) {
      const jogador = sala.players.find(player => player.socketId === socket.id)
      if (jogador?.funcao === FuncaoDTO.ESPIAO) {
        setEspiao(true)
        setLugar('0')
      } else {
        setLugar(jogador?.lugar?.toString() || '0')
      }
    }
  
    const interval = setInterval(() => {
      setTempoRestante(prev => {
        if (prev == 1) {
          clearInterval(interval)
          setVisible(false)
          setTimeout(() => {
            router.replace({ pathname: "/game", params: { codigo: sala.codigo } })
          }, 0)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  
    return () => clearInterval(interval)
  }, [sala])

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.container}>
        <Image 
          style={styles.smallImage}
          source={images[lugar]}
        />
        <Text style={styles.title}>
          {espiao ? "Você é o Espião! 🤫" : setMessageFuncao(lugar)}
        </Text>
        <Text style={styles.subtitle}>
          O jogo começará em {tempoRestante} {tempoRestante === 1 ? "segundo" : "segundos"}...
        </Text>
        <ActivityIndicator size="large" color="#000" />
      </View>
    </Modal>
  )
}
