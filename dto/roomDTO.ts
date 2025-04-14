import { FuncaoDTO, PlayerDTO } from "./playerDTO"

export interface RoomDTO {
  [key: string]: RoomDataDTO
}

export interface RoomDataDTO {
  jogoIniciado: boolean
  privada: boolean
  password?: string
  codigo: string
  ownerTemp?: string
  socketIdOwner: string
  players: PlayerDTO[]
  quantidadeDeVotacoes: number
  lugar?: number
  votacaoEmAndamento?: boolean
  tentativas: number
  votosContabilizados: VotosContabilizadosData[]
  salaResetada?: boolean
}

export interface VotosContabilizadosData {
  socketPlayer: string
  socketAlvo?: string
  skip: boolean
}

export interface PlayersInRoomDTO extends PlayerDTO {
  funcao: FuncaoDTO
  socketId: string
}

export interface VoltarPraSalaDTO {
  player: PlayerDTO
  codigo: string
}