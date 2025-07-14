import { RoomDataDTO } from "./roomDTO";

export interface ListarSalasOutputDTO {
  salas: RoomDataDTO[],
  count: number,
  page: number
}