// Dados da aventura O Pavilhão 4 (kit de jogo rápido do LIMIAR).
// Tudo em QUADRADOS do grid, contando a partir do canto de baixo à esquerda do mapa
// (o mesmo sistema do script do Blender: x para a direita, y para cima). 1 quadrado = 1,5 m.

export const TOKENS = {
  // dpi = quantos pixels da imagem cabem em 1 quadrado; pe = ponto dos pés na imagem (onde o token "pisa")
  rui:      { nome: "Rui Tavares",  arquivo: "tokens/rui.png",      dpi: 512, pe: [512, 950] },
  ana:      { nome: "Ana Ribeiro",  arquivo: "tokens/ana.png",      dpi: 512, pe: [512, 950] },
  celso:    { nome: "Celso Amaral", arquivo: "tokens/celso.png",    dpi: 512, pe: [512, 950] },
  joana:    { nome: "Joana Kato",   arquivo: "tokens/joana.png",    dpi: 512, pe: [512, 950] },
  davi:     { nome: "Davi Lopes",   arquivo: "tokens/davi.png",     dpi: 512, pe: [512, 950] },
  paciente: { nome: "Paciente sedado", arquivo: "tokens/paciente.png", dpi: 512, pe: [512, 950] },
  cao:      { nome: "Cão deformado",   arquivo: "tokens/cao.png",      dpi: 512, pe: [512, 960] },
  teto:     { nome: "Coisa do teto",   arquivo: "tokens/teto.png",     dpi: 512, pe: [512, 700] },
  zelador:  { nome: "O Zelador",       arquivo: "tokens/zelador_caca.png", dpi: 256, pe: [512, 960] },
  coletor:  { nome: "O Coletor",       arquivo: "tokens/coletor.png",  dpi: 256, pe: [512, 960] },
};

export const FASES_ZELADOR = [
  { nome: "Caça", arquivo: "tokens/zelador_caca.png" },
  { nome: "Fúria", arquivo: "tokens/zelador_furia.png" },
  { nome: "Desespero", arquivo: "tokens/zelador_desespero.png" },
];

// Ícones de item: 256 px por quadrado
export const ITENS = {
  municao_pistola: "Munição de pistola", polvora: "Pólvora", polvora_potente: "Pólvora potente",
  cura: "Cura simples", antidoto: "Antídoto", kit_medico: "Kit médico", sedativo: "Sedativo",
  amplificador: "Amplificador", escopeta: "Escopeta (3 cartuchos)", cartuchos: "Cartuchos de escopeta",
  granada_de_luz: "Granada de luz", chave_antiga: "Chave da Ala de Isolamento", bateria_gerador: "Bateria do gerador",
};

export const ANDARES = {
  terreo: {
    nome: "LIMIAR — Pavilhão 4 — Térreo",
    mapa: "mapas/pavilhao4_terreo.png",
    larguraImagem: 3072,          // usada para reconhecer o mapa na cena
    tamanho: [24, 14],            // em quadrados
    pxQuadrado: 128,              // pixels do mapa por quadrado
    // salas: id, nome, número do mapa do narrador, retângulo [x0, y0, x1, y1], começa revelada?
    salas: [
      { id: "corredor",   nome: "1. Corredor Leste",      ret: [0, 6, 24, 8] },
      { id: "recepcao",   nome: "2. Recepção",            ret: [0, 8, 6, 14], revelada: true },
      { id: "enfermaria", nome: "3. Enfermaria",          ret: [6, 8, 12, 13] },
      { id: "farmacia",   nome: "4. Farmácia",            ret: [12, 8, 16, 12] },
      { id: "diretoria",  nome: "5. Diretoria",           ret: [16, 8, 21, 13] },
      { id: "refugio",    nome: "6. Refúgio",             ret: [1, 2, 5, 6] },
      { id: "isolamento", nome: "7. Ala de Isolamento",   ret: [8, 4, 16, 6] },
      { id: "q10",        nome: "7. Quarto 10",           ret: [5, 3, 8, 6] },
      { id: "q11",        nome: "7. Quarto 11",           ret: [9, 1, 12, 4] },
      { id: "q12",        nome: "7. Quarto 12",           ret: [12, 1, 15, 4] },
      { id: "q13",        nome: "7. Quarto 13",           ret: [16, 3, 19, 6] },
      { id: "escada",     nome: "8. Escada",              ret: [22, 3, 24, 6] },
    ],
    rotulos: [["1", 20, 7], ["2", 1.07, 8.8], ["3", 9.07, 9], ["4", 14.4, 8.6], ["5", 20.2, 8.8], ["6", 1.6, 2.67],
              ["7", 9.33, 5], ["Q10", 6.5, 4.27], ["Q11", 10.5, 2.27], ["Q12", 13.5, 2.27], ["Q13", 17.67, 5.07], ["8", 23, 5.47]],
    // personagens dos jogadores (visíveis), na Recepção
    personagens: [["rui", 1.0, 9.0], ["ana", 2.0, 9.0], ["celso", 1.0, 10.2], ["joana", 2.0, 10.2], ["davi", 1.0, 12.8]],
    // criaturas (escondidas: só o narrador vê até revelar)
    criaturas: [["paciente", 3.7, 9.6], ["paciente", 8.0, 7.0], ["paciente", 18.0, 7.0], ["teto", 10.1, 10.2],
                ["cao", 10.0, 2.5], ["cao", 11.2, 2.3], ["coletor", 22.6, 7.0]],
    // itens (escondidos)
    itens: [["municao_pistola", 2.6, 11.7], ["polvora", 9.5, 6.4],
            ["cura", 10.2, 8.5], ["cura", 10.8, 8.5], ["antidoto", 11.4, 8.5],
            ["kit_medico", 13.2, 9.6], ["sedativo", 14.0, 9.2], ["amplificador", 14.0, 10.0],
            ["escopeta", 17.2, 12.3], ["cartuchos", 17.8, 12.3], ["granada_de_luz", 18.4, 12.3], ["chave_antiga", 16.6, 11.8],
            ["cura", 6.5, 4.5], ["bateria_gerador", 17.5, 4.5], ["polvora_potente", 18.3, 4.0]],
  },
  porao: {
    nome: "LIMIAR — Pavilhão 4 — Porão",
    mapa: "mapas/pavilhao4_porao.png",
    larguraImagem: 1280,
    tamanho: [10, 8],
    pxQuadrado: 128,
    salas: [
      { id: "caldeiras", nome: "9. Casa das Caldeiras", ret: [2, 0, 7, 8] },
      { id: "caldeiras_sul", nome: "9. Caldeiras (canto da escada)", ret: [0, 0, 2, 5] },
      { id: "elevador", nome: "9. Atrás da grade (elevador)", ret: [7, 0, 10, 8] },
    ],
    rotulos: [["9", 3, 7.3]],
    personagens: [],
    criaturas: [["zelador", 4.0, 4.8]],
    itens: [],
  },
};
