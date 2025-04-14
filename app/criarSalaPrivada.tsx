import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { useEffect, useState } from "react";
import { FontAwesome } from "@expo/vector-icons"; // Biblioteca de ícones
import { criarSala, socket } from "@/services/socket";
import { RoomDTO } from "@/dto/roomDTO";
import { Href, router } from "expo-router";
import { usePlayer } from "@/context/playerContext";
import { useTheme } from "@/context/themeContext";
import { darkTheme, lightTheme } from "@/styles/theme";

export default function criarSalaPrivada() {
  const {player} = usePlayer();
  const [password, setPassword] = useState('');
  const { theme, mudarTema } = useTheme();
  const styles = theme === "dark" ? darkTheme : lightTheme;

  useEffect(() => {
    socket.on("redirecionarParaSala", (sala: RoomDTO) => {
      router.push("/room" as Href);
    })
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Digite uma senha:</Text>

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
        disabled={password.length < 4}
        onPress={() => criarSala({ player, password })}
        style={[
          styles.button,
          { 
            backgroundColor: "#276337"
          }
        ]}
      >
        <Text style={[
          styles.buttonText,
          { color: password.length < 4 ? "#276337" : '#FFF'}
        ]}>Criar sala</Text>
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
