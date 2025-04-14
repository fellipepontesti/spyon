import { View, Text, ActivityIndicator, TouchableOpacity, Modal } from 'react-native'
import { useEffect, useState } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import { darkTheme, lightTheme } from '@/styles/theme'
import { useTheme } from '@/context/themeContext'
import { useSala } from '@/context/salaContext'
import { socket } from '@/services/socket'
import { usePlayer } from '@/context/playerContext'
import LottieView from 'lottie-react-native'

export default function ResultadoVotacao() {
  const {player, setVitorias} = usePlayer()
  const { theme } = useTheme()
  const styles = theme === 'dark' ? darkTheme : lightTheme
  const { sala } = useSala()

  const [etapa, setEtapa] = useState(0)
  const [tempo, setTempo] = useState(5)
  const [pontos, setPontos] = useState('.')
  const [mostrarResultado, setMostrarResultado] = useState(false)
  const params = useLocalSearchParams()
  const [vencedor, setVencedor] = useState('')
  const mensagem = vencedor === "espião" ? "🎉 O Espião venceu!" : "🎉 A Equipe venceu!"

  useEffect(() => {
    socket.on("skip", () => {
      router.replace({ pathname: "/game", params: { codigo: sala?.codigo, message: "Votação pulada! O espião continua entre a galera..." } })
    })

    socket.on("jogoContinua", () => {
      router.replace({ pathname: "/game", params: { codigo: sala?.codigo, message: "Iih deu ruim! O espião continua entre a galera..." } })
    })

    socket.on("pontoGanho", () => {
      setVitorias(player.vitorias + 1)
    })

    socket.on("fimDeJogo", (data: { vencedor: string }) => {
      setVencedor(data.vencedor)
      router.replace({ pathname: "/vencedor", params: { codigo: sala?.codigo, vencedor } })
    })

    return () => {
      socket.off("skip")
      socket.off("jogoContinua")
      socket.off("pontoGanho")
      socket.off("fimDeJogo")
    }
  }, [])

  useEffect(() => {
    if (etapa === 0) {
      const intervalPontinhos = setInterval(() => {
        setPontos(p => p.length >= 3 ? '.' : p + '.')
      }, 500)

      return () => clearInterval(intervalPontinhos)
    }
  }, [etapa])

  useEffect(() => {
    if (etapa === 1) {
      const countdown = setInterval(() => {
        setTempo(prev => {
          if (prev === 1) {
            clearInterval(countdown)
            setMostrarResultado(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(countdown)
    }
  }, [etapa])

  const renderEtapa = () => {
    if (etapa === 0) {
      return (
        <>
          <Text style={styles.title}>Calculando votos{pontos}</Text>
          <ActivityIndicator size="large" color="#FFF" style={{ marginTop: 20 }} />
        </>
      )
    }

    if (etapa === 1) {
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
          </View>
        </Modal>
      )
    }
  }

  return (
    <View style={styles.container}>
      {renderEtapa()}
    </View>
  )
}
