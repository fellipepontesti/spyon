export interface PlayerDTO {
  nome: string
  vitorias: number
  funcao?: FuncaoDTO
  socketId: string
  lugar?: number
  inicia?: boolean
  aceitarVotacao?: boolean
}

export enum FuncaoDTO {
  ESPIAO = 0,
  EQUIPE = 1
}