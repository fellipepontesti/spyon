import { abrirVotacao, desconectar } from "@/services/socket"
import { View, Text, TouchableOpacity, Modal } from "react-native"
import { useEffect, useState } from "react"
import { socket } from "@/services/socket"
import { RoomDataDTO } from "@/dto/roomDTO"
import { Href, router, useLocalSearchParams } from "expo-router"
import { darkTheme, lightTheme } from "@/styles/theme"
import { useTheme } from "@/context/themeContext"

export default function Game() {
  const { theme } = useTheme()
  const styles = theme === "dark" ? darkTheme : lightTheme
  const params = useLocalSearchParams();
  const sala: RoomDataDTO = params.data ? JSON.parse(params.data as string) : null;
  const begin = sala.players.find(jogador => jogador.socketId === socket.id)?.begin
  const nomeBegin = sala.players.find(jogador => jogador.begin)?.name

  const [mostrarMensagem, setMostrarMensagem] = useState(true)
  const [mostrarVotacao, setMostrarVotacao] = useState(false)
  const [tempoVotacao, setTempoVotacao] = useState(15)

  useEffect(() => {
    socket.on("aceitarVotacao", () => {
      setMostrarVotacao(true)
      setTempoVotacao(15)
    })
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setMostrarMensagem(false)
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (mostrarVotacao) {
      const intervalo = setInterval(() => {
        setTempoVotacao(prev => {
          if (prev <= 1) {
            clearInterval(intervalo)
            setMostrarVotacao(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(intervalo)
    }
  }, [mostrarVotacao])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>JOGO ROLANDO!</Text>

      {mostrarMensagem && (
        begin ?
          <Text style={styles.subtitle}>Você que inicia o jogo</Text> :
          <Text style={styles.subtitle}>O jogador {nomeBegin} vai iniciar o jogo!</Text>
      )}

      <TouchableOpacity style={styles.button} onPress={() => {
        abrirVotacao(sala.codigo)
      }}>
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

      <Modal transparent visible={mostrarVotacao} animationType="fade">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Votação iniciada!</Text>
          <Text style={styles.modalSubtitle}>Tempo restante: {tempoVotacao}s</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.acceptButton} onPress={() => setMostrarVotacao(false)}>
              <Text style={styles.buttonText}>Aceitar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.denyButton} onPress={() => setMostrarVotacao(false)}>
              <Text style={styles.buttonText}>Negar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}
