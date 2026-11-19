// LIMIAR — extensão para o Owlbear Rodeo
// 1) cria as cenas da aventura com o mapa e o grid; 2) monta a cena aberta (névoa por sala,
// personagens, criaturas e itens escondidos); 3) Medidor de Barulho e perseguição para a mesa.
import OBR, {
  buildSceneUpload, buildImageUpload, buildImage, buildShape, buildLabel,
} from "https://cdn.jsdelivr.net/npm/@owlbear-rodeo/sdk@3.1.0/+esm";
import { ANDARES, TOKENS, ITENS, FASES_ZELADOR } from "./data.js";

const ID = "br.limiar.mesa";            // prefixo das chaves de metadados
const BASE = new URL(".", import.meta.url).href;   // endereço do site (GitHub Pages)
const url = (arq) => new URL("assets/" + arq, BASE).href;
const app = document.getElementById("app");

let papel = "PLAYER";
let andarAtual = null;      // "terreo" | "porao" | null
let mapaItem = null;
let estado = { barulho: 0, fuga: 0, captura: 0, jogadores: 3 };

// ---------------- utilidades ----------------
const el = (tag, attrs = {}, ...filhos) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "onclick") e.onclick = v; else if (k === "class") e.className = v; else e.setAttribute(k, v);
  }
  for (const f of filhos) e.append(f);
  return e;
};
const aviso = (txt, tipo = "DEFAULT") => OBR.notification.show(txt, tipo);

async function arquivoDoSite(arq, nome) {
  const r = await fetch(url(arq));
  if (!r.ok) throw new Error("Não achei " + arq);
  const blob = await r.blob();
  return new File([blob], nome, { type: blob.type || "image/png" });
}

function tamanhoImagem(arq) {
  return new Promise((ok, erro) => {
    const img = new Image();
    img.onload = () => ok([img.naturalWidth, img.naturalHeight]);
    img.onerror = () => erro(new Error("Imagem não carregou: " + arq));
    img.src = url(arq);
  });
}

// ---------------- 1. criar as cenas ----------------
async function criarCenas() {
  try {
    const cenas = [];
    for (const [id, a] of Object.entries(ANDARES)) {
      const arquivo = await arquivoDoSite(a.mapa, a.nome + ".png");
      let b = buildImageUpload(arquivo).name(a.nome);
      if (typeof b.dpi === "function") b = b.dpi(a.pxQuadrado);
      else if (typeof b.grid === "function") b = b.grid({ dpi: a.pxQuadrado, offset: { x: 0, y: 0 } });
      if (typeof b.locked === "function") b = b.locked(true);
      const mapa = b.build();
      cenas.push(buildSceneUpload().name(a.nome).baseMap(mapa).gridScale("1.5m").fogFilled(false).build());
    }
    await OBR.assets.uploadScenes(cenas);
    aviso("Cenas enviadas. Abra a cena do Térreo e clique em Montar esta cena.", "SUCCESS");
  } catch (e) {
    console.error(e);
    aviso("Não consegui criar as cenas: " + e.message, "ERROR");
  }
}

// ---------------- 2. montar a cena aberta ----------------
async function acharMapa() {
  const mapas = await OBR.scene.items.getItems((i) => i.layer === "MAP" && i.type === "IMAGE");
  for (const m of mapas) {
    for (const [id, a] of Object.entries(ANDARES)) {
      if (m.image?.width === a.larguraImagem || (m.name || "").includes(a.nome)) return [id, m];
    }
  }
  return [null, null];
}

// converte quadrados do mapa (y para cima) em coordenadas da cena, a partir de onde o mapa está de fato
async function conversor(andar, mapa) {
  const a = ANDARES[andar];
  const dpiCena = await OBR.scene.grid.getDpi();
  const esc = (dpiCena / (mapa.grid?.dpi || a.pxQuadrado)) * (mapa.scale?.x || 1);
  const off = mapa.grid?.offset || { x: 0, y: 0 };
  const x0 = mapa.position.x - off.x * esc;
  const y0 = mapa.position.y - off.y * esc;
  const q = a.pxQuadrado * esc;        // tamanho de 1 quadrado na cena
  const H = a.tamanho[1];
  return { q, dpiCena, pos: (x, y) => ({ x: x0 + x * q, y: y0 + (H - y) * q }) };
}

