import { RoomDataDTO } from "@spyon/dto/roomDTO";

export interface ListarSalasOutputDTO {
  salas: RoomDataDTO[],
  count: number,
  page: number
}