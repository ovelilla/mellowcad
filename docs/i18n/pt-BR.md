# Brazilian Portuguese (`pt-BR`)

> **Command language:** `localized`, Brazilian Portuguese AutoCAD's. **Status:** `live` since
> 31/10/2026, at `/pt-br` (a `draft` earlier that day): the site, the editor, the four "Use" pages,
> the engine's interface and its command language, complete ("Command language", below), checked
> before going live against AutoCAD 2027.1 (26.0.116), and reviewed again on 31/10/2026 (skill
> `language-review`) against the installed 26.0.118, whose `pt-BR` resources are still 26.0.116's.
> **Review:** none by a native speaker; what no console or desktop probe settled is **no** or
> **unverified** below.

The words are Autodesk's own Brazilian Portuguese localization of AutoCAD, never a translation of
ours, as Spanish's are (`es.md`). The language is Brazil's, and `LANGUAGE_NAMES` says so
(«Português (Brasil)»), so a reader from Portugal sees it before choosing it.

## Sources

- **Language pack.** Autodesk ships AutoCAD 2027 in Brazilian Portuguese (culture `pt-BR`, one of
  the 14 in `CULTURES`): `Autodesk_AutoCAD_2027_Brazilian_Portuguese_Language_Pack.exe`, 246 MB,
  build 26.0.60.0, at
  `https://up1.autodesk.com/prd/2027/ACD/BBB8442F-0522-3CED-B0A2-D1852FF65B2B/` (linked from the
  forum thread "2027 Product download links").
- **The tables come from the update, not the pack.** The pack is the release build; 2027.1
  (`AutoCAD_2027.1_Update.exe`, build 26.0.116.0, at
  `https://up1.autodesk.com/prd/2027/ACD/DB48EE8C-BA9A-332A-9F6F-3F6296E95477/`) carries every
  culture's resource DLLs whole and rewords 101 of pt-BR's strings (86 in `acadres`, 15 in
  `AcDimRes`: `extremidade` → `ponto final`, the Endpoint wording). Its Spanish DLLs are the
  installed AutoCAD's byte for byte, so the update is the installed product.
  `scripts/research/open-pack.sh --lang pt-BR <update.exe> <pack.exe>` extracts both; the tables
  in `research/strings/` (`all_pt-BR.tsv`, `acad_pt-BR.pgp`…) are 2027.1's.
- **Help.** `https://help.autodesk.com/cloudhelp/2027/PTB/AutoCAD-Core/files/GUID-<id>.htm`
  answers with the English GUIDs (`GUID-50383F73-…` is «Guia Snap ao objeto (caixa de diálogo
  Configurações do desenho)»). The help MCP with `pt_BR` answers in English: search in English,
  read in `PTB`.
- **The pack's interface.** The palettes, dialogs, menus and ribbon are not in the tables: they
  come from the pack's own DLLs (`x64/pt-BR/acadlp/acadlp.adix` and `acadsharedlp.adix`, zips
  inside the `.exe`) and its `acad.cuix` (`x64/pt-BR/acadps/PF/Root/UserDataCache/Support/`),
  each paired by id with the installed English one (`en-US/`, `UserDataCache/en-us/`; skill
  `autocad-research`). Below, `P <dll> <id>` is a string table (`strtable.mjs`), `D <dll>` a
  dialog's label, `N <dll> <key>` a .NET resource, `X <uid>` an element of `acad.cuix`, `C <guid>`
  the PTB help page. They are the release build's: 2027.1 rewords prompts in `acadres` and
  `AcDimRes`, not these. Since the pack is installed, the review of 31/10/2026 read them from the
  install instead (`pt-BR/` beside `en-US/`, `UserDataCache/pt-br/`), dialogs by control id
  (`D <dll> <dialog>`).
