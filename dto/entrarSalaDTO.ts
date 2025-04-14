import { PlayerDTO } from "./playerDTO"

export interface EntrarSalaDTO {
  codigo: string
  player: PlayerDTO
  password?: string
  byPass?: boolean
}