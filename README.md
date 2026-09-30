# Trilha do Imperador — Alagoas

Aplicação web estática com mapa interativo da Trilha do Imperador, de Piaçabuçu a Água Branca.

## Recursos

- mapa interativo com Leaflet + OpenStreetMap;
- 11 cidades apresentadas em sequência;
- marcadores numerados;
- seleção manual de cada cidade;
- modo automático "Percorrer rota";
- destaque progressivo do percurso;
- seleção do traçado esquemático, da rota de moto em asfalto ou da rota mista para bike fornecidas em GPX;
- layout responsivo para desktop e celular;
- compatível com GitHub Pages;
- sem backend e sem etapa de build.

## Publicar no GitHub Pages

1. Crie um repositório no GitHub.
2. Envie `index.html`, `style.css` e `app.js` para a raiz do repositório.
3. Abra **Settings → Pages**.
4. Em **Build and deployment**, selecione **Deploy from a branch**.
5. Escolha a branch `main` e a pasta `/ (root)`.
6. Salve.

Após a publicação, o GitHub exibirá a URL do site.

## Observação sobre a rota

A visão geral conecta as sedes municipais para representar visualmente a sequência da Trilha do Imperador. Essa linha é esquemática e não deve ser utilizada como track GPS ou instrução de navegação. As opções "Moto · Asfalto" e "Bike · Misto" usam, respectivamente, os arquivos `rota-moto-asfalto.gpx` e `rota-bike-misto.gpx` fornecidos pelo autor do projeto; os marcadores das cidades continuam nas coordenadas de referência originais.

A referência pública consultada no desenvolvimento descreve um track Piaçabuçu → Água Branca com aproximadamente 349,85 km.

## Cidades representadas

1. Piaçabuçu
2. Penedo
3. Porto Real do Colégio
4. São Brás
5. Traipu
6. Belo Monte
7. Pão de Açúcar
8. Piranhas
9. Olho d’Água do Casado
10. Delmiro Gouveia
11. Água Branca


## Pontos de placa já verificados

| Cidade | Latitude | Longitude | Elevação |
|---|---:|---:|---:|
| Piaçabuçu | -10.407753 | -36.435382 | 0 m |
| Penedo | -10.290822 | -36.586380 | 7 m |
| Porto Real do Colégio | -10.188428 | -36.839223 | 6 m |
| Traipu | -9.971902 | -37.001545 | 8 m |
| Pão de Açúcar | -9.750112 | -37.435620 | 11 m |


## Tecnologias

- HTML
- CSS
- JavaScript
- Leaflet 1.9.4
- OpenStreetMap

## Licença / dados cartográficos

Os tiles de mapa são fornecidos pelo OpenStreetMap e devem manter a atribuição visível.
