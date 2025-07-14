import { View, Text, TouchableOpacity } from "react-native"
import { useEffect, useState } from "react"
import { FontAwesome } from "@expo/vector-icons"
import { socket } from "@/services/socket"
import { Href, router } from "expo-router"
import { usePlayer } from "@/context/playerContext"
import { useTheme } from "@/context/themeContext"
import { darkTheme, lightTheme } from "@/styles/theme"

export default function Home() {
  const { player } = usePlayer()
  const [conectado, setConectado] = useState(false)
  const { theme, mudarTema } = useTheme()
  const styles = theme === "dark" ? darkTheme : lightTheme

  useEffect(() => {
    const atualizarStatus = () => {
      setConectado(socket.connected)
    }

    socket.on("connect", atualizarStatus)
    socket.on("disconnect", atualizarStatus)

    atualizarStatus()

    return () => {
      socket.off("connect", atualizarStatus)
      socket.off("disconnect", atualizarStatus)
    }
  }, [])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Olá {player.nome}</Text>

      <Text style={[styles.status, conectado ? styles.online : styles.offline]}>
        {conectado ? "Conectado ao servidor" : "Desconectado"}
      </Text>

      <TouchableOpacity
        onPress={() => router.push("/criacaoSala" as Href)}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Criar sala</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push("/buscarSala" as Href)}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Buscar jogo</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          socket.emit('listarSalas', {page: 1})
          router.replace("/listaDeSalas" as Href)
        }}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Lista de salas</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.themeButton} onPress={mudarTema}>
        <FontAwesome
          name={theme === "dark" ? "sun-o" : "moon-o"}
          style={styles.themeIcon}
        />
      </TouchableOpacity>
    </View>
  )
}