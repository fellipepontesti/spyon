import { criarLinkConviteSala } from "@spyon/helpers/inviteLink"
import { useSala } from "@spyon/context/salaContext"
import { useTheme } from "@spyon/context/themeContext"
import { usePlayer } from "@spyon/context/playerContext"
import { entrarSala } from "@spyon/services/socket"
import { useFriendsStore } from "@spyon/store/useFriendsStore"
import { darkTheme, lightTheme } from "@spyon/styles/theme"
import { FontAwesome } from "@expo/vector-icons"
import { router } from "expo-router"
import { useMemo, useState } from "react"
import {
  FlatList,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"

export default function Amigos() {
  const { theme } = useTheme()
  const styles = theme === "dark" ? darkTheme : lightTheme
  const localStyles = createLocalStyles(theme)
  const { sala } = useSala()
  const { player } = usePlayer()
  const amigos = useFriendsStore((state) => state.amigos)
  const mensagens = useFriendsStore((state) => state.mensagens)
  const adicionarAmigo = useFriendsStore((state) => state.adicionarAmigo)
  const removerAmigo = useFriendsStore((state) => state.removerAmigo)
  const enviarMensagem = useFriendsStore((state) => state.enviarMensagem)

  const [novoAmigo, setNovoAmigo] = useState("")
  const [amigoSelecionado, setAmigoSelecionado] = useState<string | null>(null)
  const [mensagem, setMensagem] = useState("")

  const amigoAtual = amigos.find((amigo) => amigo.id === amigoSelecionado)
  const mensagensDoAmigo = useMemo(
    () => mensagens.filter((item) => item.friendId === amigoSelecionado),
    [amigoSelecionado, mensagens]
  )

  const convidarParaSala = async () => {
    if (!sala?.codigo) {
      return
    }

    if (amigoSelecionado) {
      enviarMensagem(amigoSelecionado, `CONVITE_SALA:${sala.codigo}`)
    } else {
      const link = criarLinkConviteSala(sala.codigo)
      await Share.share({
        message: `Entra na minha sala do SpyON: ${link}`,
        url: link,
      })
    }
  }

  const enviar = () => {
    if (!amigoSelecionado) {
      return
    }

    enviarMensagem(amigoSelecionado, mensagem)
    setMensagem("")
  }

  return (
    <View style={[styles.container, localStyles.screen]}>
      <Text style={styles.title}>Amigos</Text>
      <Text style={styles.subtitle}>
        Convide amigos para jogar e mantenha conversas rápidas por aqui.
      </Text>

      <View style={localStyles.addRow}>
        <TextInput
          style={[styles.input, localStyles.input]}
          value={novoAmigo}
          onChangeText={setNovoAmigo}
          placeholder="Nome do amigo"
          placeholderTextColor="#7D8B80"
        />
        <TouchableOpacity
          style={localStyles.iconButton}
          onPress={() => {
            adicionarAmigo(novoAmigo)
            setNovoAmigo("")
          }}
        >
          <FontAwesome name="plus" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={localStyles.content}>
        <View style={localStyles.panel}>
          <Text style={localStyles.panelTitle}>Lista</Text>

          <FlatList
            data={amigos}
            keyExtractor={(item) => item.id}
            contentContainerStyle={localStyles.listContent}
            ListEmptyComponent={
              <Text style={localStyles.emptyText}>Adicione alguém para começar.</Text>
            }
            renderItem={({ item }) => {
              const selected = item.id === amigoSelecionado

              return (
                <TouchableOpacity
                  style={[localStyles.friendItem, selected && localStyles.friendItemActive]}
                  onPress={() => setAmigoSelecionado(item.id)}
                >
                  <Text style={localStyles.friendName}>{item.nome}</Text>
                  <TouchableOpacity onPress={() => removerAmigo(item.id)}>
                    <FontAwesome name="trash-o" size={18} color="#D43D3D" />
                  </TouchableOpacity>
                </TouchableOpacity>
              )
            }}
          />
        </View>

        <View style={localStyles.panel}>
          <Text style={localStyles.panelTitle}>
            {amigoAtual ? `Conversa com ${amigoAtual.nome}` : "Conversa"}
          </Text>

          <ScrollView style={localStyles.messages} contentContainerStyle={localStyles.messagesContent}>
            {!amigoAtual && (
              <Text style={localStyles.emptyText}>Selecione um amigo para mandar mensagem.</Text>
            )}

            {mensagensDoAmigo.map((item) => {
              const isInvite = item.texto.startsWith("CONVITE_SALA:")
              if (isInvite) {
                const codigoSala = item.texto.replace("CONVITE_SALA:", "").trim()
                return (
                  <View key={item.id} style={localStyles.inviteCard}>
                    <FontAwesome name="gamepad" size={24} color="#159947" style={{ marginBottom: 4 }} />
                    <Text style={localStyles.inviteTitle}>Convite de Jogo! 🎮</Text>
                    <Text style={localStyles.inviteSubtitle}>
                      Bora jogar SpyON? Sala: <Text style={localStyles.inviteCode}>{codigoSala}</Text>
                    </Text>
                    <TouchableOpacity
                      style={localStyles.inviteButton}
                      onPress={() => {
                        entrarSala(codigoSala, player)
                        router.push("/room")
                      }}
                    >
                      <Text style={localStyles.inviteButtonText}>Entrar na Sala</Text>
                    </TouchableOpacity>
                  </View>
                )
              }

              return (
                <View key={item.id} style={localStyles.messageBubble}>
                  <Text style={localStyles.messageText}>{item.texto}</Text>
                </View>
              )
            })}
          </ScrollView>

          <View style={localStyles.messageRow}>
            <TextInput
              style={[styles.input, localStyles.messageInput]}
              value={mensagem}
              onChangeText={setMensagem}
              editable={!!amigoAtual}
              placeholder="Mensagem"
              placeholderTextColor="#7D8B80"
            />
            <TouchableOpacity
              style={[localStyles.iconButton, !amigoAtual && localStyles.iconButtonDisabled]}
              disabled={!amigoAtual}
              onPress={enviar}
            >
              <FontAwesome name="send" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.greenButton, !sala?.codigo && localStyles.disabledButton]}
            disabled={!sala?.codigo}
            onPress={convidarParaSala}
          >
            <Text style={styles.gameButtonText}>
              {sala?.codigo ? "Convidar para sala atual" : "Entre em uma sala para convidar"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.redButton} onPress={() => router.back()}>
        <Text style={styles.gameButtonText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  )
}

