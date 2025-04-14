import { createContext, useContext, useEffect, useState } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { getObjectDataAsyncStorage } from "@/storage/getData"
import { PlayerDTO } from "@/dto/playerDTO"
import { socket } from "@/services/socket"

export interface PlayerContextProps {
  player: PlayerDTO
  setNome: (nome: string) => void
  setVitorias: (vitorias: number) => void
  setSocketId: (id: string | undefined) => void
}

const PlayerContext = createContext<PlayerContextProps | undefined>(undefined)

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [nome, setNome] = useState<string>("")
  const [vitorias, setVitorias] = useState<number>(0)
  const [socketId, setSocketIdState] = useState<string | undefined>(undefined)

  useEffect(() => {
    async function carregarPlayer() {
      const player = await getObjectDataAsyncStorage("player")

      if (player) {
        setNome(player.nome)
        setVitorias(player.vitorias || 0)
      }
    }
    carregarPlayer()
  }, [])

  async function salvarNome(nome: string) {
    await AsyncStorage.setItem("player", JSON.stringify({ nome, vitorias }))
    setNome(nome)
  }

  async function salvarVitorias(novoWins: number) {
    await AsyncStorage.setItem("player", JSON.stringify({ nome, vitorias: novoWins }))
    setVitorias(novoWins)
  }

  const player: PlayerDTO = {
    nome,
    vitorias,
    socketId: socket.id || '',
    lugar: undefined,
    inicia: undefined,
    aceitarVotacao: undefined
  }

  return (
    <PlayerContext.Provider
      value={{
        player,
        setNome: salvarNome,
        setVitorias: salvarVitorias,
        setSocketId: setSocketIdState
      }}
    >
      {children}
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  const context = useContext(PlayerContext)
  if (!context) {
    throw new Error("usePlayer deve ser usado dentro de um PlayerProvider")
  }
  return context
}
