import { desconectar, iniciarJogo } from "@/services/socket"
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native"
import { useEffect, useLayoutEffect, useState } from "react"
import { socket } from "@/services/socket"
import { Href, router, useNavigation } from "expo-router"
import { usePlayer } from "@/context/playerContext"
import { darkTheme, lightTheme } from "@/styles/theme"
import { useTheme } from "@/context/themeContext"
import { useSala } from "@/context/salaContext"

export default function Room() {
  const { sala } = useSala()
  const [erro, setErro] = useState('')
  const [owner, setOwner] = useState(false)

  const { player } = usePlayer()
  const { theme } = useTheme()
  const styles = theme === "dark" ? darkTheme : lightTheme

  useEffect(() => {
    socket.on("erro", (mensagem: string) => {
      setErro(mensagem)
    })

    return () => {
      socket.off("erro")
    }

  }, [])

  useEffect(() => {
    if (sala?.socketIdOwner === socket.id) {
      setOwner(true)
    }
  }, [sala])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sala: {sala?.codigo || "?"}</Text>
      <Text style={styles.subtitle}>Bem-vindo, {player.nome || "Jogador"}!</Text>

      {erro ? <Text style={styles.error}>{erro}</Text> : null}

      <View style={styles.playersContainer}>
        <Text style={styles.playersTitle}>Jogadores na Sala:</Text>
        <FlatList
          data={sala?.players || []}
          keyExtractor={(item) => item.nome}
          numColumns={3}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => (
            <View style={styles.playerCard}>
              <Text style={styles.playerName}>{item.nome}</Text>
            </View>
          )}
        />
      </View>

      <View style={styles.gameButtonContainer}>
        <TouchableOpacity
          style={styles.redButton}
          onPress={() => {
            if (sala?.codigo) {
              desconectar(sala.codigo)
            }
            router.push('/home' as Href)
          }}
        >
          <Text style={styles.gameButtonText}>Sair da Sala</Text>
        </TouchableOpacity>

        {owner && (
          <TouchableOpacity
            style={styles.greenButton}
            onPress={() => {
              if (sala?.codigo) {
                iniciarJogo(sala.codigo)
              }
            }}
          >
            <Text style={styles.gameButtonText}>Iniciar jogo</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}
