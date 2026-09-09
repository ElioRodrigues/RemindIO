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

## Como o fundo foi removido

As imagens de origem vinham com o **padrão xadrez desenhado dentro da imagem**.
O xadrez imita a aparência de transparência de um editor, mas são pixels cinza e
branco de verdade — colados direto no app, apareceriam na tela.

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

## Se precisar de novas versões

Mesmo estilo dos atuais: urso roxo em 3D, acabamento fosco, luz suave,
centralizado, **fundo branco liso** (fundo pedido como "transparente" costuma
voltar com o xadrez desenhado) e exportado como PNG 512x512.
