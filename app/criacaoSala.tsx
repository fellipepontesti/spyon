import { View, Text, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { criarSala, socket } from "@spyon/services/socket";
import { RoomDTO } from "@spyon/dto/roomDTO";
import { Href, router } from "expo-router";
import { usePlayer } from "@spyon/context/playerContext";
import { useTheme } from "@spyon/context/themeContext";
import { darkTheme, lightTheme } from "@spyon/styles/theme";

export default function CriacaoSala() {
  const {player} = usePlayer();
  const [conectado, setConectado] = useState(false);
  const { theme, mudarTema } = useTheme();
  const styles = theme === "dark" ? darkTheme : lightTheme;

  useEffect(() => {
    const atualizarStatus = () => {
      setConectado(socket.connected);
    };

    socket.on("connect", atualizarStatus);
    socket.on("disconnect", atualizarStatus);

    socket.on("redirecionarParaSala", (sala: RoomDTO) => {
      router.push("/room" as Href);
    });

    atualizarStatus();

    return () => {
      socket.off("connect", atualizarStatus);
      socket.off("disconnect", atualizarStatus);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Escolha uma das opções</Text>

      <TouchableOpacity
        onPress={() => router.push("/criarSalaPrivada" as Href)}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Sala privada</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => criarSala({ player })}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Sala pública</Text>
      </TouchableOpacity>
    </View>
  );
}
