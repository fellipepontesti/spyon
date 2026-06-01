import AsyncStorage from "@react-native-async-storage/async-storage"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

export type Friend = {
  id: string
  nome: string
}

export type FriendMessage = {
  id: string
  friendId: string
  texto: string
  enviadoPorMim: boolean
  createdAt: number
}

type FriendsState = {
  amigos: Friend[]
  mensagens: FriendMessage[]
  adicionarAmigo: (nome: string) => void
  removerAmigo: (id: string) => void
  enviarMensagem: (friendId: string, texto: string) => void
}

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

export const useFriendsStore = create<FriendsState>()(
  persist(
    (set) => ({
      amigos: [],
      mensagens: [],
      adicionarAmigo: (nome) =>
        set((state) => {
          const nomeLimpo = nome.trim()

          if (!nomeLimpo) {
            return state
          }

          const amigoJaExiste = state.amigos.some(
            (amigo) => amigo.nome.toLowerCase() === nomeLimpo.toLowerCase()
          )

          if (amigoJaExiste) {
            return state
          }

          return {
            amigos: [
              ...state.amigos,
              {
                id: createId(),
                nome: nomeLimpo,
              },
            ],
          }
        }),
      removerAmigo: (id) =>
        set((state) => ({
          amigos: state.amigos.filter((amigo) => amigo.id !== id),
          mensagens: state.mensagens.filter((mensagem) => mensagem.friendId !== id),
        })),
      enviarMensagem: (friendId, texto) =>
        set((state) => {
          const textoLimpo = texto.trim()

          if (!textoLimpo) {
            return state
          }

          return {
            mensagens: [
              ...state.mensagens,
              {
                id: createId(),
                friendId,
                texto: textoLimpo,
                enviadoPorMim: true,
                createdAt: Date.now(),
              },
            ],
          }
        }),
    }),
    {
      name: "friends-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)
