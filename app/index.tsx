import { saveObjectDataAsyncStorage } from "@/storage/saveData"
import { Href, router } from "expo-router"
import { useEffect, useState } from "react"
import { Text, View, TextInput, TouchableOpacity } from "react-native"
import { usePlayer } from "@/context/playerContext"
import { useTheme } from "@/context/themeContext"
import { darkTheme, lightTheme } from "@/styles/theme"
import { socket } from "@/services/socket"

export default function Index() {
  const [nome, setNome] = useState('')
  const { player, setSocketId } = usePlayer()
  const { theme } = useTheme()
  const styles = theme === "dark" ?  darkTheme : lightTheme
 
  useEffect(() => {
    const checkUser = async () => {
      if (player.nome) {
        setSocketId(socket.id)
        router.push('/home' as Href)
      }
    }

    checkUser()
  }, [player])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem vindo ao SpyON</Text>
      <TextInput 
        style={styles.input}
        value={nome}
        onChangeText={setNome}
        placeholder="Digite seu nome"
        placeholderTextColor="#000"
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          saveObjectDataAsyncStorage('player', { nome, vitorias: 0 })
          router.replace('/home' as Href)
        }}
      >
        <Text style={styles.buttonText}>Criar conta</Text>
      </TouchableOpacity>
    </View>
  )
}