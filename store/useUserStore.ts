import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

type UserState = {
  nome: string | null
  vitorias: number
  tipoLogin: 'google' | 'convidado' | null
  setUser: (nome: string, tipoLogin: 'google' | 'convidado') => void
  incrementaVitoria: () => void
  logout: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      nome: null,
      vitorias: 0,
      tipoLogin: null,
      setUser: (nome, tipoLogin) => set({ nome, tipoLogin, vitorias: 0 }),
      incrementaVitoria: () =>
        set((state) => {
          if (state.tipoLogin === 'convidado') {
            return state // Dados de convidado não são salvos (vitórias não acumulam)
          }
          return { vitorias: state.vitorias + 1 }
        }),
      logout: () => set({ nome: null, vitorias: 0, tipoLogin: null }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)
