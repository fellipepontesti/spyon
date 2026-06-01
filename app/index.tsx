import { Href, router } from "expo-router"
import { useEffect, useState } from "react"
import {
  Text,
  View,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from "react-native"
import { useUserStore } from "@spyon/store/useUserStore"
import { useTheme } from "@spyon/context/themeContext"
import { darkTheme, lightTheme } from "@spyon/styles/theme"
import { socket, testarConexao } from "@spyon/services/socket"
import { FontAwesome } from "@expo/vector-icons"

export default function Index() {
  const { theme, mudarTema } = useTheme()
  const styles = theme === "dark" ? darkTheme : lightTheme
  const localStyles = createLocalStyles(theme)

  const userNome = useUserStore((state) => state.nome)
  const setUser = useUserStore((state) => state.setUser)

  const [modo, setModo] = useState<"selecao" | "convidado">("selecao")
  const [nomeConvidado, setNomeConvidado] = useState("")
  const [loadingGoogle, setLoadingGoogle] = useState(false)
  const [showGoogleModal, setShowGoogleModal] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState("Aguardando teste de conexão")

  useEffect(() => {
    if (userNome) {
      setTimeout(() => {
        router.replace("/home" as Href)
      }, 100)
    }
  }, [userNome])

  useEffect(() => {
    const handleConnect = () => {
      setConnectionStatus("Socket conectado")
    }

    const handleDisconnect = () => {
      setConnectionStatus("Socket desconectado")
    }

    const handleTesteConexaoResult = (data: { message: string }) => {
      setConnectionStatus(data.message)
    }

    socket.on("connect", handleConnect)
    socket.on("disconnect", handleDisconnect)
    socket.on("testeConexaoResult", handleTesteConexaoResult)

    setConnectionStatus(socket.connected ? "Socket conectado" : "Socket desconectado")

    return () => {
      socket.off("connect", handleConnect)
      socket.off("disconnect", handleDisconnect)
      socket.off("testeConexaoResult", handleTesteConexaoResult)
    }
  }, [])

  const entrarComoConvidado = () => {
    const nomeLimpo = nomeConvidado.trim()
    if (!nomeLimpo) return
    setUser(nomeLimpo, "convidado")
    router.replace("/home" as Href)
  }

  const iniciarLoginGoogle = async () => {
    setLoadingGoogle(true)
    
    // Simula uma pequena latência de rede/conexão de 1.2s para alta fidelidade
    setTimeout(() => {
      setLoadingGoogle(false)
      setShowGoogleModal(true)
    }, 1200)
  }

  const selecionarContaGoogleSimulada = (nome: string) => {
    setShowGoogleModal(false)
    setUser(nome, "google")
    router.replace("/home" as Href)
  }

  const enviarTesteConexao = () => {
    console.log('---> aqeee --->')
    setConnectionStatus("Enviando teste para o backend...")
    testarConexao()
  }

  return (
    <View style={[styles.container, localStyles.containerOverride]}>
      <Pressable
        style={({ hovered, pressed }) => [
          localStyles.themeToggle,
          hovered && localStyles.themeToggleHover,
          pressed && localStyles.pressedBtn,
        ]}
        onPress={mudarTema}
      >
        <FontAwesome
          name={theme === "dark" ? "sun-o" : "moon-o"}
          size={18}
          color={theme === "dark" ? "#F3C969" : "#101A13"}
        />
        <Text style={localStyles.themeToggleText}>
          {theme === "dark" ? "Tema claro" : "Tema escuro"}
        </Text>
      </Pressable>

      {/* Título de Boas-vindas Premium */}
      <View style={localStyles.headerContainer}>
        <FontAwesome name="user-secret" size={64} color="#159947" style={{ marginBottom: 12 }} />
        <Text style={styles.title}>SpyON</Text>
        <Text style={localStyles.tagline}>Descubra o espião. Proteja seu segredo.</Text>
      </View>

      {modo === "selecao" ? (
        <View style={localStyles.optionsContainer}>
          {/* Opção 1: Logar com Google */}
          <Pressable
            style={({ pressed, hovered }) => [
              localStyles.authBtn,
              localStyles.googleBtn,
              hovered && localStyles.googleBtnHover,
              pressed && localStyles.pressedBtn,
            ]}
            onPress={iniciarLoginGoogle}
            disabled={loadingGoogle}
          >
            {loadingGoogle ? (
              <ActivityIndicator color="#000" size="small" />
            ) : (
              <>
                <FontAwesome name="google" size={20} color="#000" style={{ marginRight: 10 }} />
                <Text style={localStyles.googleBtnText}>Logar com o Google</Text>
              </>
            )}
          </Pressable>

          {/* Opção 2: Jogar como Convidado */}
          <Pressable
            style={({ pressed, hovered }) => [
              localStyles.authBtn,
              localStyles.guestBtn,
              hovered && localStyles.guestBtnHover,
              pressed && localStyles.pressedBtn,
            ]}
            onPress={() => setModo("convidado")}
          >
            <FontAwesome name="user" size={20} color="#FFFFFF" style={{ marginRight: 10 }} />
            <Text style={localStyles.guestBtnText}>Jogar como Convidado</Text>
          </Pressable>

          <Pressable
            style={({ pressed, hovered }) => [
              localStyles.authBtn,
              localStyles.testConnectionBtn,
              hovered && localStyles.testConnectionBtnHover,
              pressed && localStyles.pressedBtn,
            ]}
            onPress={enviarTesteConexao}
          >
            <FontAwesome name="plug" size={18} color={textColorForConnection(theme)} style={{ marginRight: 10 }} />
            <Text style={localStyles.testConnectionText}>Testar conexão socket</Text>
          </Pressable>

          <Text style={localStyles.connectionStatus}>{connectionStatus}</Text>
        </View>
      ) : (
        /* Fluxo de Convidado */
        <View style={localStyles.guestFormContainer}>
          <Text style={localStyles.formTitle}>Entrar como Convidado</Text>
          
          {/* Caixa de Aviso Premium sobre salvamento de dados */}
          <View style={localStyles.warningBox}>
            <FontAwesome name="warning" size={18} color="#D4A373" style={{ marginRight: 8 }} />
            <Text style={localStyles.warningText}>
              Aviso: Seus dados de vitórias e estatísticas não serão salvos permanentemente jogando como convidado.
            </Text>
          </View>

          <TextInput
            style={[styles.input, localStyles.inputOverride]}
            value={nomeConvidado}
            onChangeText={setNomeConvidado}
            placeholder="Escolha seu apelido"
            placeholderTextColor="#7D8B80"
            maxLength={15}
          />

          <Pressable
            style={[styles.button, !nomeConvidado.trim() && localStyles.disabledButton]}
            disabled={!nomeConvidado.trim()}
            onPress={entrarComoConvidado}
          >
            <Text style={styles.buttonText}>Jogar agora</Text>
          </Pressable>

          <Pressable style={localStyles.backBtn} onPress={() => setModo("selecao")}>
            <Text style={localStyles.backBtnText}>Voltar para seleção</Text>
          </Pressable>
        </View>
      )}

      {/* Modal de Login do Google (Simulação de Alta Fidelidade) */}
      <Modal visible={showGoogleModal} transparent animationType="slide">
        <View style={localStyles.modalOverlay}>
          <View style={localStyles.modalContent}>
            <View style={localStyles.modalHeader}>
              <FontAwesome name="google" size={22} color="#4285F4" />
              <Text style={localStyles.modalHeaderTitle}>Fazer login com o Google</Text>
            </View>
            <Text style={localStyles.modalSubtitle}>Escolha uma conta para continuar no SpyON</Text>

            {/* Conta 1 baseada no nome do Usuário */}
            <Pressable
              style={localStyles.accountItem}
              onPress={() => selecionarContaGoogleSimulada("Fellipe Pontes")}
            >
              <View style={localStyles.avatarCircle}>
                <Text style={localStyles.avatarText}>FP</Text>
              </View>
              <View style={localStyles.accountDetails}>
                <Text style={localStyles.accountName}>Fellipe Pontes</Text>
                <Text style={localStyles.accountEmail}>fellipe.pontes@gmail.com</Text>
              </View>
            </Pressable>

            {/* Conta 2 padrão convidado */}
            <Pressable
              style={localStyles.accountItem}
              onPress={() => selecionarContaGoogleSimulada("Espião Conectado")}
            >
              <View style={[localStyles.avatarCircle, { backgroundColor: "#159947" }]}>
                <Text style={localStyles.avatarText}>EC</Text>
              </View>
              <View style={localStyles.accountDetails}>
                <Text style={localStyles.accountName}>Espião Conectado</Text>
                <Text style={localStyles.accountEmail}>spyon.player@gmail.com</Text>
              </View>
            </Pressable>

            <Pressable
              style={localStyles.modalCancelBtn}
              onPress={() => setShowGoogleModal(false)}
            >
              <Text style={localStyles.modalCancelText}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  )
}

function textColorForConnection(theme: "light" | "dark") {
  return theme === "dark" ? "#F4F7F2" : "#101A13"
}

const createLocalStyles = (theme: "light" | "dark") => {
  const isDark = theme === "dark"
  const surface = isDark ? "#0F1712" : "#FFFFFF"
  const border = isDark ? "#294032" : "#D4E2D7"
  const text = isDark ? "#F4F7F2" : "#101A13"
  const muted = isDark ? "#B7C4BA" : "#526257"

  return StyleSheet.create({
    containerOverride: {
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 24,
    },
    headerContainer: {
      alignItems: "center",
      marginBottom: 40,
    },
    themeToggle: {
      position: "absolute",
      top: 18,
      right: 18,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      minHeight: 42,
      paddingHorizontal: 14,
      borderRadius: 8,
      backgroundColor: surface,
      borderWidth: 1,
      borderColor: border,
      zIndex: 2,
    },
    themeToggleHover: {
      backgroundColor: isDark ? "#15221B" : "#F7F8FA",
      borderColor: isDark ? "#3B4D40" : "#CBD5D0",
    },
    themeToggleText: {
      color: text,
      fontSize: 13,
      fontWeight: "800",
    },
    tagline: {
      color: muted,
      fontSize: 14,
      fontWeight: "600",
      marginTop: 6,
      textAlign: "center",
    },
    optionsContainer: {
      width: "100%",
      maxWidth: 320,
      gap: 16,
    },
    authBtn: {
      flexDirection: "row",
      height: 52,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    googleBtn: {
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: "#D4E2D7",
    },
    googleBtnText: {
      color: "#000000",
      fontSize: 15,
      fontWeight: "700",
    },
    guestBtn: {
      backgroundColor: "#159947",
    },
    guestBtnText: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "700",
    },
    testConnectionBtn: {
      backgroundColor: surface,
      borderWidth: 1,
      borderColor: border,
    },
    testConnectionBtnHover: {
      backgroundColor: isDark ? "#1F2B22" : "#F3F4F6",
      borderColor: isDark ? "#3E5A45" : "#B9C7BC",
    },
    primaryButtonHover: {
      backgroundColor: isDark ? "#1A4A30" : "#157A44",
      transform: [{ scale: 1.02 }],
    },
    googleBtnHover: {
      backgroundColor: "#F7F8FA",
      borderColor: "#A8ADB7",
    },
    guestBtnHover: {
      backgroundColor: "#1D8A4A",
    },
    backBtnHover: {
      backgroundColor: isDark ? "rgba(244,247,242,0.08)" : "rgba(0,0,0,0.05)",
      borderRadius: 8,
    },
    pressedBtn: {
      transform: [{ scale: 0.98 }],
      opacity: 0.95,
    },
    testConnectionText: {
      color: text,
      fontSize: 15,
      fontWeight: "800",
    },
    connectionStatus: {
      color: muted,
      fontSize: 13,
      fontWeight: "700",
      textAlign: "center",
      lineHeight: 18,
    },
    guestFormContainer: {
      width: "100%",
      maxWidth: 340,
      alignItems: "center",
      gap: 14,
    },
    formTitle: {
      color: text,
      fontSize: 18,
      fontWeight: "800",
      marginBottom: 4,
    },
    warningBox: {
      flexDirection: "row",
      backgroundColor: isDark ? "#241F16" : "#FFF7ED",
      borderWidth: 1,
      borderColor: "#D4A373",
      borderRadius: 8,
      padding: 12,
      alignItems: "flex-start",
      width: "100%",
    },
    warningText: {
      color: isDark ? "#E6C594" : "#A16207",
      fontSize: 13,
      fontWeight: "600",
      flex: 1,
      lineHeight: 18,
    },
    inputOverride: {
      width: "100%",
      marginVertical: 4,
    },
    disabledButton: {
      backgroundColor: "#68736B",
      borderColor: "#68736B",
    },
    backBtn: {
      paddingVertical: 10,
    },
    backBtnText: {
      color: muted,
      fontSize: 14,
      fontWeight: "700",
    },
    // Google Account Picker Modal Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.6)",
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
    },
    modalContent: {
      width: "100%",
      maxWidth: 360,
      backgroundColor: "#FFFFFF",
      borderRadius: 16,
      padding: 24,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 5,
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 8,
    },
    modalHeaderTitle: {
      fontSize: 17,
      fontWeight: "800",
      color: "#202124",
    },
    modalSubtitle: {
      fontSize: 14,
      color: "#5f6368",
      marginBottom: 20,
      fontWeight: "600",
    },
    accountItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: "#F1F3F4",
      width: "100%",
    },
    avatarCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "#4285F4",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    avatarText: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "700",
    },
    accountDetails: {
      flex: 1,
    },
    accountName: {
      fontSize: 15,
      fontWeight: "700",
      color: "#3c4043",
    },
    accountEmail: {
      fontSize: 13,
      color: "#5f6368",
      fontWeight: "500",
    },
    modalCancelBtn: {
      marginTop: 18,
      paddingVertical: 8,
      alignSelf: "flex-end",
    },
    modalCancelText: {
      color: "#1a73e8",
      fontSize: 14,
      fontWeight: "700",
    },
  })
}
