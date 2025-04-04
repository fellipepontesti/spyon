import { PlayerContextProps, usePlayer } from "@/context/playerInfo";
import { Funcao, PlayerDTO } from "@/dto/playerDTO";

const player = usePlayer()

export function playerPropsToDTO (
  player: PlayerContextProps, socketId: string
): PlayerDTO {
  return { 
    name: player.nomeJogador,
    wins: player.wins,
    funcao: Funcao.EQUIPE,
    socketId
  }
}