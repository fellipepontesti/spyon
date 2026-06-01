import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { useEffect, useState } from "react"
import { FontAwesome } from "@expo/vector-icons"
import { socket } from "@spyon/services/socket"
import { Href, router } from "expo-router"
import { usePlayer } from "@spyon/context/playerContext"
import { useTheme } from "@spyon/context/themeContext"
import { darkTheme, lightTheme } from "@spyon/styles/theme"
import { useUserStore } from "@spyon/store/useUserStore"

export default function Home() {
  const { player } = usePlayer()
  const [conectado, setConectado] = useState(false)
  const { theme, mudarTema } = useTheme()
  const styles = theme === "dark" ? darkTheme : lightTheme
  const localStyles = createLocalStyles(theme)

  const logout = useUserStore((state) => state.logout)
  const tipoLogin = useUserStore((state) => state.tipoLogin)
  const vitorias = useUserStore((state) => state.vitorias)

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
      <View style={localStyles.header}>
        <Text style={styles.title}>Olá, {player.nome}</Text>
        {tipoLogin && (
          <View style={[localStyles.badge, tipoLogin === "google" ? localStyles.badgeGoogle : localStyles.badgeGuest]}>
            <FontAwesome
              name={tipoLogin === "google" ? "google" : "user"}
              size={11}
              color={tipoLogin === "google" ? "#000" : "#FFF"}
              style={{ marginRight: 4 }}
            />
            <Text style={[localStyles.badgeText, tipoLogin === "google" ? { color: "#000" } : { color: "#FFF" }]}>
              {tipoLogin === "google" ? "Google" : "Convidado"}
            </Text>
          </View>
        )}
      </View>

      {tipoLogin === "google" && (
        <Text style={localStyles.winsText}>🏆 Vitórias acumuladas: {vitorias}</Text>
      )}

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

      <TouchableOpacity
        onPress={() => router.push("/amigos" as Href)}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Amigos</Text>
      </TouchableOpacity>

      {__DEV__ && (
        <TouchableOpacity
          onPress={() => {
            router.replace({ pathname: "/vencedor", params: {
              codigo: 'xsdasd', vencedor: 'equipe'
            } })
          }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Simular vencedor</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.redButton}
        onPress={() => {
          logout()
          router.replace("/" as Href)
        }}
      >
        <Text style={[styles.buttonText, { color: "#FFF" }]}>Sair da Conta</Text>
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

const createLocalStyles = (theme: "light" | "dark") => {
  const isDark = theme === "dark"
  const border = isDark ? "#294032" : "#D4E2D7"
  const text = isDark ? "#F4F7F2" : "#101A13"
  const muted = isDark ? "#B7C4BA" : "#526257"

  return StyleSheet.create({
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      marginBottom: 6,
    },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 12,
      borderWidth: 1,
    },
    badgeGoogle: {
      backgroundColor: "#FFFFFF",
      borderColor: "#D4E2D7",
    },
    badgeGuest: {
      backgroundColor: "#68736B",
      borderColor: "#68736B",
    },
    badgeText: {
      fontSize: 11,
      fontWeight: "700",
    },
    winsText: {
      color: "#D4A373",
      fontSize: 14,
      fontWeight: "700",
      marginBottom: 12,
      textAlign: "center",
    },
  })
}
