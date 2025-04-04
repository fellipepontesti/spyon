export interface PlayerDTO {
  name: string
  wins: number
  funcao: Funcao
  socketId: string
  lugar?: number
  begin?: boolean
}

export enum Funcao {
  ESPIAO = 0,
  EQUIPE = 1
}