const createLocalStyles = (theme: "light" | "dark") => {
  const isDark = theme === "dark"
  const surface = isDark ? "#0F1712" : "#FFFFFF"
  const raised = isDark ? "#17211A" : "#F4FBF6"
  const border = isDark ? "#294032" : "#D4E2D7"
  const text = isDark ? "#F4F7F2" : "#101A13"
  const muted = isDark ? "#B7C4BA" : "#526257"

  return StyleSheet.create({
    screen: {
      justifyContent: "flex-start",
    },
    addRow: {
      width: "100%",
      maxWidth: 620,
      flexDirection: "row",
      gap: 10,
      alignItems: "center",
    },
    input: {
      flex: 1,
    },
    iconButton: {
      width: 54,
      height: 54,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#159947",
    },
    iconButtonDisabled: {
      backgroundColor: "#68736B",
    },
    content: {
      width: "100%",
      maxWidth: 820,
      gap: 12,
    },
    panel: {
      width: "100%",
      minHeight: 170,
      padding: 14,
      borderRadius: 8,
      backgroundColor: surface,
      borderWidth: 1,
      borderColor: border,
      gap: 10,
    },
    panelTitle: {
      color: text,
      fontSize: 17,
      lineHeight: 23,
      fontWeight: "800",
    },
    listContent: {
      gap: 8,
    },
    friendItem: {
      minHeight: 52,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 8,
      backgroundColor: raised,
      borderWidth: 1,
      borderColor: border,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },
    friendItemActive: {
      borderColor: "#159947",
    },
    friendName: {
      flex: 1,
      color: text,
      fontSize: 16,
      lineHeight: 21,
      fontWeight: "800",
    },
    emptyText: {
      color: muted,
      fontSize: 15,
      lineHeight: 21,
      textAlign: "center",
      paddingVertical: 16,
    },
    messages: {
      maxHeight: 220,
    },
    messagesContent: {
      gap: 8,
      paddingBottom: 4,
    },
    messageBubble: {
      alignSelf: "flex-end",
      maxWidth: "86%",
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 8,
      backgroundColor: "#159947",
    },
    messageText: {
      color: "#FFFFFF",
      fontSize: 15,
      lineHeight: 21,
      fontWeight: "700",
    },
    messageRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    messageInput: {
      flex: 1,
    },
    disabledButton: {
      backgroundColor: "#68736B",
      borderColor: "#68736B",
    },
    inviteCard: {
      alignSelf: "flex-end",
      width: "86%",
      padding: 14,
      borderRadius: 12,
      backgroundColor: isDark ? "#17261C" : "#E8F5EC",
      borderWidth: 1.5,
      borderColor: "#159947",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
      marginBottom: 8,
      alignItems: "center",
    },
    inviteTitle: {
      color: text,
      fontSize: 16,
      fontWeight: "800",
      marginBottom: 4,
      textAlign: "center",
    },
    inviteSubtitle: {
      color: muted,
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 12,
      textAlign: "center",
    },
    inviteCode: {
      color: "#159947",
      fontSize: 15,
      fontWeight: "800",
    },
    inviteButton: {
      width: "100%",
      height: 38,
      backgroundColor: "#159947",
      borderRadius: 6,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.5,
      elevation: 2,
    },
    inviteButtonText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "700",
    },
  })
}
