import { createContext, useContext, useEffect, useState } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { getObjectDataAsyncStorage } from "@/storage/getData"

export interface PlayerContextProps {
  nomeJogador: string
  wins: number
  setNomeJogador: (nome: string) => void
  setWins: (wins: number) => void
}

const PlayerContext = createContext<PlayerContextProps | undefined>(undefined)

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [nomeJogador, setNomeJogador] = useState<string>('')
  const [wins, setWins] = useState<number>(0)

  
  useEffect(() => {
    async function carregarPlayerData() {
      const playerData = await getObjectDataAsyncStorage("playerData")

      if (playerData) {
        setNomeJogador(playerData.nomeJogador)
        setWins(playerData.wins || 0)
      } 
    }
    carregarPlayerData()
  }, [])

  
  async function salvarNome(nome: string) {
    await AsyncStorage.setItem("playerData", JSON.stringify({ nomeJogador: nome, wins }))
    setNomeJogador(nome)
  }

  async function salvarWins(novoWins: number) {
    await AsyncStorage.setItem("playerData", JSON.stringify({ nomeJogador, wins: novoWins }))
    setWins(novoWins)
  }

  useEffect(() => {
    const verificarMudancas = async () => {
      const playerData = await getObjectDataAsyncStorage("playerData")
      if (playerData) {
        setNomeJogador(playerData.nomeJogador)
        setWins(playerData.wins || 0)
      }
    }

    const intervalo = setInterval(verificarMudancas, 1000) 
    return () => clearInterval(intervalo) 
  }, [])

  return (
    <PlayerContext.Provider value={{ nomeJogador, wins, setNomeJogador: salvarNome, setWins: salvarWins }}>
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
