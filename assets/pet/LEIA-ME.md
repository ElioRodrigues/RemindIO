# Desenhos do pet

O app carrega estes três arquivos pelo nome exato, em `src/app/(tabs)/inicio.tsx`.
Qual deles aparece vem da saúde calculada em `src/services/pet.ts`, nas mesmas
faixas da cor da barra:

| Arquivo | Quando aparece |
|---|---|
| `saudavel.png` | saúde acima de 60 |
| `abatido.png`  | saúde entre 30 e 60 |
| `doente.png`   | saúde abaixo de 30 |

Todos são **PNG 512x512 com fundo transparente**. O app desenha em 160x160 com
`resizeMode: 'contain'`.

## Como estes arquivos foram preparados

As imagens que o Gemini gerou vieram com o **padrão xadrez desenhado dentro da
imagem** — ele imita a aparência de transparência de um editor, mas são pixels
cinza e branco de verdade. Coladas direto no app, apareceriam com o xadrez.

A limpeza foi feita assim:

1. Marcar como candidato a fundo todo pixel **acinzentado e claro**
   (saturação < 22 e luminosidade > 185)
2. Manter só os candidatos **conectados à borda da imagem** (busca de
   componentes conectados). É esse passo que preserva os brancos internos —
   o branco dos olhos do `abatido` e o termômetro do `doente` não tocam a
   borda, então sobrevivem
3. Suavizar a máscara em 1px, porque o contorno original tinha antialiasing
   contra o xadrez
4. Recortar, deixar quadrado e reduzir para 512x512

Os arquivos originais do Gemini estão em `originais/`, caso precise refazer.

## Para gerar novas versões

- Peça **fundo branco liso**, não "transparente" — o Gemini desenha o xadrez
- Ou peça em PNG e confira se o fundo é realmente transparente antes de usar
- Mesmo estilo 3D da logo: urso roxo, acabamento fosco, luz suave, centralizado
