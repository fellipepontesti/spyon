import { desconectar, entrarSala, iniciarJogo } from "@/services/socket"
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image } from "react-native"
import { useEffect, useState } from "react"
import { socket } from "@/services/socket"
import { RoomDataDTO, RoomDTO } from "../dto/roomDTO"
import { Href, router } from "expo-router"
import { usePlayer } from "@/context/playerInfo"
import { darkTheme, lightTheme } from "@/styles/theme"
import { useTheme } from "@/context/themeContext"

export default function Room() {
  const [room, setRoom] = useState<RoomDataDTO>()
  const [erro, setErro] = useState('')
  const [owner, setOwner] = useState(false)
  const playerData = usePlayer()
  const { theme } = useTheme()
  const styles = theme === "dark" ? darkTheme : lightTheme

  useEffect(() => {
    socket.on("atualizarSala", (sala: RoomDataDTO) => {
      setRoom(sala)
    })

    socket.on("erro", (mensagem: string) => {
      setErro(mensagem)
    })

    socket.on("jogoIniciado", (sala: RoomDTO) => {
      router.replace({ pathname: "/mostrarFuncao", params: { data: JSON.stringify(sala) }});
    })

    return () => {
      socket.off("atualizarSala")
      socket.off("erro")
    }
  }, [])

  useEffect(() => {
    if (room?.socketIdOwner === socket.id) {
      setOwner(true)
    }
  }, [room])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sala: {room?.codigo || "?"}</Text>
      <Text style={styles.subtitle}>Bem-vindo, {playerData.nomeJogador || "Jogador"}!</Text>

      {erro ? <Text style={styles.error}>{erro}</Text> : null}

      <View style={styles.playersContainer}>
        <Text style={styles.playersTitle}>Jogadores na Sala:</Text>
        <FlatList
          data={room?.players || []}
          keyExtractor={(item) => item.name}
          numColumns={3}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => (
            <View style={styles.playerCard}>
              <Text style={styles.playerName}>{item.name}</Text>
            </View>
          )}
        />
      </View>

      <View style={styles.gameButtonContainer}>
        <TouchableOpacity
          style={styles.redButton}
          onPress={() => {
            desconectar(room!.codigo!)
            router.push('/home' as Href)
          }}
        >
          <Text style={styles.gameButtonText}>Sair da Sala</Text>
        </TouchableOpacity>

        {
          (owner) &&
          <TouchableOpacity
            style={[styles.greenButton]}
            onPress={() => {
              iniciarJogo(room!.codigo!)
            }}
          >
            <Text style={styles.gameButtonText}>Iniciar jogo</Text>
          </TouchableOpacity>
        }
      </View>
    </View>
  )
}