- **Console:** the pack is installed on the owner's AutoCAD since 31/10/2026, with 2027.1 applied
  again after it (`pt-BR/acadres.dll` 26.0.116, as Spanish's); its tables are the ones
  `open-pack.sh` extracted, byte for byte. `runacc.sh … pt-BR` and `probe.sh --lang pt-BR` run its
  console. **Desktop:** `acad.exe /language pt-BR` ("The desktop, and an answer against the colon",
  below).

## Deviations

- **The URL is `/pt-br`**, the tag `pt-BR` everywhere else (catalogs, `lang`, `hreflang`;
  `og:locale` `pt_BR`): `localePrefix.prefixes` in `i18n/routing.ts`, the `[locale]` segment
  carrying the prefix and `segmentLocale` mapping it back to the tag. `/pt-BR/…` is not served:
  nothing links to it, and Next matches routes without case, so a redirect from it would loop.
- **The editor's catalog exports `ptBR`** (`@mellowcad/editor/locales/pt-BR`), since a tag with a
  hyphen is no identifier (`catalogExport`, `scripts/locales/compile.ts`).

## Interface terms

| Area | English | Brazilian Portuguese | Source | Verified |
| --- | --- | --- | --- | --- |
| Object snaps | Endpoint, Midpoint, Center, Intersection, Apparent intersection | Ponto final, Meio, Centro, Intersecção, Intersecção aparente | P acadres 70–80 (2027.1's: «Extremidade» became «Ponto final»), C 50383F73-4F23-4F70-B4FC-52D5748D80AF | yes |
|  | Perpendicular, Tangent, Insertion, Extension, Parallel, Quadrant, Nearest | Perpendicular, Tangente, Inserção, Extensão, Paralela, Quadrante, Mais próximo | P acadres 77–79, 7544, 32998, 20670; X PM_0001 | yes |
|  | From, Point Filters, None (the snap menu) | De, Filtros de ponto, Nenhum | X PM_0001, ACAD_1863 | yes |
| Status bar | Object snap, Object snap tracking, Polar tracking | Snap ao objeto, Rastreamento de snap ao objeto, Rastreamento polar | P acadres 20022, 20026, 20029 | yes |
|  | Ortho mode, Grid, Snap mode | Modo Orto, Grade, Modo snap | C E3B34B0A-EA98-45E9-937A-BF5FEF4152DB («modo Orto» in its shortcut pages; the tooltip says «Modo Ortogonal», P acadres 20023), P acadres 20020 | yes |
|  | Snap X spacing, Polar distance, Grid snap, Polar snap, Increment angle | Espaçamento X do snap, Distância polar, Snap à grade, Snap polar, Ângulo de incremento | D dwgaidsRes (Drafting Settings) | yes |
|  | Object snap settings, Snap settings | Configurações de snap ao objeto, Configurações de snap | X ACAD_15, T:XLSR_0955 («Configurações de osnap…» in the menu) | partial |
|  | Selection cycling; Display selection list box; its Selection, None | Ciclo de seleção; Exibir a caixa de listagem de navegação na seleção; Seleção, Nenhum | P dwgaidsRes 1317, D dwgaidsRes | yes (Seleção, Nenhum partial) |
|  | Show lineweight, Dynamic input, Coordinates, Clean screen, Units, Customization | Mostrar espessura de linha, Entrada dinâmica, Coordenadas, Limpar tela, Unidades, Personalização | P acadres 20049, 20051, 20019, 20059; C E3B34B0A-EA98-45E9-937A-BF5FEF4152DB | yes |
|  | Model space, MODEL | Espaço do modelo, MODELO | P acadres 20008, N AcWindows SPACE_MODEL_CUST_NAME | yes |
| Drawing units | Drawing Units; Length, Type, Precision, Decimal; Insertion scale; Units to scale inserted content; Sample output | Unidades do desenho; Comprimento, Tipo, Precisão, Decimal; Escala de inserção; Unidades para redimensionar conteúdo inserido; Exemplo | D unitsRes, C 75419F91-18B8-47EE-9272-3196ACC95977 | yes |
|  | Millimeters, Centimeters, Meters; OK, Cancel | Milímetros, Centímetros, Metros; OK, Cancelar | C A58A87BB-482B-4042-A00A-EEF55A2B4FD8, D unitsRes | yes |
| Ribbon | Home; Draw, Modify, Annotation, Block, Utilities panels; the ribbon | Padrão; Desenhar, Modificar, Anotação, Bloco, Utilitários; a faixa de opções | X T:ID_TabHome, T:ID_PanelDraw, T:ID_PanelModify, T:ID_PanelBasicAnnotation, T:ID_PanelHome_Blocks, T:ID_PanelStandard_Clipboard; N AcWindows MigrateRibbon_Balloon_Title | yes |
| Draw | Line, Polyline, Circle, Arc, Ellipse, Elliptical arc, Rectangle, Polygon, Hatch, Spline | Linha, Polilinha, Círculo, Arco, Elipse, Arco elíptico, Retângulo, Polígono, Hachura, Spline | P ax26res 298, 296, 285, 282, 293, 1170, 295, 312; X T:ID_RBN_0138, ACAD_244 | yes |
|  | Center, Radius · Center, Diameter · 2-Point · 3-Point · Start, Center, End · Center, Start, End | Centro, Raio · Centro, Diâmetro · 2 pontos · 3 pontos · Início, Centro, Fim · Centro, Início, Fim | X T:ID_RBN_0127, 0128, 0130, 0094, 0113, 0122 | yes |
|  | Spline Fit, Spline CV, Edit Spline, Edit Polyline | Ajustar a spline, VC da spline, Editar spline, Editar polilinha | X T:ID_RBN_8219, 8218, T:ID_RBN_CMDBTN_SPLINEDIT, T:ID_RBN_CMDBTN_PEDIT | yes |
|  | Diameter circle, 2-Point circle, Start, Center, End arc, Center ellipse (the tool names) | Círculo por diâmetro, Círculo por 2 pontos, Arco início, centro, fim, Elipse por centro | ours, worded from the ribbon's options (AutoCAD names no such tool) | — |
| Modify | Move, Copy, Stretch, Rotate, Mirror, Scale, Offset | Mover, Copiar, Esticar, Rotacionar, Espelhar, Escala, Deslocamento | X ACAD_358, 354, 361, 359, 355; P ax26res 108, 785 | yes |
|  | Trim, Extend, Fillet, Chamfer, Explode, Join, Break, Break at point, Erase | Aparar, Estender, Concordância (the ribbon's «Concord»), Chanfro, Explodir, Unir, Quebrar, Quebrar em um ponto, Apagar | X ACAD_363, 367, 377, 2639, 365, 2419, 353; P ax26res 812, 806, AcOpmExtRes 391 | yes |
|  | Region; Union, Subtract, Intersect; Solid Editing | Região; União, Subtrair, Intersecção; Editar sólidos | X ID_Region, ID_Union, ID_Subtract, ID_Intersect, ID_PanelSolidEdit | yes |
|  | Box; 3D Solid; Solid type, Box; History, None, Show History; Solid History | Caixa; Sólido 3D; Tipo de sólido, Caixa; Histórico, Nenhum, Mostrar histórico; Histórico do sólido | X ID_Box; LIST's lines (solid/p01); 3D Solid and Solid History, ours | partly |
|  | Wedge, Pyramid; Modeling; Solid type Wedge, Pyramid; Base radius, Top radius, Sides, Type, Inscribed, Circumscribed | Cunha, Pirâmide; Modelagem; Tipo de sólido Cunha, Pirâmide; Raio da base, Raio superior, Lados, Tipo, Inscrito, Circunscrito | X ID_Wedge, ID_Pyramid, ID_Panel3D_Modeling; LIST's lines and the keywords (solid/w01, y01, y02); the palette's rows not seen in Portuguese | partly |
|  | Cylinder, Cone; Elliptical, Major radius, Minor radius, Base/Top major and minor radius | Cilindro, Cone; Elíptico, Raio maior, Raio menor, Raio da base maior/menor, Raio superior maior/menor | X ID_Cylinder, ID_Cone; LIST's lines and the keywords (solid/c01, c04, k01, k03); `Raio superior menor` and the palette's rows, ours | partly |
|  | Sphere, Torus; Torus radius, Tube radius | Esfera, Toroide; Raio do toroide, Raio do tubo | X ID_Sphere, ID_Torus; LIST's lines (solid/h01, r01); the palette's rows, ours | partly |
|  | Match properties; Array; Rectangular, Polar, Path array | Corresponder propriedades; Matriz; Matriz retangular, Matriz polar, Matriz de caminho | X ACAD_335, XLS_00021866, 00021843, 00021840 | yes |
| Annotate | Text, Multiline text, Edit text | Texto, Texto multilinha, Editar texto | X T:ID_RBN_0020; P ax26res 32 | yes |
|  | Linear, Aligned, Angular, Radius, Diameter, Baseline, Continue, Adjust space; Rotated | Linear, Alinhada, Angular, Raio, Diâmetro, Linha de base, Continuar, Ajustar espaço; Rotacionada | X T:ID_RBN_CMDBTN_DIMLINEAR … DIMSPACE, T:ID_RBN_0126; P AcDimRes 5853 | yes |
| Block | Create block, Insert block, Purge, Define attributes, Edit attributes | Criar bloco, Inserir bloco, Eliminar, Definir atributos, Editar atributos | X T:ID_RBN_SPLITBTN_CREATEBLOCK, ACAD_3036, T:ID_RBN_CMDBTN_PURGE, T:ID_RBN_CMDBTN_ATTDEF, T:ID_RBN_SPLITBTN_ATTRIBUTE | yes |
|  | Attribute display | Exibir atributo | X ACAD_147 | yes |
| View | Zoom Extents, Zoom Window, Zoom Previous, Zoom In, Zoom Out, Pan | Zoom estendido, Janela de zoom, Zoom anterior, Aproximar o zoom, Diminuir o zoom, Pan | P AcVMToolsRes 47098–47105, 47090 | yes |
|  | Top, Bottom, Front, Back, Left, Right; SW / SE / NE / NW Isometric; Custom View | Superior, Inferior, Frontal, Posterior, Esquerda, Direita; Isométrico SO / SE / NE / NO; Vista personalizada | X XLS_1673–1682, P acadres 40867 | yes |
|  | ViewCube; Home; Parallel; Set Current View as Home; WCS; New UCS; Unnamed | ViewCube; Início; Paralela; Definir a vista atual como início; WCS; Novo UCS; Não nomeado | P AcVMToolsRes 47154, 47021, 47022, 47026, 47009, 47042, 47010 | yes |
|  | TOP … RIGHT on the cube; N, E, S, W | SUPERIOR … DIREITA; N, L, S, O | the view names in capitals; Portuguese's compass points. AcVMToolsRes 629–634 say `Esquerdo`, `Direito`, but their Spanish twins proved not to be the cube's (names/e01): only the pt-BR desktop settles it | no |
|  | Rotate clockwise / counterclockwise; View the face above… | Girar no sentido horário / anti-horário; Ver a face de cima… | C (UNITS: «sentido horário ou sentido anti-horário») | no |
|  | 3D Orbit, Plan view, Viewpoint, Preset views, UCS icon, Elevation | Órbita 3D, Vista em planta, Ponto de vista, Vistas predefinidas, Ícone UCS, Elevação | X ACAD_126, T:RBN_200_8A67D, ID_TbViewpoi; P acrenderRes 2085 (the menu's ACAD_112 says «Vista da planta»), AcSceneRes 5143, ax26res 59 | yes |
| Inquiry | Measure, Distance, Area, ID Point | Medir, Distância, Área, Ponto de identificação | X T:ID_RBN_0140, T:ID_RBN_CMDBTN_DIST, T:ID_RBN_CMDBTN_AREA, ACAD_189 | yes |
|  | Region/Mass Properties; MASSPROP's report (Mass, Volume, Bounding box, Centroid…) | Região/Propriedades de massa; Massa, Volume, Caixa delimitadora, Centroide… (the region's `l:` for `I:` kept, as the table and console write it) | X ID_Massprop (ACAD_187); the 2027 tables 22082–22165 and console (solid/m01–m09) | yes |
|  | List | Lista | X ACAD_188 | yes |
|  | Change properties | Alterar propriedades | ours, worded from the command's name, ALTPROP: no menu or ribbon item runs CHPROP | — |
| Edit | Undo, Redo, New, Open, Save, Save As | Desfazer, Refazer, Novo, Abrir, Salvar, Salvar como | X PM_0006; N AcAeNet, AcDxWizard | yes |
| Clipboard | Clipboard; Cut, Copy, Paste, Copy with Base Point | Área de transferência; Recortar, Copiar, Colar, Copiar com ponto base | X PM_0114 («Cortar» in that menu, «Recortar» ACAD_55 the command's) | yes |
| Shortcut menu | Shortcut menu; Repeat ‹command›, Enter, Cancel | Menu de atalho; Repetir ‹comando›, Enter, Cancelar | X PM_0006, PM_0009; N AcCustomize NAME_ShortcutMenu | yes |
|  | Copy Selection, Deselect All, Properties; Osnap Overrides; Dimension Style | Copiar seleção, Desmarcar tudo, Propriedades; Sobreposições de snap; Estilo da cota | X PM_0007, ACAD_2602, ACAD_2000 | yes |
| Command line | Command line; Command history | Linha de comando; Histórico de comandos | X ACAD_2669, C 06F6A6E9-C355-43F5-8706-49F0E5E552BF | yes |
| Application | Application menu; Navigation bar | Menu Aplicativo; Barra de navegação | N AcWindows SearchGroupAppMenu, X T:RBN_200_F8969 | yes |
| Properties | General, Geometry, Misc; Color, Layer, Linetype, Lineweight, Text style, Dim style | Geral, Geometria, Diversos; Cor, Camada, Tipo de linha, Espessura de linha, Estilo de texto, Estilo de cota | P ax26res 19, 25, 112, 196, 203; N AcCustomize PROP_CAT_General | yes |
|  | ByLayer; \*VARIES\*; No selection; Custom color | PorCamada; \*VARIA\*; Nenhuma seleção; Cor personalizada | P acadres 4221, 63546, acopmRes 177, gridres 81 | yes |
|  | Start X, End X, Center X, Vertex X, Current Vertex, Closed, Global width | X inicial, X final, Centro X, Vértice X, Vértice atual, Fechado, Largura global | P ax26res 7–18, 1, 251, 318 | yes |
|  | Radius, Diameter, Circumference, Area, Start / End / Total angle, Arc length, Major / Minor radius, Radius ratio, axis vectors | Raio, Diâmetro, Circunferência, Área, Ângulo inicial / final / total, Comprimento do arco, Raio maior / menor, Proporção do raio, Vetor X do eixo maior… | P ax26res 252, 262, 263, 253, 87–90, 103–105, 46, 47 | yes |
|  | Contents, Justify, Height, Rotation, line spacing, Defined width; the nine justifications | Conteúdo, Justificar, Altura, Rotação, Fator / Distância / Estilo de espaçamento de linha, Largura definida; Superior esquerda … Inferior direita | P ax26res 57, 54, 128, 254, 120, 330, 121, 732, 116, 126 | yes |
|  | Rotated, Aligned, Angular, Radial, Diametric Dimension; Lines & Arrows, Fit, Primary Units; their rows | Cota rotacionada, alinhada, angular, radial, de diâmetro; Linhas e setas, Ajustar, Unidades primárias; Tamanho da seta, Extensão da linha de extensão, Escala de cota global, Suprimir zeros à direita… | P ax26res 287–292, 141–143, 174–235 | yes |
|  | Measurement, Text override, Text position X | Medição, Sobrepor texto, Texto posição X | P ax26res 154, 211, 223 | yes |
|  | Pattern, Pattern name, Annotative, Associative, Origin X, Island detection style, Outer, Cumulative Area, Predefined | Padrão, Nome do padrão, Anotativo, Associativa, Origem X, Estilo de detecção de ilha, Externa, Área cumulativa, Predefinido | P ax26res 48, 85, 925, 111, 358, 113, 114, 928, 84 | yes |
|  | Tag, Prompt, Value; Invisible, Constant, Verify, Preset, Lock position | Identificador, Prompt, Valor; Invisível, Constante, Verificar, Predefinir, Bloquear posição | P ax26res 33–35, 257–260, 359 | yes |
|  | A spline's Data Points, Method, Degree, fit and control points, Weight, CV frame, Periodic, tangent vectors; Chord, SqrtChord, Uniform | Pontos de dados, Método, Grau, Ponto de ajuste / de controle…, Peso, Quadro do VC, Periódico, Vetor X da tangente inicial…; Banzo, RaizQuadBanzo, Uniforme | P ax26res 69–76, 99, 101, 278, 792, 910–915, 1255; acappres 2027–2034 | yes |
|  | An array's rows (Columns, Rows, Items, spacing, Fill angle…) and titles | Colunas, Linhas, Itens, Espaçamento entre…, Ângulo de preenchimento…; Matriz (Retangular / Polar / Caminho) | P ax26res 266–269, 1191–1220 | yes |
|  | Endpoints, Definition points, First X, Second X (our own groups and rows) | Pontos finais, Pontos de definição, Primeiro X, Segundo X | ours, worded from the palette's | — |
| Colours | Red, Yellow, Green, Cyan, Blue, Magenta, White | Vermelho, Amarelo, Verde, Ciano, Azul, Magenta, Branco | P AcOpmExtRes 160–167 | yes |
| Layers | Layers; New layer, Set current, Delete layer, Current layer; Status, Name, On, Lock, Color, Linetype, Lineweight | Camadas; Nova camada, Definir atual, Excluir camada, Camada atual; Status, Nome, Ativado, Bloquear, Cor, Tipo de linha, Espessura de linha | N AcLayer ID_MENUITEM_LISTCTX_*, ID_LISTHEADERCTX_*, CurrentLayerStatusText | yes |
|  | On / Off, Unlocked / Locked (a layer's state) | Ativada / Desativada, Desbloqueada / Bloqueada | N AcLayer (masculine there, «Ativado»; feminine for «camada») | partial |
|  | Layer - Not Deleted, Current Layer Off, Name Already Exists, Rename; invalid characters | Camada – Não excluída, Camada - Camada atual desativada, Camada - O nome já existe, Camada - Renomear; Caractere inválido no nome da camada | N AcTaskDialogs (TaskDialog 83, 87, 88; `%ObjectName% - O nome já existe`), N AcLayer LayerErrorInvalidChars, IDS_NOM_BAD_CHARSET_ESN_LAYER | yes; partial (`Camada` for `%ObjectName%`) |
| Dimension styles | Lines, Symbols and arrows, Text, Fit, Primary units | Linhas, Símbolos e setas, Texto, Ajustar, Unidades primárias | P AcDimRes 6000–6013 | yes |
|  | Baseline spacing, Extend beyond dim lines, Offset from origin, Arrow size, Center marks, Text height, Offset from dim line, Use overall scale of, Draw dim line between ext lines, Decimal separator | Espaçamento da linha de base, Estender além das linhas de cota, Deslocar da origem, Tamanho da seta, Marcas de centro, Altura do texto, Deslocar a partir da linha de cota, Usar escala global de, Desenhar linha de cota entre linhas ext., Separador decimal | D AcDimRes 301–307 (by control id since 31/10/2026: the runs read in order had given «Deslocar da linha de cota») | yes |
|  | ',' (Comma), '.' (Period), ' ' (Space); Suppress trailing zeros | ',' (Vírgula), '.' (Ponto), ' ' (Espaço); Suprimir zeros à direita | P acdb26res 6150–6152, ax26res 235 | yes |
| Text styles, Blocks | Styles, Height, New, Delete, Rename; Filter | Estilos, Altura, Novo, Excluir, Renomear; Filtro | C 1ED81E98-6463-4574-875F-183C8280C4AC, C E3413A03-8EEF-44D5-B5C7-8B345A9257FE; P AcDimRes (the manager's buttons) | yes |
| Dialogs | Properties - Locked objects; Multiline Text - Unsaved Changes | Propriedades – Objetos bloqueados; Texto multilinha - Alterações não salvas | N AcTaskDialogs (TaskDialog 181; «Texto multilinha» and «Alterações não salvas» from 104 and 215) | yes; partial |
| Keys | Enter, Esc, Shift, Tab, Spacebar | Enter, Esc, Shift, Tab, barra de espaço | GS 6B8B7254-94CD-42DB-8F27-1339CAECE9ED («pressionar Enter ou a barra de espaço») | yes |
| Open source, Docs | Open source; Docs; Build with MellowCAD | Código aberto; Documentação; Construir com o MellowCAD | the site's own words, no AutoCAD term | — |
| Search | 2D CAD online, free, no sign-up, AutoCAD commands, aliases | CAD 2D online, grátis, sem cadastro, comandos do AutoCAD, atalhos (the description) / aliases (Autodesk's word, the body) | Search texts, below | yes |

## Register

- **Landing:** «você», short sentences, the imperative («Digite L. Pressione Enter. Desenhe.»);
  «computador» for the desktop, «dispositivo» for where data lives, «mouse», «baixar», «salvar».
- **Editor:** Autodesk's register — labels as infinitives and nouns («Salvar como», «Definir
  atual»), sentences as its dialogs word them («O que deseja fazer?»).
- **Autodesk's words, not the dictionary's:** «prompt» (not «solicitação»), «aliases de comando»,
  «snap ao objeto», «faixa de opções», «Intersecção» with its c, «Deslocamento» for OFFSET.
  «atalhos» only where people search it (the description), as aliases are «atalhos» to them.
- «» in prose; the em dash spaced, as Brazilian style writes it.

## Search texts

Google's suggestions in Brazil (`hl=pt-BR`, `gl=br`), 31/10/2026: «autocad online gratuito», «cad
2d online grátis», «desenho técnico online (gratuito)», «programa (de) desenho técnico gratuito»,
«programa cad gratuito», «desenhar planta baixa online grátis», «alternativa ao autocad gratuito»,
and — the one MellowCAD answers best — «comandos autocad português e inglês», «atalhos autocad em
português»: **atalhos** is the word for aliases, and the two command languages side by side are
what people look for. «grátis» and «gratuito» are both searched; «sem cadastro» is not suggested.
Title: «CAD 2D online grátis com os comandos do AutoCAD — MellowCAD» (58); description: «CAD 2D
grátis no navegador com os comandos, atalhos e snaps ao objeto do AutoCAD. Sem instalar nada e sem
cadastro; seus desenhos não saem do seu computador.» (153). «sem cadastro» is the plain wording
even if not suggested; «AutoCAD online grátis» is never written, as it would read as AutoCAD itself.

## Command language

### `acad.pgp`

`research/strings/acad_pt-BR.pgp` (641 lines, UTF-8 with BOM, CRLF, tabs between fields:
`propose-commands.mjs` reads it as is). Letters that run another command than in English, among
the ones an English hand types without thinking:

| Alias | English    | pt-BR                                                     |
| ----- | ---------- | --------------------------------------------------------- |
| `C`   | CIRCLE     | COR (COLOR); CIRCULO is `CI`                              |
| `E`   | ERASE      | ESTICAR (STRETCH); APAGAR is `APG`, and `DELETE` stays    |
| `O`   | OFFSET     | OCULTAR (HIDE); DESLOCAMENTO has no alias                 |
| `H`   | HATCH      | HACHLIM; HACHURA is `HC`, `-HACHURA` is `-H`              |
| `U`   | U          | UNIAO (UNION); U is `D` (names/p02)                        |
| `MA`  | MATCHPROP  | MATRIZ (ARRAY)                                            |
| `AP`  | APPLOAD    | APARAR (TRIM)                                             |
| `EX`  | EXTEND     | EXTRUSAO; ESTENDER is `EST`                               |
| `REC` | RECTANG    | RECUPERARDESENHO; RETANGULO is `RET`                      |
| `PR`  | PROPERTIES | OPCOES; PROPRIEDADES is `ALT` and `PROPS`                 |
| `RE`  | REGEN      | REFERENCIASEXTERNAS; REGEN is `RG`                        |

And none at all for `F`, `TR`, `S`, `SC`, `MI`, `J`, `B`, `LA`, `BR`, `PE`, `CH`, `MO`, `D`, `DT`,
`MT`, `LT`, `LW`, `PU`: in pt-BR AutoCAD they are unknown commands, as they will be here. `LAYER`
is an alias of CAMADA, and `COTAD` of the English `DIMSTYLE` (the file's own oddity, copied).

### The keywords' format

- **«ou»** before the list, deduced by `orWords` from the tables (` (ou)$`), with no list per
  language.
- **`initget`** like Spanish's: the capital inside a word marks the letter (`Arco Fechar
  Meialargura Comprimento LInha Desfazer LArgura _Arc Close Halfwidth Length LIne Undo Width`,
  21298); the label in the prompt is the same word (`[Arco/Fechar/…]`).
- **Two imperatives.** Prompts mix `Especificar` (561 strings) and `Especifique` (120),
  `Selecionar` (150) and `Selecione` (114) — the same English prompt worded both ways by different
  ids. The catalog takes the one the command's own id uses; where several ids disagree (`several`
  in the proposal) the console decides.
- `Comando:` (22843), so `probe.sh --lang pt-BR` ends its probes where it should.
- `propose-commands.mjs --lang pt-BR`: 991 proposed, 158 `several`, 95 `partial`, 22 `plural`, 6
  `select`, 254 `no-source` (Spanish: 966, 185, 95, 22, 6, 252). `names` 99 of 122, `keywords` 65
  of 71, `promptKeywords` 5 of 17, `keywordLabels` 21 of 31. One to doubt already: `-OSNAP`'s `OFF`
  proposed as `Desativado`, where Spanish's is `DES` from the console.

### How `commands` was written (31/10/2026)

`cad/locales/pt-BR.json`, every key, in this order of authority:

- **The console.** 430 of the reviews' probes run in pt-BR (`console-pair.mjs --select`,
  `probe.sh --lang pt-BR --lang-only`) and paired with their en-US transcripts by
  `console-pair.mjs`: each prompt, keyword, label and message English's console printed is
  reworded from what pt-BR's printed in its place (`research/console/pt-BR.md`). It overruled the
  tables wherever they disagreed (SPLINE's third point `Inserir próximo ponto ou`, the next ones
  `Insira o próximo ponto ou`; MTEXT's justifications `SE/SC/SD/ME/MC/MD/IE/IC/ID`, not TEXT's
  `MES`; `Selecionar objetos`, `Especificar primeiro ponto`).
- **Names.** `(getcname "_LINE")` for every AutoCAD command (names/p01); the PTB help pages for those
  it does not answer (`PROPIG`, `ELIMINAR`, `PALETABLOCOS`, `EDITARATRIBA`, `MATRIZRETANG`,
  `QUEBRAREMPONTO`, `FECHARCAMADA`, `FECHARPROP`, `PROPRIEDADES`, `UNIDADES`, `VISTA`, `RETANGULO`,
  `TEXTOM`, `LISTA`, `CUBONAV`, `ORBITA3D`); aliases from `acad.pgp`. U is `D` and FROM is `DE`, with
  `Ponto base:` and `<Deslocamento>:` (names/p02, p03). Our own commands take the base name and the
  initials of the ribbon's words, as Spanish: `CIRCULOD`, `CIRCULO2P`, `CIRCULO3P`, `ARCOICF`
  (Início, Centro, Fim), `ARCOCIF`, `ELIPSEC`, `ELIPSEARCO`.
- **The tables**, where no probe shows a key: the proposal, and the DLLs the tables do not merge
  (`acmatchRes`, `atteditRes`, `AcEAtteditRes`, read with `strtable.mjs`); the hatch patterns'
  descriptions from the pack's `acadiso.pat`; -DIMSTYLE's from its status listing (names/p06).
- A snap typed at a point prompt echoes `de` or `para` (`_END` → `de`, `_PER` → `para`, line/p214).

### Per command and per prompt (31/10/2026, second session)

What English words alike and pt-BR words per command has an id of its own, each with its table id
and probe at the tool (`cad/application/brazilianPrompts.test.ts`): PLINE's next point
(`plineNextPointOr`, `Especificar o próximo ponto ou`), DIST's and AREA's once they offer Total
(`specifyNextPointOrTotal`, `addModeNextPointOrTotal`, `subtractModeNextPointOrTotal`,
`Especifique o próximo ponto ou`), TEXT's and ATTDEF's justification, UCSICON's and NAVVCUBE's
option (`Insira uma opção`), AREA's first corner, PLINE's arc center (`Especificar o centro do
arco`), COPY's base point (`Especificar um ponto base ou`) and its `<usar primeiro ponto como
deslocamento>` (MOVE's `<utilizar …>`), and TRIM's and EXTEND's edges once cuTting edges or
Boundary edges ask them (`selectEdgesOr`, `Selecione objetos ou`, 42047). `undoYes` needed none:
UNDO's `OK? <S>` is pt-BR's too (line/p109). Keywords per prompt (`promptKeywords`): UCS's and
-VIEW's Top, BAck and Left at Orthographic, UCS New's `EIxoz`, PEDIT's eXit at Straighten's prompt
(`SAir`), SPLINEDIT's eXit and X at Weight's and Move's (`Sair`, `S`). Labels pt-BR declares
otherwise (English's entry beside): ATTDISP's `ATivado`, DIST's arc `DIreção` and `LInha`,
SPLINEDIT's `Depois`, COPY's `Descolamento` (Autodesk's spelling, with `<Deslocamento>` kept as the
default, a phrase), UCSICON's `Sem origem`.

**-OSNAP's words take their three capitals** (`MEIo`, `CENtro`, `QUAdrante`, `INTersecção`,
`EXTensão`, `INSerção`, `PERpendicular`, `TANgente`, `MAIspróximo`, `APArente`, `PARalela`,
`NENhum`): the console takes `MEI` and `MEIO` and refuses `M` and `C` at a point prompt
(`Ponto inválido.`), and `A` at PLINE is Arco (names/p07, p09). With one capital, `Meio`,
`Centro`, `Aparente`… took every `M`, `C`, `A` typed at a point prompt as a snap, before the
keywords. The listing prints the short names of 33200–33213 in OSMODE's order (names/p10), which
English's `Qua`, `Per`, `Nea`, `App` did not either (`Quad`, `Perp`, `Near`, `App Int`).

### A default's form and a label per prompt (31/10/2026, third session)

**Where a default touches what precedes it is each language's** (`commands.promptForms`, by prompt
id; the tools no longer say it): pt-BR spaces UCS Move's `[profundidadeZ] <0,0,0>:`, its
`profundidadeZ <0>:` and UCS's and -VIEW's Orthographic `[Superior/…/Direito] <Superior>:`, which
English and Spanish write touching (25630, 25632, 25634, 26548; ucs/p153, p210, p211, view/p268).
The console showed the arrays' main prompt the other way round: `…/saIr]<saIr>:` in pt-BR and
`…/eXit]<eXit>:` in English, as AcArrayRes 5632, 5644 and 5651 write them, spaced only in Spanish
(arrays/p01, p100); English's was spaced here until then. A label one prompt lists otherwise is
`commands.promptKeywordLabels`: UCS New lists `[EIxo z/…]` for the `EIxoz` it declares (25626,
25627; ucs/p225). Both are held in the three languages by `cad/application/promptForms.test.ts`
and `brazilianPrompts.test.ts`.

**What no review's probe printed**, probed in both languages (names/p11–p23): REDO's `A última
operação DESFAZER já foi refeita.`, UNDO's `Início de grupo encontrado.` and its Auto prompt,
FILLET's non-coplanar refusals (each ends the command) and FILLET's and CHAMFER's 3D polyline
ones (each asks again), -DIMSTYLE's and -LINETYPE's `Não foram encontrados …`, PEDIT's `2 segmentos
adicionados a 2 polilinhas`, and MATCHPROP's prompts, settings line and locked destination, which
the console runs once `acmatch.crx` is loaded (skill `autocad-research`). They matched but two:
MATCHPROP's source is `Selecionar o objeto de origem` (acmatchRes had `Selecione objeto de
origem`), and CHAMFER fills 20635's `Objetos %s 3D não podem ser %s.` with `chanfrado`, singular,
which is copied (FILLET's `com concordância` was right). The report still counts most of these
`unseen`: they span two lines or are filled with values.

### The desktop, and an answer against the colon (31/10/2026, fourth session)

The desktop in pt-BR (`acad.exe /language pt-BR`, its profile left as found), against English's
own desktop reviews (line/d10, d27, workspace/d01, draw's d05); the evidence is
`research/probes/names/d01`–`d05`:

- **The toggles' lines** (d01): `<Snap ativado>`, `<Osnap ativado>`, `<Polar ativado>`,
  `<Rastreamento de snap ao objeto ativado>`, `<Ciclo de seleção ativado>` as worded; two
  corrected: Ortho is `<Ortogonal ativado>` (not `Orto`) and Grid `<Grade ativado>`, masculine
  like Spanish's `<Rejilla activado>` (not `ativada`).
- **Polar's tooltip** (d02): `Polar: 75.7945 < 0°`, English's words and form.
- **ATTEDIT's dialog prompt** (d04): `EDITARATRIB Selecionar referência de bloco:`, as worded
  (atteditRes 1).
- **MEASUREGEOM** (d03), which is not built: Quick shows bare values (`100`, `50`) and an area
  `Área = 5000.0000, Perímetro = 300.0000`, AREA's own message; Distance draws a bare rubber
  band. None shows the readout chip `feedback.measure*` words (`Dist`, `Âng`, `Área`, `Perím`),
  unused since the inquiry review (IQD), so they stay unverified in every language.
- **The dynamic input's field labels** (`Centro`, `Raio`, `Primeiro ponto`…) are ours: AutoCAD's
  fields are unlabelled (draw's d05), as Spanish's page says of its own; they stay unverified,
  the nouns of each prompt.

**An answer written against the colon is the language's** (`commands.answerForms`, by prompt id):
where a prompt's string ends without a space after its colon, the history writes the answer
against it, which the desktop shows too (d05, `Digitar número de ações ou [Tudo/úLtimo]:L`). Read
from every traced `Message` of the three languages' probes and the tables id by id: DIMSPACE's two
questions and -DIMSTYLE's redefine in every language (AcDimRes 5994, 5995, 5303; dimensions/p06,
p260); in pt-BR also PEDIT's first prompt (21229, pedit/p18), MREDO's (26256, names/p11),
ARRAYPATH's main prompt (AcArrayRes 5644, arrays/p332; ARRAYRECT's and ARRAYPOLAR's keep the
space) and ARRAYRECT's rows at Spacing (5718, arrays/p116); in Spanish the unit cell (5717,
arrays/p157). The tables alone mislead: TRIM's and EXTEND's Mode strings (13161, 64161) end with
no space, and their consoles print one. ARRAYPATH's main prompt and ARRAYRECT's rows at Spacing took
ids of their own (`selectGripToEditPathArrayOr`, `specifyDistanceBetweenRowsOfCell`); Rows' path is
`Especificar a distância entre linhas`, as its console words it beside Spacing's `Especifique`. Held
in the three languages by `cad/application/promptForms.test.ts`.

### Deviations

- **Aliases left out.** `acad.pgp` makes `COTAHORIZONTAL`, `COTAVERTICAL` and `COTAROTACIONADA`
  aliases of COTALINEAR, but each is a command's name, and the name wins (names/p02); `COTAD` points
  at the English `DIMSTYLE`, which pt-BR reads as the system variable (names/p04). `TOR` points at
  `TORO`, which the console runs as TORUS while it refuses `TOR` (solid/n03): `TORO` is an alias
  of TOROIDE here, `TOR` unknown.
- **SNAP's Aspect is `ASpecto`**, as the prompt lists it and table 25920 declares it: the console's
  `initget` declares `Ativado` and `Aspecto`, one abbreviation for two keywords, which
  `locales.test.ts` refuses.
- **-OSNAP's Endpoint is `pONto`** (27408): pt-BR's console takes `PON` and `PONTO` as Node
  (`Ponto`), which is not built here, refuses `EXTR` and `ON`, and no typed word reaches Endpoint
  but `_END` (names/p07–p09).

### Unverified

What no probe showed, worded from the tables or in Autodesk's style: the keys
`research/console/pt-BR.md` reports `unseen` or `unpaired` that no transcript shows, above all the
dynamic-input labels (`Centro`, `Raio`, `Primeiro ponto`…: AutoCAD shows none), the unused
`feedback.measure*` readout (`Dist`, `Âng`, `Área`, `Perím`: no AutoCAD view shows it), Polar's 3D
readout (`< +Z`, ours in every language), our own messages (files, clipboard, FROM) and the keywords and labels no probe's trace showed, taken from the tables.
The report's `unseen` also counts keys printed but not matched (a message over several lines, or
filled with values): these were compared by hand against the transcripts on 31/10/2026, which
corrected SPLINE's `Método=Ajustar Nós=`, the -STYLE listing's `Ângulo de inclinação`, LIST's
`Direção de extrusão em relação ao UCS:` and `sobreposições de estilo de cota:`, ARRAYPATH's
`Especifique o número de itens ou` and AREA's ADD and SUBTRACT prompts. The report's `several`
groups keys by English's words, so it lists the ids above with every wording of their English:
each one's own is fixed by its test.

## Script and font

`latin`. Inter (`inter-latin-600-normal.woff`, the share card's) and Geist Mono have every
Portuguese letter (ã õ â ê ô à ç and capitals, ª º « » – —): nothing to add, no budget spent.

## Plurals

CLDR `pt-BR`: `one`, `many`, `other` — and **`one` takes 0 and 1.5** (`i = 0..1`), unlike English,
Spanish and `pt-PT`: `{count, plural, one {# objeto} other {# objetos}}` prints «0 objeto». `many`
is for compact millions (`1 milhão de objetos`), which no message prints. A count that can be 0
gets its `=0` where the English has one, and AutoCAD's own counts are its `encontrado(s)` style,
copied from the table as Spanish copies its own. **Not in a landing island's plural**
(`pluralMessage`): it samples each category once, 0 for `one`, so an `=0` there would become the
form of 1 too. The hero's count is never shown at 0, and has none.

## Length

On the same table ids, pt-BR runs like Spanish: labels of up to 20 characters +24% in total
(median +15%, 90th percentile +71%; Spanish +25%, +15%, +75%), prompts +25% (Spanish +22%). The
catalogs as a whole run as Spanish's: the editor's 4,387 characters (Spanish 4,516), the engine's
interface 5,826 (5,928), the site 16,180 (16,017).

Seen before going live (31/10/2026; the landing at 360 px, the editor at 1280×720, every
drop-down, the shortcut and snap menus): what did not fit was the layout's, fixed there for every
language — the palette toggle «Camadas», the palette panel's four tabs, the snap's name in a live
figure, the try-it box's example at 360 px, the local-first diagram's «salvamento automático» and
a list that broke `-DEFATRIB` after its hyphen. A palette row's label wraps where it runs long
(«Espessura de linha», four rows of the dimension style), as English's «Draw dim line between ext
lines» does: Autodesk's words stay whole.

## Input

ABNT2 is latin with dead keys (´ ` ~ ^ ¨) and its own `ç`. Command names and keywords are ASCII
(`CIRCULO`, `RETANGULO`; the keyword's letter of `âNgulo` is `N`). Checked in Chrome before going
live (31/10/2026), both ways a dead key reaches a page — Windows' `keydown` of `Dead` and then the
composed letter, Linux's and macOS's composition — on the drawing, in the command line's field and
in the dynamic input: `é`, `ã`, `â` and `ç` arrive whole, and TEXT keeps «Ângulo de ação» and «Élan
e pé» typed from a dead key first, the box already focused. No IME handling was added.

## Review

No native reader yet. Every word of the command language and most of the interface are Autodesk's,
so a reader's time goes first to what Autodesk did not write, in this order:

1. **The landing's copy**, written, not copied: «Precisão que se sente sob o cursor», «Sua prancheta
   está a uma tecla de distância», the search title and description (Search texts).
2. **The two "Use" pages written by hand** (`content/docs/getting-started.pt-BR.mdx`,
   `differences.pt-BR.mdx`).
3. **Our own words**, marked — above: the tool names worded from the ribbon («Círculo por
   diâmetro», «Arco início, centro, fim»), the palette's own groups and rows («Pontos finais»,
   «Primeiro X»), «Alterar propriedades».
4. **What no source settled**, marked **no** or **partial**: the cube's faces and compass, its
   tooltips, a layer's state in the feminine («Ativada», «Bloqueada»), the layer dialogs' title.
5. **The plurals that can say 0**, `one` in pt-BR (Plurals).

Changed since it went live: the review of 31/10/2026 read the installed pack by id and corrected
«Exibir atributo» (was «Exibição de atributos»), «Lista» (was «Listar») and «Deslocar a partir da
linha de cota» (was «Deslocar da linha de cota»).
