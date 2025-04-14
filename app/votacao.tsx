import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from "react-native"
import { useEffect, useState } from "react"
import { socket } from "@/services/socket"
import { router, useLocalSearchParams } from "expo-router"
import { darkTheme, lightTheme } from "@/styles/theme"
import { useTheme } from "@/context/themeContext"
import { PlayerDTO } from "@/dto/playerDTO"
import { useSala } from "@/context/salaContext"

export default function Votacao() {
  const { theme } = useTheme()
  const styles = theme === "dark" ? darkTheme : lightTheme
  const { sala } = useSala()
  const [acusado, setAcusado] = useState<PlayerDTO>()
  const [mostrarMensagem, setMostrarMensagem] = useState(true)
  const [votoConfirmado, setVotoConfirmado] = useState(false)
  const [tempoRestante, setTempoRestante] = useState(120)

  useEffect(() => {
    socket.on("aguardandoResultado", () => {
      router.replace({ pathname: "/resultadoVotacao", params: { codigo: sala?.codigo } })
    })

    return () => {
      socket.off("aguardandoResultado")
    }
  }, [])

  useEffect(() => {
    const intervalo = setInterval(() => {
      setTempoRestante(prev => {
        if (prev <= 1) {
          clearInterval(intervalo)
          if (!votoConfirmado) {
            socket.emit('confirmarVoto', {
              codigo: sala?.codigo,
              socketAcusador: socket.id,
              skip: true
            })
            setVotoConfirmado(true)
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(intervalo)
  }, [sala, acusado, votoConfirmado])

  const formatarTempo = (segundos: number) => {
    const min = Math.floor(segundos / 60)
    const sec = segundos % 60
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  const jogadoresDisponiveis = sala?.players?.filter(p => p.socketId !== socket.id) || []

  return (
    <View style={styles.container}>
      {!votoConfirmado ? (
        <>
          <Text style={styles.title}>Sala de votação!</Text>
          <Text style={styles.playersTitle}>Tempo restante: {formatarTempo(tempoRestante)}</Text>

          <View style={styles.playersContainer}>
            <Text style={styles.playersTitle}>Escolha seu suspeito:</Text>
            <FlatList
              scrollEnabled={false}
              data={jogadoresDisponiveis}
              keyExtractor={(item) => item.socketId}
              numColumns={3}
              columnWrapperStyle={styles.row}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => setAcusado(item)}
                  style={styles.playerCard}
                >
                  <Text style={styles.playerName}>{item.nome}</Text>
                </TouchableOpacity>
              )}
            />
          </View>

          {mostrarMensagem && acusado?.nome !== '' && (
            <Text style={styles.subtitle}>Você confirma seu voto em {acusado?.nome}?</Text>
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              setVotoConfirmado(true)
              socket.emit('confirmarVoto', {
                codigo: sala?.codigo,
                socketAcusador: socket.id,
                socketAlvo: acusado!.socketId
              })
            }}
            disabled={!acusado}
          >
            <Text style={styles.buttonText}>Confirmar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              setVotoConfirmado(true)
              socket.emit('confirmarVoto', {
                codigo: sala?.codigo,
                socketAcusador: socket.id,
                skip: true
              })
            }}
          >
            <Text style={styles.buttonText}>pular votação</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.title}>Sala de votação!</Text>
          <Text style={styles.playersTitle}>Tempo restante: {formatarTempo(tempoRestante)}</Text>

          <View style={styles.playersContainer}>
            <Text style={styles.playersTitle}>
              {acusado?.nome ? `Você votou em ${acusado.nome}` : 'Você não votou'}
            </Text>
            <Text style={styles.playersTitle}>Aguarde o fim da votação...</Text>
            <ActivityIndicator size="large" color="#FFF" />
          </View>
        </>
      )}
    </View>
  )
}
