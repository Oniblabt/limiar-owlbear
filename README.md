# LIMIAR — Mesa automática (extensão do Owlbear Rodeo)

Monta a aventura **O Pavilhão 4** do kit de jogo rápido do LIMIAR:

1. **Criar cenas:** envia o Térreo e o Porão para a sua conta, com o mapa e o grid de 1,5 m.
2. **Montar esta cena:** com a cena aberta, coloca névoa em cada sala, os 5 personagens na Recepção, as criaturas e os itens nos lugares da aventura (escondidos, só o narrador vê).
3. **Durante o jogo:** revelar ou cobrir cada sala, trocar a fase do Zelador, Medidor de Barulho e contadores de Fuga e Captura (os jogadores veem; só o narrador mexe).

## Publicar no GitHub Pages

1. Crie um repositório público no GitHub (por exemplo, `limiar-owlbear`).
2. Envie **todo o conteúdo desta pasta** para a raiz do repositório (Add file > Upload files, arraste tudo, Commit).
3. No repositório: Settings > Pages > Source: *Deploy from a branch* > Branch: `main` / pasta `/ (root)` > Save.
4. Depois de 1 ou 2 minutos, o site fica em `https://SEU-USUARIO.github.io/limiar-owlbear/`.
5. Confira se `https://SEU-USUARIO.github.io/limiar-owlbear/manifest.json` abre no navegador.

## Instalar na sala do Owlbear

1. Abra a sala, clique no ícone de extensões (peça de quebra-cabeça) > **Add Custom Extension**.
2. Cole o endereço do `manifest.json` e confirme.
3. Ative a extensão. O ícone do LIMIAR aparece no canto superior esquerdo.

## Como usar

1. Clique em **Criar cenas do Pavilhão 4** e escolha uma pasta.
2. Abra a cena do Térreo e clique em **Montar esta cena**. Faça o mesmo no Porão.
3. Revele as salas conforme o grupo entra. Criaturas e itens escondidos: clique com o botão direito > **Show** quando aparecerem.

## Arquivos

- `manifest.json`: dados da extensão.
- `index.html`, `style.css`, `app.js`: o painel.
- `data.js`: posições de salas, tokens e itens, em quadrados (mude aqui para ajustar).
- `assets/`: mapas, tokens e ícones renderizados no Blender.

O SDK do Owlbear é carregado do jsDelivr, então não precisa instalar nada nem compilar.
