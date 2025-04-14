import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { useEffect, useState } from "react";
import { entrarSala, socket } from "@/services/socket";
import { Href, router, useLocalSearchParams } from "expo-router";
import { usePlayer } from "@/context/playerContext";
import { useTheme } from "@/context/themeContext";
import { darkTheme, lightTheme } from "@/styles/theme";

export default function entrarSalaPrivada() {
  const {player} = usePlayer();
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('')
  const { theme } = useTheme();
  const styles = theme === "dark" ? darkTheme : lightTheme
  const params = useLocalSearchParams()
  const codigo = params.codigo as string

  useEffect(() => {
    socket.on('salaEncontrada', () => {
      router.push({ pathname: '/room' })
    })

    socket.on("erro", (message: string) => {
      setErro(message)
    })
  }, []);

  return (
    <View style={styles.container}>
      {erro ? <Text style={styles.error}>{erro}</Text> : null}

      <Text style={styles.title}>Digite a senha da sala:</Text>

      <TextInput 
        keyboardType='numeric'
        style={styles.input}
        value={password}
        onChangeText={(text) => setPassword(text.replace(/[^0-9]/g, ''))}
        placeholder="Digite a senha da sala" 
        placeholderTextColor="#bdbdbd" 
        maxLength={6} 
      />
      <TouchableOpacity
        onPress={() => entrarSala(codigo, player, password)}
        style={[
          styles.button,
          { 
            backgroundColor: password.length < 4 ? "#555" : "#276337"
          }
        ]}
      >
        <Text style={[
          styles.buttonText,
          { color: password.length < 4 ? "#555" : '#FFF'}
        ]}>Entrar na sala</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.redButton}
      >
        <Text style={[
          styles.buttonText, {color: '#FFF'}
        ]}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}
