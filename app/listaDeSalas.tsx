import { router } from "expo-router"
import { useEffect, useState } from "react"
import { Text, View, TouchableOpacity, FlatList } from "react-native"
import { usePlayer } from "@/context/playerContext"
import { useTheme } from "@/context/themeContext"
import { darkTheme, lightTheme } from "@/styles/theme"
import { RoomDTO, RoomDataDTO } from "@/dto/roomDTO"
import { entrarSala, socket } from "@/services/socket"
import { FontAwesome } from "@expo/vector-icons"

export default function ListaDeSalas() {
  const { player } = usePlayer()
  const [salas, setSalas] = useState<RoomDataDTO[]>([])
  const { theme } = useTheme()
  const styles = theme === "dark" ? darkTheme : lightTheme

  const [page, setPage] = useState(1)
  const perPage = 12

  useEffect(() => {
    socket.on("listaDeSalas", (data: RoomDTO) => {
      setSalas(Object.values(data))
    })

    socket.on("salaRemovida", (codigo: string) => {
      setSalas((salasAtuais) => salasAtuais.filter(sala => sala.codigo !== codigo))
    })
  
    socket.on("novaSalaCriada", (novaSala: RoomDataDTO) => {
      setSalas((salasAtuais) => {
        if (salasAtuais.find(s => s.codigo === novaSala.codigo)) {
          return salasAtuais
        }
  
        if (salasAtuais.length < 15) {
          return [...salasAtuais, novaSala]
        }
  
        return salasAtuais
      })
    })
  
    socket.on("salaEncontrada", () => {
      router.replace({ pathname: "/room" })
    })
  
    return () => {
      socket.off("listaDeSalas")
      socket.off("novaSalaCriada")
      socket.off("salaEncontrada")
      socket.off("salaRemovida")
    }
  }, [])  

  useEffect(() => {
    socket.emit("listarSalas", { page })
  }, [page])

  const atualizarSalas = () => {
    socket.emit("listarSalas", { page })
  }

  return (
    <View style={styles.container}>
  <Text style={styles.title}>Salas online</Text>

  <FlatList
    data={salas}
    keyExtractor={(item) => item.codigo}
    numColumns={3}
    columnWrapperStyle={styles.row}
    contentContainerStyle={{ paddingBottom: 10 }}
    style={{ maxHeight: 320 }}
    renderItem={({ item }) => (
      <TouchableOpacity
        style={styles.playerCard}
        onPress={() => {
          item.privada
            ? router.push({
                pathname: '/entrarSalaPrivada',
                params: { codigo: item.codigo },
              })
            : entrarSala(item.codigo, player)
        }}
      >
        <Text style={styles.playerName}>{item.codigo}</Text>
        {item.privada && (
          <FontAwesome name="lock" size={16} color="#d32f2f" />
        )}
      </TouchableOpacity>
    )}
  />

  <View style={styles.paginationControls}>
    <TouchableOpacity
      style={styles.pageButton}
      onPress={() => {
        setPage(prev => Math.max(prev - 1, 1))
      }}
      disabled={page === 1}
    >
      <Text style={styles.pageButtonText}>{'<'}</Text>
    </TouchableOpacity>

    <Text style={styles.pageIndicator}>Página {page}</Text>

    <TouchableOpacity
      style={styles.pageButton}
      onPress={() => {
        const totalPaginas = Math.ceil(
          Object.values(salas).filter(s => !s.jogoIniciado).length / perPage
        )
        if (page < totalPaginas) {
          setPage(prev => prev + 1)
        }
      }}
    >
      <Text style={styles.pageButtonText}>{'>'}</Text>
    </TouchableOpacity>
  </View>

  <TouchableOpacity
    style={styles.redButton}
    onPress={() => router.replace('/home')}
  >
    <Text style={[styles.buttonText, { color: "#fff" }]}>Voltar</Text>
  </TouchableOpacity>
</View>
  )
}
