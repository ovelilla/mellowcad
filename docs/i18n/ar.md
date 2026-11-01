# Arabic (`ar`)

> **Command language:** `global`, English AutoCAD's. **Status:** `live` since 01/10/2026.
> **Review:** none by a native speaker yet.

`/ar/draw` is English AutoCAD with its interface in Arabic: palettes, menus, tooltips, the status
bar and the language menu speak Arabic and mirror right to left; the drawing, the command line, the
dynamic input, the coordinates and every technical value stay left to right.

## How the terms were chosen

No Autodesk source exists, so each term carries how it was chosen: **(C)** the word
Arabic AutoCAD courses and books use (أوتوكاد tutorials name tools this way: تشذيب، تقويس، شطف،
تهشير، الطبقة); **(M)** the Modern Standard Arabic technical or mathematical term (قطع ناقص، مماس،
متساوي القياس، المسقط الأفقي); **(L)** worded from the English for want of any precedent. **†**
marks a choice between competing terms that a native review should settle first — for example التقاط
الكائنات against خطف الكائنات for object snap, or مكعب العرض against keeping ViewCube.

## Deviations

- **Forced by what does not exist:** there is no Arabic AutoCAD — Autodesk ships 14
  languages and none is right to left — and whoever drafts in Arabic works in the English one. So
  Arabic's command language is the global one: the same names, aliases, prompts, keywords and
  canvas labels as `/draw` (`cad/locales/ar.json` holds only `interface`; `WHY` in
  `i18n/engine.ts`). An Arabic vocabulary would be one no AutoCAD user has ever seen, and would put
  bidirectional text in the command line.
- **Forced by the platform:** a Ctrl shortcut is read by its physical key (`e.code`)
  when the layout sends a letter that is not latin — with the Arabic layout Ctrl+Z arrives as
  `ئ`. Desktop accelerators, AutoCAD's included, do not depend on the layout. Typed text is taken
  as typed: `LINE` typed on the Arabic layout is an unknown command, as in AutoCAD.
