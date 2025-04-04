import { criarSala, desconectar } from "@/services/socket"
import { StyleSheet, View, Button, Text, TouchableOpacity } from "react-native"
import { useEffect, useState } from "react"
import { socket } from "@/services/socket"
import { RoomDataDTO, RoomDTO } from "@/dto/roomDTO"
import { Href, router, useLocalSearchParams } from "expo-router"
import { usePlayer } from "@/context/playerInfo"
import { darkTheme, lightTheme } from "@/styles/theme"
import { useTheme } from "@/context/themeContext"

export default function Votacao() {
  const playerData = usePlayer()
  const { theme, mudarTema } = useTheme()
  const styles = theme === "dark" ? darkTheme : lightTheme
  const params = useLocalSearchParams();
  const sala: RoomDataDTO = params.data ? JSON.parse(params.data as string) : null;
  const begin = sala.players.find(jogador => jogador.socketId === socket.id)?.begin
  const nomeBegin = sala.players.find(jogador => jogador.begin)?.name
  const [mostrarMensagem, setMostrarMensagem] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setMostrarMensagem(false)
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>JOGO ROLANDO!</Text>

      {mostrarMensagem && (
        begin ?
          <Text style={styles.subtitle}>Você que inicia o jogo</Text> :
          <Text style={styles.subtitle}>O jogador {nomeBegin} vai iniciar o jogo! </Text>
        )
      }

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Abrir votação</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.redButton}
        onPress={() => {
          desconectar(sala.codigo)
          router.push('/home' as Href)
        }}
      >
        <Text style={[styles.buttonText, { color: "#FFF"}]}>Sair do jogo</Text>
      </TouchableOpacity>
    </View>
  )
}

