import { PlayerDTO } from "@spyon/dto/playerDTO"

export interface EntrarSalaDTO {
  codigo: string
  player: PlayerDTO
  password?: string
  byPass?: boolean
  owner?: boolean
}