const meta = (dados) => ({ [ID]: dados });

function nevoaDaSala(sala, c, andar, id) {
  const [x0, y0, x1, y1] = sala.ret;
  let b = buildShape().shapeType("RECTANGLE")
    .width((x1 - x0) * c.q).height((y1 - y0) * c.q)
    .position(c.pos(x0, y1)).layer("FOG")
    .fillColor("#000000").fillOpacity(1).strokeWidth(0).strokeOpacity(0)
    .name("Névoa — " + sala.nome).locked(true)
    .metadata(meta({ montagem: andar, sala: sala.id }));
  if (id) b = b.id(id);
  return b.build();
}

async function imagemToken(chave, x, y, c, andar, visivel) {
  const t = TOKENS[chave];
  const [w, h] = await tamanhoImagem(t.arquivo);
  return buildImage({ width: w, height: h, url: url(t.arquivo), mime: "image/png" },
                    { dpi: t.dpi, offset: { x: t.pe[0], y: t.pe[1] } })
    .position(c.pos(x, y)).layer("CHARACTER").name(t.nome).visible(visivel)
    .metadata(meta({ montagem: andar, token: chave })).build();
}

async function imagemItem(chave, x, y, c, andar) {
  const arq = "itens/" + chave + ".png";
  const [w, h] = await tamanhoImagem(arq);
  return buildImage({ width: w, height: h, url: url(arq), mime: "image/png" },
                    { dpi: 256, offset: { x: w / 2, y: h / 2 } })
    .position(c.pos(x, y)).layer("PROP").name(ITENS[chave]).visible(false)
    .metadata(meta({ montagem: andar, item: chave })).build();
}

async function montar() {
  const [andar, mapa] = await acharMapa();
  if (!andar) return aviso("Não achei um mapa do LIMIAR nesta cena.", "WARNING");
  const ja = await OBR.scene.items.getItems((i) => i.metadata?.[ID]?.montagem === andar);
  if (ja.length) return aviso("Esta cena já está montada. Use Desmontar para refazer.", "WARNING");
  try {
    const a = ANDARES[andar];
    const c = await conversor(andar, mapa);
    const itens = [];
    for (const s of a.salas) if (!s.revelada) itens.push(nevoaDaSala(s, c, andar));
    for (const [txt, x, y] of a.rotulos) {
      itens.push(buildLabel().plainText(txt).position(c.pos(x, y)).visible(false).locked(true)
        .name("Sala " + txt).metadata(meta({ montagem: andar, rotulo: txt })).build());
    }
    for (const [k, x, y] of a.personagens) itens.push(await imagemToken(k, x, y, c, andar, true));
    for (const [k, x, y] of a.criaturas) itens.push(await imagemToken(k, x, y, c, andar, false));
    for (const [k, x, y] of a.itens) itens.push(await imagemItem(k, x, y, c, andar));
    await OBR.scene.items.addItems(itens);
    await OBR.scene.setMetadata(meta({ ...estado, andar }));
    aviso("Cena montada: " + a.nome, "SUCCESS");
    desenhar();
  } catch (e) {
    console.error(e);
    aviso("Erro ao montar: " + e.message, "ERROR");
  }
}

async function desmontar() {
  const ids = (await OBR.scene.items.getItems((i) => i.metadata?.[ID]?.montagem)).map((i) => i.id);
  await OBR.scene.items.deleteItems(ids);
  aviso("Itens do LIMIAR removidos desta cena.");
  desenhar();
}

