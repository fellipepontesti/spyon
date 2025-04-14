import { createContext, useContext, useEffect, useState } from "react"
import { socket } from "@/services/socket"
import { router } from "expo-router"
import { RoomDataDTO } from "@/dto/roomDTO"

type SalaContextData = {
  sala: RoomDataDTO | null
  setSala: (sala: RoomDataDTO | null) => void
  solicitarSala: (codigo: string) => void
}

const SalaContext = createContext<SalaContextData>({} as SalaContextData)

export function SalaProvider({ children }: { children: React.ReactNode }) {
  const [sala, setSala] = useState<RoomDataDTO | null>(null)

  function solicitarSala(codigo: string) {
    socket.emit("jogoEmAndamento", codigo)
  }

  useEffect(() => {
    const handleAtualizarSala = (novaSala: RoomDataDTO) => {
      setSala(novaSala)
    }

    const handleJogoIniciado = (sala: RoomDataDTO) => {
      setSala(sala)
      router.replace({ pathname: "/mostrarFuncao", params: { data: JSON.stringify(sala) }})
    }

    socket.on("atualizarSala", handleAtualizarSala)
    socket.on("jogoIniciado", handleJogoIniciado)

    return () => {
      socket.off("atualizarSala", handleAtualizarSala)
      socket.off("jogoIniciado", handleJogoIniciado)
    }
  }, [])

  return (
    <SalaContext.Provider value={{ sala, setSala, solicitarSala }}>
      {children}
    </SalaContext.Provider>
  )
}

export function useSala() {
  return useContext(SalaContext)
}
