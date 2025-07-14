import {
  pedirDiscussao,
  aceitarDiscussao,
  recusarDiscussao,
  desconectar,
  socket
} from "@/services/socket"
import { View, Text, TouchableOpacity, Modal } from "react-native"
import { useEffect, useState } from "react"
import { Href, router, useLocalSearchParams } from "expo-router"
import { darkTheme, lightTheme } from "@/styles/theme"
import { useTheme } from "@/context/themeContext"
import { useSala } from "@/context/salaContext"

export default function Game() {
  const { theme } = useTheme()
  const styles = theme === "dark" ? darkTheme : lightTheme
  const { sala, solicitarSala } = useSala()

  const params = useLocalSearchParams()
  const codigo: string = params.codigo ? params.codigo as string : ''
  const votacao: boolean = params.votacao === 'true'

  const [message, setMessage] = useState('')
  const [mostrarMensagem, setMostrarMensagem] = useState(true)
  const [modalDiscussao, setModalDiscussao] = useState(false)
  const [tempoDiscussao, setTempoDiscussao] = useState(15)
  const [respondeuDiscussao, setRespondeuDiscussao] = useState(false)


  useEffect(() => {
    if (codigo) {
      solicitarSala(codigo)
    }
  }, [codigo])

  useEffect(() => {
    const timer = setTimeout(() => {
      setMostrarMensagem(false)
    }, 5000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    setMessage(params.message as string)
    const timer = setTimeout(() => {
      setMessage('')
    }, 8000)
    return () => clearTimeout(timer)
  }, [params.message])

  useEffect(() => {
    if (modalDiscussao) {
      const intervalo = setInterval(() => {
        setTempoDiscussao(prev => {
          if (prev <= 1) {
            clearInterval(intervalo)
            setModalDiscussao(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(intervalo)
    }
  }, [modalDiscussao])

  useEffect(() => {
    const handleNovaDiscussao = () => {
      setModalDiscussao(true)
      setTempoDiscussao(15)
      setRespondeuDiscussao(false)

      setTimeout(() => {
        if (!respondeuDiscussao && sala) {
          recusarDiscussao(sala.codigo)
        }
        setModalDiscussao(false)
      }, 15000)
    }

    const handleDiscussaoAprovada = () => {
      if (sala) {
        router.replace("/votacao")
      }
    }

    socket.on("novaSolicitacaoDiscussao", handleNovaDiscussao)
    socket.on("mudarParaVotacao", handleDiscussaoAprovada)

    return () => {
      socket.off("novaSolicitacaoDiscussao", handleNovaDiscussao)
      socket.off("mudarParaVotacao", handleDiscussaoAprovada)
    }
  }, [respondeuDiscussao, sala])

  if (!sala) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Carregando sala...</Text>
      </View>
    )
  }

  const inicia = sala.players.find(jogador => jogador.socketId === socket.id)?.inicia
  const nomeInicia = sala.players.find(jogador => jogador.inicia)?.nome

  return (
    <View style={styles.container}>
      <Text style={styles.title}>JOGO ROLANDO!</Text>

      <Text style={styles.title}>Quantidade de chances: {sala.quantidadeDeVotacoes - sala.tentativas}</Text>

      {(mostrarMensagem && !votacao && !message) && (
        inicia ?
          <Text style={styles.subtitle}>Você que inicia o jogo</Text> :
          <Text style={styles.subtitle}>O jogador {nomeInicia} vai iniciar o jogo!</Text>
      )}

      {message &&
        <Text style={styles.subtitle}>{message}</Text>
      }

      <TouchableOpacity style={styles.button} onPress={() => pedirDiscussao(sala.codigo)}>
        <Text style={styles.buttonText}>Pedir votação</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.redButton}
        onPress={() => {
          desconectar(sala.codigo)
          router.replace('/home' as Href)
        }}
      >
        <Text style={[styles.buttonText, { color: "#FFF"}]}>Sair do jogo</Text>
      </TouchableOpacity>

      <Modal transparent visible={modalDiscussao} animationType="fade">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Discussão iniciada!</Text>
          <Text style={styles.modalSubtitle}>Tempo restante: {tempoDiscussao}s</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.acceptButton} onPress={() => {
              aceitarDiscussao(sala.codigo)
              setModalDiscussao(false)
              setRespondeuDiscussao(true)
            }}>
              <Text style={styles.buttonText}>Aceitar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.denyButton} onPress={() => {
              recusarDiscussao(sala.codigo)
              setModalDiscussao(false)
              setRespondeuDiscussao(true)
            }}>
              <Text style={styles.buttonText}>Negar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}
