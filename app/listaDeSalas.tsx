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

  useEffect(() => {
    socket.on("listaDeSalas", (data: RoomDTO) => {
      setSalas(Object.values(data).slice(0, 15))
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Salas online</Text>

      <FlatList
        data={salas}
        keyExtractor={(item) => item.codigo}
        numColumns={3}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.playerCard} 
            onPress={() => {
              item.privada ? 
              router.push({
                pathname: '/entrarSalaPrivada',
                params: {codigo: item.codigo}
              }) :
              entrarSala(item.codigo, player)
            }}
          >
            <Text style={styles.playerName}>
              {item.codigo}
            </Text>
            {item.privada && (
              <FontAwesome name="lock" size={16} color="#d32f2f" />
            )}
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        style={styles.redButton}
        onPress={() => router.replace('/home')}
      >
        <Text style={[styles.buttonText, { color: "#fff" }]}>Voltar</Text>
      </TouchableOpacity>
    </View>
  )
}
