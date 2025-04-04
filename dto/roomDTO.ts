import { Funcao, PlayerDTO } from "./playerDTO"

export interface RoomDTO {
  [key: string]: RoomDataDTO
}

export interface RoomDataDTO {
  privada: boolean
  password: string
  codigo: string
  socketIdOwner: string
  players: PlayerDTO[]
  quantidadeDeVotacoes: number
  begin?: string
}

export interface PlayersInRoomDTO extends PlayerDTO {
  funcao: Funcao
  socketId: string
}