// revelar = apagar a névoa daquela sala; cobrir = criar de novo
async function alternarSala(sala) {
  const nevoas = await OBR.scene.items.getItems((i) => i.metadata?.[ID]?.sala === sala.id);
  if (nevoas.length) await OBR.scene.items.deleteItems(nevoas.map((i) => i.id));
  else {
    const c = await conversor(andarAtual, mapaItem);
    await OBR.scene.items.addItems([nevoaDaSala(sala, c, andarAtual)]);
  }
  desenhar();
}

async function trocarFaseZelador() {
  const z = await OBR.scene.items.getItems((i) => i.metadata?.[ID]?.token === "zelador");
  if (!z.length) return aviso("O Zelador não está nesta cena.", "WARNING");
  const atual = FASES_ZELADOR.findIndex((f) => z[0].image.url.endsWith(f.arquivo));
  const prox = FASES_ZELADOR[(atual + 1) % FASES_ZELADOR.length];
  await OBR.scene.items.updateItems(z, (lista) => { for (const i of lista) i.image.url = url(prox.arquivo); });
  aviso("Zelador: fase " + prox.nome);
}

// ---------------- 3. Barulho e perseguição ----------------
async function salvar(muda) {
  estado = { ...estado, ...muda };
  await OBR.scene.setMetadata(meta(estado));
}

const ESTADOS = [[3, "CALMA"], [6, "ALERTA"], [9, "CAÇADA"], [10, "DESASTRE"]];
const nomeEstado = (b) => ESTADOS.find(([lim]) => b <= lim)[1];

function blocoBarulho() {
  const gm = papel === "GM";
  const med = el("div", { class: "medidor" });
  for (let i = 0; i <= 10; i++) {
    med.append(el("div", { class: (i <= estado.barulho && i > 0 ? "on" : "") + (i >= 7 && i <= estado.barulho ? " alto" : "") }, String(i)));
  }
  const s = el("section", {}, el("h2", {}, "Medidor de Barulho"), med,
    el("div", { class: "linha" }, el("span", { class: "estado" }, estado.barulho + " — " + nomeEstado(estado.barulho)),
      ...(gm ? [el("button", { onclick: () => salvar({ barulho: Math.max(0, estado.barulho - 1) }) }, "−1"),
                el("button", { onclick: () => salvar({ barulho: Math.min(10, estado.barulho + 1) }) }, "+1")] : [])));
  if (estado.barulho >= 10) s.append(el("p", { class: "dica" }, "Desastre: surge o Perseguidor. Depois, o medidor volta para 6."));
  return s;
}

function blocoPerseguicao() {
  const gm = papel === "GM";
  const maxF = 2 * estado.jogadores + 2;
  const caixas = (n, max, cls) => { const d = el("div", { class: "contador " + cls }); for (let i = 0; i < max; i++) d.append(el("i", { class: i < n ? "on" : "" })); return d; };
  const s = el("section", {}, el("h2", {}, "Perseguição"),
    el("div", { class: "linha" }, el("span", {}, `Fuga ${estado.fuga}/${maxF}`),
      ...(gm ? [el("button", { onclick: () => salvar({ fuga: Math.max(0, estado.fuga - 1) }) }, "−"),
                el("button", { onclick: () => salvar({ fuga: Math.min(maxF, estado.fuga + 1) }) }, "+")] : [])),
    caixas(estado.fuga, maxF, "fuga"),
    el("div", { class: "linha" }, el("span", {}, `Captura ${estado.captura}/4`),
      ...(gm ? [el("button", { onclick: () => salvar({ captura: Math.max(0, estado.captura - 1) }) }, "−"),
                el("button", { onclick: () => salvar({ captura: Math.min(4, estado.captura + 1) }) }, "+")] : [])),
    caixas(estado.captura, 4, "captura"));
  if (gm) {
    const n = el("input", { type: "number", min: "1", max: "6", value: String(estado.jogadores) });
    n.onchange = () => salvar({ jogadores: Math.max(1, Math.min(6, Number(n.value) || 3)), fuga: 0, captura: 0 });
    s.append(el("div", { class: "linha" }, el("span", { class: "dica" }, "Jogadores na mesa"), n,
      el("button", { onclick: () => salvar({ fuga: 0, captura: 0 }) }, "Zerar")));
  }
  if (estado.fuga >= maxF) s.append(el("p", { class: "dica" }, "Fuga completa: o grupo escapou. O Barulho da área volta para 6."));
  if (estado.captura >= 4) s.append(el("p", { class: "dica" }, "Captura completa: ataque anunciado em quem falhou por último; a Captura volta para 2."));
  return s;
}

