export function setMessageFuncao(lugar: string): string {
  const femininos = ['1', '8', '10', '12', '17', '25']

  const nomeDoLugar = getLugar(lugar)
  if (femininos.includes(lugar)) {
    return `O jogo vai acontecer na ${nomeDoLugar}!`
  }

  return `O jogo vai acontecer no ${nomeDoLugar}!`
}

function getLugar(lugar: string): string {
  switch (lugar) {
    case '1': return 'Praia'
    case '2': return 'Avião'
    case '3': return 'Foguete'
    case '4': return 'Navio'
    case '5': return 'Carro'
    case '6': return 'Parque de diversões'
    case '7': return 'Submarino'
    case '8': return 'Estação espacial'
    case '9': return 'Circo'
    case '10': return 'Floresta'
    case '11': return 'Deserto'
    case '12': return 'Fazenda'
    case '13': return 'Cruzeiro'
    case '14': return 'Estadio'
    case '15': return 'Metro'
    case '16': return 'Museu'
    case '17': return 'Escola'
    case '18': return 'Banco'
    case '19': return 'Hospital'
    case '20': return 'Cinema'
    case '21': return 'Laboratório'
    case '22': return 'Shopping'
    case '23': return 'Restaurante'
    case '24': return 'Escritório'
    default: return 'Delegacia'
  }

}
