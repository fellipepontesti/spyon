import { desconectar, iniciarJogo } from "@spyon/services/socket"
import { View, Text, TouchableOpacity, FlatList, Share, useWindowDimensions, Modal, StyleSheet } from "react-native"
import { useEffect, useLayoutEffect, useState } from "react"
import { socket } from "@spyon/services/socket"
import { Href, router, useNavigation } from "expo-router"
import { usePlayer } from "@spyon/context/playerContext"
import { darkTheme, lightTheme } from "@spyon/styles/theme"
import { useTheme } from "@spyon/context/themeContext"
import { useSala } from "@spyon/context/salaContext"
import { criarLinkConviteSala } from "@spyon/helpers/inviteLink"
import { useVoiceChat } from "@spyon/context/VoiceContext"
import { useFriendsStore } from "@spyon/store/useFriendsStore"
import { FontAwesome } from "@expo/vector-icons"

export default function Room() {
  const { sala } = useSala()
  const [erro, setErro] = useState('')
  const [owner, setOwner] = useState(false)
  const [modalConvidarVisible, setModalConvidarVisible] = useState(false)
  const [convitesEnviados, setConvitesEnviados] = useState<{ [id: string]: boolean }>({})

  const { player } = usePlayer()
  const { theme } = useTheme()
  const styles = theme === "dark" ? darkTheme : lightTheme
  const localStyles = createLocalStyles(theme)
  const { width } = useWindowDimensions()
  const playerColumns = width < 380 ? 2 : width >= 760 ? 4 : 3

  const amigos = useFriendsStore((state) => state.amigos)
  const enviarMensagem = useFriendsStore((state) => state.enviarMensagem)

  const {
    isSupported,
    muted,
    toggleMute,
    joinedVoice,
    joinVoiceChat,
    leaveVoiceChat,
    mutedPlayers,
  } = useVoiceChat()

  useEffect(() => {
    socket.on("erro", (mensagem: string) => {
      setErro(mensagem)
    })

    return () => {
      socket.off("erro")
    }
  }, [])

  useEffect(() => {
    if (sala?.socketIdOwner === socket.id) {
      setOwner(true)
    }
  }, [sala])

  const compartilharConvite = async () => {
    if (!sala?.codigo) {
      return
    }

    const link = criarLinkConviteSala(sala.codigo)
    await Share.share({
      message: `Entra na minha sala do SpyON: ${link}`,
      url: link,
    })
  }

  const enviarConviteRapido = (amigoId: string) => {
    if (!sala?.codigo) return
    enviarMensagem(amigoId, `CONVITE_SALA:${sala.codigo}`)
    setConvitesEnviados((prev) => ({ ...prev, [amigoId]: true }))
    setTimeout(() => {
      setConvitesEnviados((prev) => ({ ...prev, [amigoId]: false }))
    }, 2000)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sala: {sala?.codigo || "?"}</Text>
      <Text style={styles.subtitle}>Bem-vindo, {player.nome || "Jogador"}!</Text>

      {erro ? <Text style={styles.error}>{erro}</Text> : null}

      <View style={styles.playersContainer}>
        <Text style={styles.playersTitle}>Jogadores na Sala:</Text>
        <FlatList
          key={playerColumns}
          data={sala?.players || []}
          keyExtractor={(item) => item.nome}
          numColumns={playerColumns}
          columnWrapperStyle={styles.row}
          contentContainerStyle={{ paddingVertical: 4 }}
          style={{ width: "100%" }}
          renderItem={({ item }) => {
            const isMe = item.socketId === socket.id
            const playerMuted = isMe ? muted : (mutedPlayers[item.socketId] ?? false)
            return (
              <View style={styles.playerCard}>
                <Text style={styles.playerName}>{item.nome}</Text>
                {joinedVoice && (
                  <FontAwesome
                    name={playerMuted ? "microphone-slash" : "microphone"}
                    size={14}
                    color={playerMuted ? "#D43D3D" : "#159947"}
                    style={{ marginLeft: 6 }}
                  />
                )}
              </View>
            )
          }}
        />
      </View>

      <View style={localStyles.voiceContainer}>
        <Text style={localStyles.voiceTitle}>
          <FontAwesome name="volume-up" size={18} color="#159947" /> Chat de Voz
        </Text>
        {!isSupported ? (
          <Text style={localStyles.voiceInfo}>
            Chat de voz indisponível neste ambiente. Use na versão Web!
          </Text>
        ) : (
          <View style={localStyles.voiceControls}>
            {!joinedVoice ? (
              <TouchableOpacity style={styles.button} onPress={joinVoiceChat}>
                <Text style={styles.buttonText}>Entrar no Chat de Voz</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
                <TouchableOpacity
                  style={[styles.button, { flex: 1, backgroundColor: muted ? "#D43D3D" : "#159947" }]}
                  onPress={toggleMute}
                >
                  <Text style={styles.buttonText}>
                    {muted ? "Desmutar Microfone" : "Mutar Microfone"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.redButton, { minWidth: 80, paddingHorizontal: 12, marginVertical: 0 }]}
                  onPress={leaveVoiceChat}
                >
                  <Text style={[styles.gameButtonText, { fontSize: 14 }]}>Sair</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>

      <View style={styles.gameButtonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={compartilharConvite}
        >
          <Text style={styles.buttonText}>Gerar link de convite</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => setModalConvidarVisible(true)}
        >
          <Text style={styles.buttonText}>Convidar amigos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.redButton}
          onPress={() => {
            if (joinedVoice) {
              leaveVoiceChat()
            }
            if (sala?.codigo) {
              desconectar(sala.codigo)
            }
            router.push('/home' as Href)
          }}
        >
          <Text style={styles.gameButtonText}>Sair da Sala</Text>
        </TouchableOpacity>

        {owner && (
          <TouchableOpacity
            style={styles.greenButton}
            onPress={() => {
              if (sala?.codigo) {
                iniciarJogo(sala.codigo)
              }
            }}
          >
            <Text style={styles.gameButtonText}>Iniciar jogo</Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal
        visible={modalConvidarVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalConvidarVisible(false)}
      >
        <View style={localStyles.modalOverlay}>
          <View style={localStyles.modalContent}>
            <View style={localStyles.modalHeader}>
              <Text style={localStyles.modalHeaderTitle}>Convidar Amigos 🎮</Text>
              <TouchableOpacity onPress={() => setModalConvidarVisible(false)} style={localStyles.closeBtn}>
                <FontAwesome name="close" size={20} color="#D43D3D" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={amigos}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ gap: 10, paddingVertical: 10 }}
              ListEmptyComponent={
                <View style={{ alignItems: "center", paddingVertical: 20 }}>
                  <Text style={localStyles.emptyText}>Nenhum amigo adicionado.</Text>
                  <TouchableOpacity
                    style={[styles.button, { marginTop: 10, paddingHorizontal: 16 }]}
                    onPress={() => {
                      setModalConvidarVisible(false)
                      router.push("/amigos" as Href)
                    }}
                  >
                    <Text style={styles.buttonText}>Adicionar Amigos</Text>
                  </TouchableOpacity>
                </View>
              }
              renderItem={({ item }) => {
                const enviado = convitesEnviados[item.id]
                return (
                  <View style={localStyles.friendItem}>
                    <Text style={localStyles.friendName}>{item.nome}</Text>
                    <TouchableOpacity
                      style={[localStyles.inviteBtn, enviado && { backgroundColor: "#68736B" }]}
                      disabled={enviado}
                      onPress={() => enviarConviteRapido(item.id)}
                    >
                      <Text style={localStyles.inviteBtnText}>
                        {enviado ? "Enviado!" : "Convidar"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  )
}

const createLocalStyles = (theme: "light" | "dark") => {
  const isDark = theme === "dark"
  const surface = isDark ? "#17211A" : "#F4FBF6"
  const border = isDark ? "#294032" : "#D4E2D7"
  const text = isDark ? "#F4F7F2" : "#101A13"
  const muted = isDark ? "#B7C4BA" : "#526257"

  return StyleSheet.create({
    voiceContainer: {
      width: "100%",
      maxWidth: 620,
      padding: 14,
      borderRadius: 12,
      backgroundColor: isDark ? "#0F1712" : "#FFFFFF",
      borderWidth: 1,
      borderColor: border,
      marginVertical: 14,
      gap: 8,
    },
    voiceTitle: {
      color: text,
      fontSize: 16,
      fontWeight: "800",
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    voiceInfo: {
      color: muted,
      fontSize: 13,
      fontWeight: "600",
    },
    voiceControls: {
      width: "100%",
      marginTop: 4,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      justifyContent: "flex-end",
    },
    modalContent: {
      backgroundColor: isDark ? "#0F1712" : "#FFFFFF",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 30,
      minHeight: 250,
      maxHeight: "75%",
      borderWidth: 1,
      borderColor: border,
      borderBottomWidth: 0,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottomWidth: 1,
      borderBottomColor: border,
      paddingBottom: 12,
      marginBottom: 10,
    },
    modalHeaderTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: text,
    },
    closeBtn: {
      padding: 4,
    },
    emptyText: {
      color: muted,
      fontSize: 15,
      textAlign: "center",
    },
    friendItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 12,
      borderRadius: 8,
      backgroundColor: surface,
      borderWidth: 1,
      borderColor: border,
    },
    friendName: {
      fontSize: 16,
      fontWeight: "800",
      color: text,
    },
    inviteBtn: {
      backgroundColor: "#159947",
      paddingVertical: 6,
      paddingHorizontal: 14,
      borderRadius: 6,
      justifyContent: "center",
      alignItems: "center",
    },
    inviteBtnText: {
      color: "#FFFFFF",
      fontWeight: "700",
      fontSize: 13,
    },
  })
}
