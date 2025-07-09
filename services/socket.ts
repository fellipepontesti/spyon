import { io } from "socket.io-client"
import { CriarSalaDTO } from "@/dto/criarSalaDTO"
import { EntrarSalaDTO } from "@/dto/entrarSalaDTO"
import { PlayerDTO } from "@/dto/playerDTO"

const SERVER_URL = "http://192.168.0.3:3000"
export const socket = io(SERVER_URL, { transports: ["websocket"] })

export const criarSala = (data: CriarSalaDTO) => {
  socket.emit("criarSala", data)
}

export const entrarSala = (codigo: string, player: PlayerDTO, password?: string) => {
  const data: EntrarSalaDTO = { player, codigo, password }
  socket.emit("entrarSala", data)
}

export const voltarPraSala = (codigo: string, player: PlayerDTO) => {
  socket.emit("voltarPraSala", { codigo, player })
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

export const aceitarDiscussao = (codigo: string) => {
  socket.emit("votarNaDiscussao", {codigo, discussao: true})
}

export const recusarDiscussao = (codigo: string) => {
  socket.emit("votarNaDiscussao", {codigo, discussao: false})
}

export const iniciarJogo = (codigo: string) => {
  socket.emit("iniciarJogo", codigo)
}

export const pedirDiscussao = (codigo: string) => {
  socket.emit("pedirDiscussao", codigo)
}