- **Missing:** drawing text in a right-to-left script. TEXT and MTEXT draw whatever is typed,
  Arabic included, but with no paragraph direction of their own (always left to right), measured
  as an average glyph (Arial's widths cover latin only), so an Arabic label's box and centring are
  approximate.

## Interface terms

| Area | English | Arabic |
| --- | --- | --- |
| Object snaps | Endpoint, Midpoint, Center, Intersection, Apparent intersection | نقطة النهاية، نقطة المنتصف، المركز، التقاطع، تقاطع ظاهري (C) |
|  | Perpendicular, Tangent, Insertion, Extension, Parallel, Quadrant, Nearest | عمودي، مماس، الإدراج، الامتداد، موازٍ، الربع، الأقرب (C) |
|  | None | لا شيء (M) |
|  | From (snap menu) | من نقطة (L) |
|  | Point Filters (snap menu) | مرشِّحات النقاط (L) |
| Status bar | Object snap | التقاط الكائنات (C) † |
|  | Object snap tracking, Polar tracking | تتبع التقاط الكائنات، التتبع القطبي (C) |
|  | Ortho mode, Grid | الوضع المتعامد، الشبكة (C) |
|  | Snap mode | وضع الالتقاط (L) † |
|  | Show lineweight | إظهار وزن الخط (C) † |
|  | Selection cycling; its list box, its None | تدوير التحديد؛ مربع قائمة التحديد، لا شيء (L) |
|  | Dynamic input | الإدخال الديناميكي (C) |
|  | Coordinates; Model space, its label MODEL; Customization | الإحداثيات؛ فضاء النموذج، النموذج؛ التخصيص (L) |
|  | Units; Clean screen | الوحدات؛ تنظيف الشاشة (L) |
| Drawing units | Drawing Units; Length, Type, Precision, Decimal; Insertion scale; Sample output | وحدات الرسم؛ الطول، النوع، الدقة، عشري؛ مقياس الإدراج؛ نموذج للإخراج (L) |
|  | Millimeters, Centimeters, Meters | مليمترات، سنتيمترات، أمتار (M) |
|  | OK, Cancel | موافق، إلغاء (M) |
| Ribbon | Home; Draw, Modify, Annotation panels; the ribbon | الرئيسية؛ الرسم، التعديل، التعليقات التوضيحية؛ الشريط (C) |
| Draw | Line, Polyline, Circle, Arc, Ellipse, Elliptical arc | خط، خط متعدد، دائرة، قوس، قطع ناقص، قوس قطع ناقص (M) † |
|  | Center, Radius · Center, Diameter · 2-Point · 3-Point | دائرة بالمركز ونصف القطر · بالقطر · بنقطتين · بثلاث نقاط (M) |
|  | Start, Center, End · Center, Start, End | قوس: بداية، مركز، نهاية · مركز، بداية، نهاية (M) |
|  | Rectangle, Polygon, Hatch | مستطيل، مضلع، تهشير (C) |
|  | Spline, Spline Fit, Spline CV | منحنى شرائحي، منحنى شرائحي بالملاءمة، منحنى شرائحي برؤوس التحكم (L) |
| Modify | Move, Copy, Stretch, Rotate, Mirror, Scale | نقل، نسخ، مطّ، تدوير، انعكاس، تحجيم (C) † |
|  | Offset, Trim, Extend, Fillet, Chamfer | إزاحة متوازية، تشذيب، تمديد، تقويس، شطف (C) † |
|  | Explode, Join, Break, Break at point | تفكيك، ضمّ، كسر، كسر عند نقطة (C) |
|  | Match properties | مطابقة الخصائص (C) |
|  | Change properties | تغيير الخصائص (C) |
|  | Array; Rectangular, Polar, Path array | مصفوفة؛ مصفوفة مستطيلة، قطبية، على مسار (M) |
|  | Region, Union, Subtract, Intersect | منطقة، اتحاد، طرح، تقاطع (C) |
|  | Box, 3D Solid, Solid type, History, Show History, Solid History | صندوق، مجسم ثلاثي الأبعاد، نوع المجسم، السجل، إظهار السجل، سجل المجسم (C) |
|  | Wedge, Pyramid, Modeling, Base radius, Top radius, Sides, Inscribed, Circumscribed | إسفين، هرم، النمذجة، نصف قطر القاعدة، نصف القطر العلوي، الأضلاع، محاط، محيط (C) |
|  | Cylinder, Cone, Elliptical, Base/Top major and minor radius | أسطوانة، مخروط، إهليلجي، نصف القطر الأكبر/الأصغر للقاعدة والعلوي (C) |
|  | Extrude, Extrusion | بثق، بثق (C) |
|  | Revolve | دوران (C) |
|  | Sphere, Torus, Torus radius, Tube radius | كرة، طارة، نصف قطر الطارة، نصف قطر الأنبوب (C) |
| Annotate | Single line text, Edit | نص بسطر واحد، تحرير (C) |
|  | Linear, Aligned, Angular, Radius, Diameter, Baseline, Continue, Adjust space | خطي، محاذٍ، زاوي، نصف القطر، القطر، خط أساس، متتابع، تباعد (C) † |
| Block | Create block, Insert, Purge | إنشاء كتلة، إدراج، تنظيف (C) † |
|  | Define attributes, Edit attributes | تعريف السمات، تحرير السمات (C) |
|  | Attribute display; Attribute definition | عرض السمات؛ تعريف سمة (C) |
| View | Zoom, Pan; Window, Previous, Extents | تكبير/تصغير، تحريك العرض؛ نافذة، السابق، الامتداد (C) |
| Inquiry | Measure, Area | قياس، المساحة (M) |
|  | List | سرد (L) |
|  | Region/Mass Properties | خصائص المنطقة/الكتلة (M) † — الكتلة is mass here and also a block |
| Edit | Undo, Redo, Erase | تراجع، إعادة، حذف (M) |
| Clipboard | Copy, Cut, Paste, Copy with base point | نسخ، قص، لصق، نسخ بنقطة أساس (M) |
| Selection | Window, Crossing | نافذة، تقاطع (L) † |
| Properties | General, Geometry | عام، الهندسة (M) |
|  | Color, Layer, Linetype, Lineweight, Dim style | اللون، الطبقة، نوع الخط، وزن الخط، نمط البُعد (C) |
|  | ByLayer, ByBlock | بالطبقة، بالكتلة (L) † — حسب الطبقة is the usual phrase, too wide for the palette's colour picker |
|  | \*VARIES\* | متنوع (L) |
|  | Start X, End X, Closed, Vertex X, Current Vertex | بداية X، نهاية X، مغلق، الرأس X، الرأس الحالي (M) |
|  | Center X | المركز X (M) |
|  | Height, Rotation, Scale, Pattern | الارتفاع، الدوران، المقياس، النقش (M) † |
|  | Justify; Middle center | المحاذاة؛ منتصف الوسط (L) |
|  | Measurement, Text override | القياس، نص بديل (L) |
|  | Rotated, Aligned, Radial, Diametric, Angular Dimension; Lines & Arrows, Fit, Primary Units; Arrow size, Center mark size, Ext line ext, Ext line offset, Text offset, Text position X, Text rotation, Dim scale overall, Decimal separator, Suppress trailing zeros, Precision (a dimension's) | بُعد مُدار، بُعد محاذٍ، بُعد نصف قطري، بُعد قطري، بُعد زاوي؛ الخطوط والأسهم، الملاءمة، الوحدات الأساسية؛ حجم السهم، حجم علامة المركز، امتداد خط الامتداد، إزاحة خط الامتداد، إزاحة النص، موضع النص X، دوران النص، المقياس الكلي للبُعد، الفاصل العشري، حذف الأصفار اللاحقة، الدقة (L) |
|  | Invisible, Constant, Verify, Preset, Lock position | مخفية، ثابتة، للتحقق، معدّة مسبقًا، قفل الموضع (L) † |
|  | Attributes; Tag, Prompt, Value; Misc | السمات؛ المعرّف، المطالبة، القيمة؛ متفرقات (L) † |
|  | Delta X, Length, Angle (a line's Geometry) | Δ X، الطول، الزاوية (M) |
|  | Radius, Diameter, Circumference, Area, Start/End angle, Major/Minor radius, Contents | نصف القطر، القطر، المحيط، المساحة، زاوية البداية/النهاية، نصف القطر الأكبر/الأصغر، المحتوى (M) |
|  | Radius ratio, Major axis vector X, Minor axis vector X (an ellipse's Geometry) | نسبة نصفي القطرين، متجه المحور الأكبر X، متجه المحور الأصغر X (M) |
|  | Data Points; Number of fit points, Current Fit point, Fit point X; Number of control points, Current Control point, Control point X, Weight; CV frame; Show, Hide (a spline's) | نقاط البيانات؛ عدد نقاط الملاءمة، نقطة الملاءمة الحالية، نقطة الملاءمة X؛ عدد نقاط التحكم، نقطة التحكم الحالية، نقطة التحكم X، الوزن؛ إطار رؤوس التحكم؛ إظهار، إخفاء (L) |
|  | Method, Degree, Periodic, Planar, Start / End tangent vector X, Fit tolerance; Fit, Control Vertices; Chord, SqrtChord, Uniform, Custom (a spline's Misc and values) | الطريقة، الدرجة، دوري، مستوٍ، متجه مماس البداية / النهاية X، تفاوت الملاءمة؛ ملاءمة، رؤوس التحكم؛ الوتر، الجذر التربيعي للوتر، منتظم، مخصص (M) |
|  | Total angle, Arc length (an arc's Geometry) | الزاوية الكلية، طول القوس (M) |
|  | Type, Predefined, Pattern name, Annotative, Origin X, Associative, Island detection style, Outer; Cumulative Area (a hatch's) | النوع، معرّف مسبقًا، اسم النقش، توضيحي، نقطة الأصل X، ترابطي، نمط اكتشاف الجزر، خارجي؛ المساحة التراكمية (L) † |
| Colours | Red, Yellow, Green, Cyan, Blue, Magenta, White | أحمر، أصفر، أخضر، سماوي، أزرق، أرجواني، أبيض (M) |
| Layers | Layer Properties Manager; New layer, Set current, Delete layer, Current layer | مدير خصائص الطبقات؛ طبقة جديدة، تعيين طبقةً حالية، حذف الطبقة، الطبقة الحالية (C) |
|  | Layer - Not Deleted, Layer - Current Layer Off, Layer - Name Already Exists, Layer - Rename (the manager's task dialogs) | الطبقة - لم تُحذف، الطبقة - إخفاء الطبقة الحالية، الطبقة - الاسم موجود، الطبقة - إعادة التسمية (L) |
| Dimension styles | Lines, Symbols and arrows, Text, Fit, Primary units | الخطوط، الرموز والأسهم، النص، الملاءمة، الوحدات الأساسية (L) |
|  | Baseline spacing, Extend beyond dim lines, Offset from origin | تباعد خطوط الأساس، الامتداد بعد خطوط الأبعاد، الإزاحة عن نقطة الأصل (L) |
|  | Arrow size, Center marks | حجم السهم، حجم علامة المركز (L) |
|  | Text height, Offset from dim line | ارتفاع النص، الإزاحة عن خط البُعد (L) |
|  | Use overall scale of; Precision | استخدام مقياس عام قدره؛ الدقة (L) |
|  | Decimal separator: ',' (Comma), '.' (Period), ' ' (Space); Suppress trailing zeros | الفاصل العشري: ',' (فاصلة)، '.' (نقطة)، ' ' (مسافة)؛ حذف الأصفار اللاحقة (L) |
|  | Draw dim line between ext lines (the Fit tab's DIMTOFL) | رسم خط البُعد بين خطوط الامتداد (L) |
| Text styles | Height, Set current, New, Delete | الارتفاع، تعيين حاليًا، جديد، حذف (L) |
| Blocks palette | Current drawing, Filter | الرسم الحالي، تصفية (L) |
| Drawing aids | Linetype scale (global scale factor), Drawing units, Precision | المقياس العام لأنواع الخطوط، وحدات الرسم، الدقة (L) |
| Keys | Enter, Esc, Del, Ctrl, Shift, Tab, Spacebar | Enter، Esc، Del، Ctrl، Shift، Tab، المسافة: the keys keep the names printed on Arabic keyboards (M) |
| Command line | Type a command | اكتب أمرًا (M) |
|  | Command history | سجل الأوامر (M) |
| Shortcut menu | Shortcut menu; Repeat ‹command›, Enter, Cancel | القائمة المختصرة؛ تكرار ‹الأمر›، Enter، إلغاء (L) † — Enter is the key's printed name, as in Keys |
|  | Clipboard; Osnap Overrides; Properties | الحافظة (M)؛ تجاوزات الالتقاط (L) †؛ الخصائص (M) |
|  | Dimension Style (the Edit menu over dimensions) | نمط البُعد (C) |
|  | Copy Selection, Deselect All; Copy with Base Point (Clipboard ▸) | نسخ التحديد، إلغاء تحديد الكل؛ نسخ بنقطة أساس (L) |
| View | Top, Bottom, Front, Back, Left, Right (view menu, -VIEW) | علوي، سفلي، أمامي، خلفي، أيسر، أيمن (M) |
|  | SW / SE / NE / NW Isometric | متساوي القياس جنوبي غربي / جنوبي شرقي / شمالي شرقي / شمالي غربي (M) † |
|  | Custom View | منظر مخصص (L) |
|  | Orbit; 3D Orbit | مدار؛ مدار ثلاثي الأبعاد (L) † |
|  | Plan view, View point, Preset views, UCS icon, Elevation (tool names) | المسقط الأفقي، نقطة النظر، المناظر المعدة مسبقًا، أيقونة نظام الإحداثيات، المنسوب (M) † |
| ViewCube | ViewCube; Home; Parallel; Set Current View as Home | مكعب العرض؛ الرئيسي؛ متوازٍ؛ تعيين العرض الحالي عرضًا رئيسيًا (L) † |
|  | TOP, FRONT, LEFT; BOTTOM, BACK, RIGHT (faces); N, E, S, W | أعلى، أمام، يسار؛ أسفل، خلف، يمين؛ ش، ق، ج، غ — the initials Arabic maps use (شمال، شرق، جنوب، غرب) (M) † |
|  | Rotate clockwise / counterclockwise; View the face above… | تدوير مع عقارب الساعة / عكس عقارب الساعة؛ عرض الوجه العلوي… (M) |
| UCS menu | WCS; New UCS; Unnamed | نظام الإحداثيات العام؛ نظام إحداثيات مستخدم جديد؛ بلا اسم (M) |
| Open source | Open source; the code; MIT licence | مفتوح المصدر؛ الشيفرة؛ رخصة MIT (M) |
| Docs | Docs; Documentation; Build with MellowCAD; API reference; Not published yet | التوثيق؛ البناء باستخدام MellowCAD؛ مرجع الواجهة البرمجية؛ لم يُنشر بعد (M) |
| Search | 2D CAD online, free, no sign-up, AutoCAD commands, aliases | رسم هندسي، ثنائي الأبعاد، أون لاين، مجاني، أوامر أوتوكاد، اختصارات — Google's Arabic suggestions in SA, EG, AE, MA, IQ and JO, 01/10/2026 (see Search texts, below) |

## Register

- **Arabic:** Modern Standard Arabic, neutral across the region. The landing speaks to the reader
  in the imperative («اكتب L. اضغط Enter. ارسم.»); the editor labels with verbal nouns («حفظ
  الرسم», «تعيين طبقةً حالية») and asks in the imperative («اكتب أمرًا»). «حاسوب», not كمبيوتر;
  «أوتوكاد» in prose, AutoCAD in the trademark notice. Arabic punctuation (، ؛ ؟), «» in prose,
  latin digits. A command name, key, URL or value inside Arabic text is isolated (FSI…PDI). A
  list is `format.list` («LINE وCIRCLE»), never a joined string; an arrow that points along the
  reading direction is ←.

## Search texts

- **Arabic** (Google's suggestions in Saudi Arabia, Egypt, the Emirates, Morocco, Iraq and Jordan,
  01/10/2026): «أوتوكاد» (with or without hamza), «رسم هندسي» (technical drawing), «ثنائي
  الأبعاد», «أون لاين» (not «عبر الإنترنت»), «مجاني/مجانا» and «أوامر الأوتوكاد واختصاراتها»
  («اختصارات» is the word for aliases). «كاد» alone finds Cadillac, and «بديل أوتوكاد» is not
  searched and would read as if this were AutoCAD. Title: «رسم هندسي ثنائي الأبعاد أون لاين مجانًا
  بأوامر أوتوكاد — MellowCAD».

## Font

Readex Pro, variable, `subsets: ["arabic"]`, the lightest that works (IBM Plex Sans Arabic also
breaks Satori's parser); how a script's face is loaded is `.claude/rules/i18n.md`.

## Review

The interface words are the project's, written in Modern Standard Arabic with the terms above.
`ar` went `live` **without a native speaker's review**, by the author's decision: none was
available. Where one should look first, if one ever is, in this order:

1. **The † terms** of the table above and the ViewCube's compass letters: each a choice between
   competing words that only a native reader settles.
2. **What was written after 01/10/2026**, which no one has reread (counted on 31/10/2026 against
   the catalogs of `4ffac941`): 154 keys of `cad/locales/ar.json`, above all the Properties
   palette's rows (114 of `interface.property`: splines, arrays, hatches, attributes, regions) and
   30 tool names; in `packages/editor/src/locales/ar.json`, split from the site's catalog since,
   the layer dialogs (`Layers.dialog`), the rail's flyouts and MTEXT's unsaved-changes dialog;
   in `messages/ar.json`, 79 new keys (the docs' pages and shortcuts, `Docs.*`) and 18 rewritten
   (the FAQ, the Status section).
3. **The rest** of `messages/ar.json` and `cad/locales/ar.json`, the plurals' six categories first.

A review received goes in as any fix, and the status lines then name its date.