// ---------------- painel ----------------
let timer = null;
const agendar = () => { clearTimeout(timer); timer = setTimeout(desenhar, 150); };

let desenhando = false;
async function desenhar() {
  if (desenhando) return agendar();
  desenhando = true;
  try { await desenharPainel(); } finally { desenhando = false; }
}

async function desenharPainel() {
  app.innerHTML = "";
  const gm = papel === "GM";
  document.getElementById("papel").textContent = gm ? "narrador" : "jogador";

  if (gm) {
    app.append(el("section", {}, el("h2", {}, "1. Criar as cenas"),
      el("p", { class: "dica" }, "Envia o Térreo e o Porão do Pavilhão 4 para a sua conta, com mapa e grid de 1,5 m. O Owlbear vai pedir uma pasta."),
      el("button", { class: "principal", onclick: criarCenas }, "Criar cenas do Pavilhão 4")));
  }

  const pronta = await OBR.scene.isReady();
  if (!pronta) { app.append(el("p", { class: "dica" }, "Abra uma cena para ver o resto do painel.")); return; }

  [andarAtual, mapaItem] = await acharMapa();
  if (gm) {
    const montados = andarAtual ? await OBR.scene.items.getItems((i) => i.metadata?.[ID]?.montagem === andarAtual) : [];
    const s = el("section", {}, el("h2", {}, "2. Montar a cena aberta"));
    if (!andarAtual) s.append(el("p", { class: "dica" }, "Esta cena não tem um mapa do LIMIAR."));
    else if (!montados.length) {
      s.append(el("p", { class: "dica" }, `Mapa reconhecido: ${ANDARES[andarAtual].nome}. Coloca névoa em cada sala, os personagens, as criaturas e os itens (escondidos).`),
        el("button", { class: "principal", onclick: montar }, "Montar esta cena"));
    } else {
      s.append(el("p", { class: "dica" }, "Cena montada. Itens e criaturas escondidos aparecem só para você, meio transparentes."),
        el("div", { class: "linha" },
          ...(andarAtual === "porao" ? [el("button", { onclick: trocarFaseZelador }, "Próxima fase do Zelador")] : []),
          el("button", { onclick: desmontar }, "Desmontar")));
      const lista = el("div", { class: "salas" });
      for (const sala of ANDARES[andarAtual].salas) {
        const coberta = montados.some((i) => i.metadata[ID].sala === sala.id);
        lista.append(el("div", { class: "linha" }, el("span", {}, sala.nome),
          el("button", { onclick: () => alternarSala(sala) }, coberta ? "Revelar" : "Cobrir")));
      }
      app.append(s, el("section", {}, el("h2", {}, "Névoa por sala"), lista));
      return blocoFinal();
    }
    app.append(s);
  }
  blocoFinal();
}

function blocoFinal() {
  app.append(blocoBarulho(), blocoPerseguicao());
}

OBR.onReady(async () => {
  papel = await OBR.player.getRole();
  const lerEstado = async () => {
    if (await OBR.scene.isReady()) {
      const m = (await OBR.scene.getMetadata())[ID];
      if (m) estado = { ...estado, ...m };
    }
  };
  await lerEstado();
  desenhar();
  OBR.scene.onReadyChange(async () => { await lerEstado(); desenhar(); });
  OBR.scene.onMetadataChange((m) => { if (m[ID]) { estado = { ...estado, ...m[ID] }; desenhar(); } });
  OBR.scene.items.onChange(() => { if (papel === "GM") agendar(); });
  OBR.player.onChange(async (p) => { if (p.role !== papel) { papel = p.role; desenhar(); } });
});
