import { usePlayer } from '@/context/playerContext'
import { useTheme } from '@/context/themeContext'
import { entrarSala, socket } from '@/services/socket'
import { darkTheme, lightTheme } from '@/styles/theme'
import { Href, router, useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import { Text, TextInput, TouchableOpacity, View } from 'react-native'

export default function BuscarSala() {
  const {player} = usePlayer()
  const [codigo, setCodigo] = useState('')
  const { theme } = useTheme()
  const styles = theme === "dark" ?  darkTheme : lightTheme

  useEffect(() => {
    socket.on('salaEncontrada', () => {
      router.push({ pathname: '/room' })
    })

    socket.on('salaPrivada', (codigo: string) => {
      router.push({ pathname: '/entrarSalaPrivada', params: { codigo } })
    })

    return () => {
      socket.off('salaEncontrada')
    }
  }, [])

  return (
    <View style={styles.container}>
      <TextInput 
        style={styles.input}
        value={codigo.toUpperCase()}
        onChangeText={setCodigo}
        placeholder="Digite o código da sala" 
        placeholderTextColor="#bdbdbd" 
        maxLength={6} 
      />
      <TouchableOpacity
        style={[
          styles.button,
          { 
            backgroundColor: codigo.length < 6 ? "#555" : "#276337"
          }
        ]}
        onPress={() => {
          entrarSala(codigo, player)
        }}
      >
        <Text style={[styles.buttonText, {color: '#FFF'}]}>Buscar sala</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.redButton}
        onPress={() => {
          router.back()
        }}
      >
        <Text style={[styles.buttonText, {color: '#FFF'}]}>Voltar</Text>
      </TouchableOpacity>
    </View>
  )
}

