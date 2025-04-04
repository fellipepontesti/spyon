import { io } from "socket.io-client"
import { CriarSalaDTO } from "@/dto/criarSalaDTO"
import { EntrarSalaDTO } from "@/dto/entrarSalaDTO"

const SERVER_URL = "http://192.168.0.15:3000"
export const socket = io(SERVER_URL, { transports: ["websocket"] })

export const criarSala = (data: CriarSalaDTO) => {
  socket.emit("criarSala", data)
}

export const entrarSala = (codigo: string, nomeJogador: string, wins: number, password?: string) => {
  const data: EntrarSalaDTO = { nomeJogador, wins, codigo, password }
  socket.emit("entrarSala", data)
}

export const enviarMensagem = (salaId: string, mensagem: string) => {
  socket.emit("mensagem", { salaId, mensagem })
}

socket.on("novaMensagem", (dados: { jogador: string, mensagem: string }) => {
  console.log(`Nova mensagem de ${dados.jogador}: ${dados.mensagem}`)
})

export const desconectar = (codigo: string) => {
  socket.emit("sairDaSala", codigo)
}

export const iniciarJogo = (codigo: string) => {
  socket.emit("iniciarJogo", codigo)
}

export const abrirVotacao = (codigo: string) => {
  socket.emit("abrirVotacao", codigo)
}

// socket.on("atualizarSala", (jogadores: string[]) => {
//   console.log("Jogadores na sala:", jogadores)
// })


