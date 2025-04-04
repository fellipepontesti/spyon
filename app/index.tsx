import { getDataAsyncStorage, getObjectDataAsyncStorage } from "@/storage/getData"
import { saveObjectDataAsyncStorage } from "@/storage/saveData"
import { Href, router } from "expo-router"
import { useEffect, useState } from "react"
import { Text, View, TextInput, TouchableOpacity } from "react-native"
import { usePlayer } from "@/context/playerInfo"
import { useTheme } from "@/context/themeContext"
import { darkTheme, lightTheme } from "@/styles/theme"

export default function Index() {
  const [nomeJogador, setNomeJogador] = useState('')
  const playerData = usePlayer()
  const { theme } = useTheme()
  const styles = theme === "dark" ?  darkTheme : lightTheme
  const [isReady, setIsReady] = useState(false)
 
  useEffect(() => {
    const checkUser = async () => {
      if (playerData.nomeJogador) {
        router.push('/home' as Href)
      }
    }

    checkUser()
  }, [playerData])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem vindo ao SpyON</Text>
      <TextInput 
        style={styles.input}
        value={nomeJogador}
        onChangeText={setNomeJogador}
        placeholder="Digite seu nome"
        placeholderTextColor="#000"
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          saveObjectDataAsyncStorage('playerData', { nomeJogador, wins: 0 })
          router.replace('/home' as Href)
        }}
      >
        <Text style={styles.buttonText}>Criar conta</Text>
      </TouchableOpacity>
    </View>
  )
}