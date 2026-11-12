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
| Save Drawing As | Save Drawing As; File name, Files of type; Tools, Options…; Saveas Options, DXF Options, Format, BINARY, Select objects, Save thumbnail preview image, Decimal places of accuracy (0 to 16) | حفظ الرسم باسم؛ اسم الملف، نوع الملف؛ أدوات، خيارات…؛ خيارات الحفظ باسم، خيارات ⁨DXF⁩، التنسيق، ثنائي، تحديد الكائنات، حفظ صورة معاينة مصغّرة، عدد المنازل العشرية للدقة (L) |
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
|  | Presspull | ضغط/سحب (C) |
|  | Fillet Edge, Chamfer Edge | تقويس الحافة، شطف الحافة (C) |
|  | Extrude, Taper, Move, Copy, Offset, Delete, Rotate faces | بثق، تسليب، نقل، نسخ، إزاحة متوازية، حذف، تدوير الأوجه (C; تسليب L †) |
|  | Sphere, Torus, Torus radius, Tube radius | كرة، طارة، نصف قطر الطارة، نصف قطر الأنبوب (C) |
|  | Taper angle, Angle of revolution, Axis direction X (a swept solid's rows) | زاوية التسليب، زاوية الدوران، اتجاه المحور X (L; تسليب as the faces' Taper) |
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
| Application menu | Send Feedback | إرسال ملاحظات (L) † — the phrase Arabic software gives Send feedback; إرسال تعليقات competes |
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
|  | Visual Styles (the tool) | الأنماط المرئية (L) † |
|  | Plan view, View point, Preset views, UCS icon, Elevation (tool names) | المسقط الأفقي، نقطة النظر، المناظر المعدة مسبقًا، أيقونة نظام الإحداثيات، المنسوب (M) † |
| ViewCube | ViewCube; Home; Parallel; Set Current View as Home | مكعب العرض؛ الرئيسي؛ متوازٍ؛ تعيين العرض الحالي عرضًا رئيسيًا (L) † |
|  | TOP, FRONT, LEFT; BOTTOM, BACK, RIGHT (faces); N, E, S, W | أعلى، أمام، يسار؛ أسفل، خلف، يمين؛ ش، ق، ج، غ — the initials Arabic maps use (شمال، شرق، جنوب، غرب) (M) † |
|  | Rotate clockwise / counterclockwise; View the face above… | تدوير مع عقارب الساعة / عكس عقارب الساعة؛ عرض الوجه العلوي… (M) |
| UCS menu | WCS; New UCS; Unnamed | نظام الإحداثيات العام؛ نظام إحداثيات مستخدم جديد؛ بلا اسم (M) |
| Open source | Open source; the code; MIT licence | مفتوح المصدر؛ الشيفرة؛ رخصة MIT (M) |
| Docs | Docs; Documentation; Build with MellowCAD; API reference; Not published yet | التوثيق؛ البناء باستخدام MellowCAD؛ مرجع الواجهة البرمجية؛ لم يُنشر بعد (M) |
| Search | Technical drawing online, free, 2D and 3D, AutoCAD commands, aliases, AutoCAD alternative | رسم هندسي، أون لاين، مجاني، ثنائي الأبعاد، ثلاثي الأبعاد، أوامر أوتوكاد، اختصارات، بديل أوتوكاد — Google's Arabic suggestions in SA, EG, AE, MA, IQ and JO, 01/10/2026, and the visibility audit, 05/11/2026 (see Search texts, below) |
| Command pages | User coordinate system (UCS); orthographic UCS | نظام إحداثيات المستخدم؛ نظام إحداثيات إسقاطي (C; إسقاطي L) |
|  | Normal (a face's or an object's) | المتجه العمودي (M) † — الناظم |
|  | Line of sight; right-hand rule | خط النظر؛ قاعدة اليد اليمنى (M) |
|  | Viewport; crosshair | منفذ عرض (C) †؛ المؤشر المتقاطع (L) † |
|  | Parallel projection; perspective; navigation bar; wheel button | الإسقاط المتوازي؛ المنظور (M)؛ شريط التنقل؛ زر العجلة (L) |
|  | Wireframe; shaded; outlines (of a curved face) | إطار سلكي؛ مظلَّل؛ خطوط الكفاف (M) |
|  | Section, cross-section (SECTION); live section | مقطع، مقطع عرضي (C) † — قطاع is what Egypt and Saudi Arabia search («قطاع اوتوكاد»), the notes ask with both; المقطع الحي (L) |
|  | Surface, mesh; Boolean operation | سطح، شبكة (M)؛ عملية بوليانية (L) † |
|  | Loop, chain (of edges); tangent edges; round edge, rim | حلقة، سلسلة؛ حواف مماسة؛ الحافة الدائرية، طرف مستدير (L) |
|  | Arrow grip; base surface (a chamfer's); modeling error | مقبض السهم؛ السطح الأساسي؛ خطأ في النمذجة (L) |
|  | Solid editing (SOLIDEDIT's tool and rail group) | تحرير المجسمات (C) |
|  | Frustum; prism | جذع (جذع هرم، جذع مخروط)؛ منشور (M) |
|  | Block reference; wildcards; backquote | مرجع كتلة (C)؛ أحرف البدل؛ علامة الاقتباس الخلفية (L) |
|  | Attribute; tag, prompt, default value; mode (an attribute's); pickbox | سمة، سمات البلوك (C)؛ المعرّف، المطالبة، القيمة الافتراضية؛ الوضع؛ مربع التحديد (L) † — المعرّف as the palette's Tag; the dialogs (Attribute Definition, Edit Attributes) keep their English names, as Block Definition does |
|  | Enhanced Attribute Editor | محرر السمات المحسّن (L) † |
|  | Text style; font; big font; width factor, oblique angle; Upside down, Backwards, Vertical | نمط النص (C)؛ خط الكتابة (الفونت) (C) † — «خطوط اوتوكاد» is what searchers type for fonts, الخط alone is also a line; الخط الكبير (L) †؛ معامل العرض، زاوية الميل (M)؛ مقلوب، معكوس، رأسي (L) |
|  | Dimension spacing; base dimension (DIMSPACE) | تباعد الأبعاد؛ البُعد الأساسي (L) † |
|  | Edit mode (TEXTEDIT); annotation objects | وضع التحرير؛ كائنات التعليقات التوضيحية (L) |
|  | Purge, unused; Nested items, Orphaned data; verify each name | تنظيف، غير المستخدمة (C, as the ribbon's Purge) †؛ العناصر المتداخلة، البيانات اليتيمة (L) †؛ تأكيد كل اسم (L) |
|  | Linetype scale; global linetype scale factor; paper space | مقياس نوع الخط (C)؛ معامل المقياس العام لأنواع الخطوط (L, as Drawing aids)؛ فضاء الورق (C) |
|  | True colour; index colour; Color Books; transparency | اللون الحقيقي؛ لون الفهرس (L) †؛ كتب الألوان (L)؛ الشفافية (M) |
|  | Undo step; mark (UNDO's Mark); group (BEgin…End) | خطوة تراجع (L)؛ علامة (L)؛ مجموعة (L) † |
|  | Quick Access Toolbar; top bar; menu item | شريط أدوات الوصول السريع (C)؛ الشريط العلوي؛ بند قائمة (L) |
|  | Browser session; system clipboard | جلسة المتصفح؛ حافظة النظام (L) |
|  | Text window (LIST's); handle (an object's) | نافذة النص (L)؛ معرّف فريد (L) † — المعرّف alone is already an attribute's Tag |
|  | Hand cursor; trackpad; displacement (-PAN) | مؤشر اليد (L)؛ لوحة اللمس (M)؛ إزاحة (M) |
|  | Snap spacing; lattice (snap mode's points); polar snap; isometric snap | تباعد الالتقاط؛ شبكة نقاط؛ الالتقاط القطبي؛ الالتقاط متساوي القياس (L) † — شبكة نقاط keeps the snap's lattice apart from the grid, الشبكة |
|  | 3D polyline; curve-fit polyline; work plane; elevation plane | خط متعدد ثلاثي الأبعاد (M)؛ خط متعدد ملاءَم بمنحنى؛ مستوى العمل؛ مستوى المنسوب (L) |
|  | Fit data; order (a spline's), Elevate order | بيانات الملاءمة (L)؛ الرتبة، رفع الرتبة (M) |
|  | Thickness; extents, bounding box | السماكة (M)؛ المستطيل المحيط (M) |
|  | Insertion point; base point | نقطة الإدراج؛ نقطة الأساس (C) |
|  | Orthographic view; isometric view; isometric drawing | منظر إسقاطي (L) † — as the orthographic UCS's إسقاطي, against منظر متعامد؛ منظر متساوي القياس (M)؛ الرسم متساوي القياس، الأيزومتري (C) † — أيزومتري is the loanword courses use |
|  | SW / SE / NE / NW isometric (in prose) | متساوي القياس الجنوبي الغربي / الجنوبي الشرقي / الشمالي الشرقي / الشمالي الغربي (M) † — the view list's words, made definite |
|  | View control; View Manager; named view; drawing limits | عنصر التحكم في العرض (L) † — the editor's «عناصر التحكم في العرض» in the singular؛ مدير المناظر (L) †؛ منظر مسمى (L)؛ حدود الرسم (C) |
|  | Upright (a view); seen end-on; sloping face | معتدل (L) †؛ يُرى من طرفه (L)؛ وجه مائل (M) |
|  | Arm (of the UCS icon); 2D style; line width | ذراع (L)؛ النمط ثنائي الأبعاد (L)؛ عرض الخط (L) † — not وزن الخط, which is lineweight |
|  | Stepped block (a figure's solid) | مجسم متدرّج (L) — كتلة is BLOCK |
|  | Running snaps; one-point override; check box | أوضاع الالتقاط الجارية (L, as the engine's -OSNAP description)؛ تجاوز (L, as تجاوزات الالتقاط)؛ خانة اختيار (M) — the Drafting Settings dialog and its Object Snap tab keep their English names |
|  | Snap markers: square, triangle, circle, diamond, cross, plus, right angle, circle with a bar, hourglass; dashed path | مربع، مثلث، دائرة، معيّن، علامة ✕، علامة +، زاوية قائمة، دائرة بخط، ساعة رملية (M)؛ مسار متقطع (L) |
|  | Foot of the perpendicular | قدم العمود (M) |
|  | Geometric Center, Mid Between 2 Points, temporary track point (snaps not built; Node is built, below) | المركز الهندسي، المنتصف بين نقطتين، نقطة التتبع المؤقتة (L) — written with the English name beside them |
|  | Aperture (APERTURE) | فتحة الالتقاط (L) † |
| Exercises | Their drawings' layers: Outline, Centre lines, Hidden lines, Dimensions | الخطوط الظاهرة، خطوط المحاور، الخطوط المخفية، الأبعاد (M) † — the names a drafting template gives its layers, short enough for the Layer control; الخطوط الظاهرة (visible lines) pairs with the hidden ones, where المحيط is also the circumference |
|  | Exercise; Practice (a page's type); step by step; solved | تمرين؛ تدريب؛ خطوة بخطوة؛ محلول (M) — «تمارين محلولة» is how exercise books and searchers say «with solutions» |
|  | Beginner, Intermediate, Advanced; Mechanical, Architecture, Civil; 2D, Isometric, 3D solid | مبتدئ، متوسط، متقدم؛ ميكانيكي، معماري، مدني؛ ثنائي الأبعاد، أيزومتري، مجسم ثلاثي الأبعاد (M; أيزومتري C †, the loanword of the isometric drawing's row, short enough for a label) |
|  | Gasket; L bracket; mounting plate | حشية (M) † — جوان is the workshop word in Egypt and the Levant؛ حامل على شكل L (L) † — كتيفة is the everyday shelf bracket؛ لوح تثبيت (L) † — against صفيحة تثبيت |
|  | Flange; keyway; pitch circle (a flange's holes) | شفة (فلنجة) (M) † — the title gives both, فلنجة being the workshops' and the searchers' word؛ مجرى الخابور (M)؛ دائرة المراكز (L) † — دائرة الخطوة is a gear's |
|  | Bore; hole; bolt hole | تجويف (M) † — against ثقب مركزي؛ ثقب؛ ثقب برغي (M) |
|  | Boss (a link's, a bearing block's); hub, web, rim (a pulley's) | صُرّة (M) † — the hub's word, kept for a boss؛ القرص، الطوق (M) † |
|  | Stepped shaft; shoulder; side view; turned part | عمود متدرّج (M)؛ كتف (M)؛ منظر جانبي (M)؛ قطعة خراطة (L) — not مخروطة, which reads «conical» |
|  | Link (the part); bearing block | ذراع توصيل (L) † — against وصلة؛ كرسي محمل (C) † — كرسي رولمان in the workshop |
|  | Stairs; tread; a step's riser (the isometric block's) | درج (M) † — سلم is as common, «اوتوكاد درج» is the suggestion found؛ نائمة (C, the architects' word)؛ الوجه القائم للدرجة (L) — قائمة, the architects' riser, is opaque outside architecture |
|  | Plot of land; boundary; round table, seat, chair back | قطعة أرض (M)؛ الحدود (M)؛ طاولة مستديرة، مقعد، مسند الظهر (M) |
|  | Relative, polar coordinates; origin; isometric axes; isometric drafting, isocircles | الإحداثيات النسبية، القطبية (C)؛ نقطة الأصل (M)؛ المحاور الأيزومترية (C)؛ وضع الرسم الأيزومتري، الدوائر متساوية القياس (L) |
|  | Dimension scale; non-associative (a dimension); baseline, chain dimensions | مقياس الأبعاد (L)؛ غير ترابطي (L, as a hatch's Associative)؛ أبعاد من خط أساس، أبعاد متتابعة (C, as DIMBASELINE's and DIMCONTINUE's titles) |
|  | The Layer control | قائمة الطبقات المنسدلة (L) — as LAYER's notes, not عنصر التحكم في الطبقات |
|  | Conceptual (a caption's visual style); hidden lines removed | النمط المفاهيمي (L, as the landing's figures)؛ مع إزالة الخطوط المخفية (M) |
|  | Leaders, layouts (the FAQ's DXF answer); a binary file; Open a DXF file (DXFIN) | خطوط الإشارة، التخطيطات (L) †؛ ثنائية (M)؛ فتح ملف ⁨DXF⁩ (L) |
|  | Point (an object), points; Multiple Points, Divide, Measure (the tool palette); Point Style (PTYPE's dialog and its labels); Node (the object snap) | نقطة، نقاط (M)؛ نقاط متعددة، تقسيم، قياس (L)؛ نمط النقطة، حجم النقطة، تعيين الحجم نسبةً إلى الشاشة، بالوحدات المطلقة (L)؛ عقدة (C, the snap's usual name) |
|  | Solid (a 2D solid, the object), 2D Solid (the tool) | مجسم ثنائي الأبعاد (L) † |
| Guides | How-to guide; floor plan (a house's) | دليل، أدلة (M)؛ مخطط منزل، المسقط الأفقي (C) — «رسم مخطط منزل» is the searched phrase, المسقط الأفقي the drawing's name |
|  | A plan's layers: Walls, Doors, Windows, Dimensions (the reader's own) | الجدران، الأبواب، النوافذ، الأبعاد (M) |
|  | Outer and inner face (a wall's); inner wall; opening; entrance | الوجه الخارجي والداخلي؛ الجدار الداخلي؛ فتحة؛ المدخل (M) |
|  | Jamb | جانب الفتحة (L) † — حلق is the door's frame |
|  | Door leaf; swing; hinge | ضلفة (C) † — مصراع is the literary word؛ قوس فتح الباب (L)؛ المفصّلة (M) |
|  | Absolute coordinates; anticlockwise; holding an angle | الإحداثيات المطلقة (C)؛ عكس اتجاه عقارب الساعة (M)؛ تثبيت الزاوية (L) |
|  | Polar tracking's guide | مسار التتبع (L) † — as the -OSNAP notes' «مسار تتبع قطبي», against خط إرشادي |
|  | Profile (a solid's); closed area (PRESSPULL's) | مقطع (M, as EXTRUDE's notes)؛ مساحة مغلقة (M) — not منطقة, which is a region |
|  | Sweeps, lofts, meshes, rendering (what 3D still lacks) | المسح على مسار، الانتقال بين المقاطع، الشبكات، الإظهار (L, as the FAQ's 3D answer) |
|  | Overall scale (a dimension style's) | المقياس العام لنمط البُعد (L, as the Dimension styles row) |

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
  01/10/2026; the visibility audit's Trends, autocomplete and results pages, 05/11/2026,
  `~/seo-data/audit-2026-11-05/languages.md` part A): the home's main query is «رسم هندسي اون لاين»
  (technical drawing online), where `/ar` is n.º 5 on Google in Egypt and gets most of the site's
  clicks; then «اوتوكاد اون لاين», «بديل اوتوكاد» (مجاني / اون لاين), «برنامج رسم هندسي مجاني», «رسم
  ثنائي الابعاد اون لاين» and «أوامر الأوتوكاد واختصاراتها» («اختصارات» is the word for aliases).
  Every one is below Trends' floor and suggested in all six countries: a long tail with weak
  results (Facebook posts, PDFs, videos, no tool).
- **AutoCAD is typed without hamza**: «اوتوكاد» carries nearly all of the Arabic-script searches
  (Egypt 22.6 against 0.02 for «أوتوكاد»), but Google matches the two as one — pages titled
  «أوتوكاد أون لاين» rank for «اوتوكاد اون لاين» — so the copy keeps the standard spelling,
  «أوتوكاد» and «أون لاين».
- **«بديل أوتوكاد» is searched** (suggested in all six countries, «بديل اوتوكاد مجاني» and «… اون
  لاين» among them), and an alternative is not a claim to be AutoCAD: the description says «بديل
  لأوتوكاد». «كاد» alone now finds Tinkercad (it found Cadillac on 01/10/2026).
- Only 28–37 % of the AutoCAD searches of Egypt, Saudi Arabia and Iraq are in Arabic script, and
  0–4 % in the Maghreb, which searches «autocad gratuit» in latin letters: `/ar` cannot reach it.
- Title: «رسم هندسي أون لاين مجانًا بأوامر أوتوكاد — MellowCAD» (52), with no room left for «ثنائي
  وثلاثي الأبعاد», which the description carries: «برنامج رسم هندسي مجاني في متصفحك، بديل لأوتوكاد
  بأوامره واختصاراتها: رسم ثنائي الأبعاد ومجسمات ثلاثية الأبعاد لا تزال جزئية. بلا تثبيت ولا
  تسجيل.» (145). The H1, the share card's eyebrow and the footer: «رسم هندسي أون لاين مجانًا بأوامر
  أوتوكاد», which fills the card's line (445 of 470 px at 24 px in Readex Pro): a longer one would
  run off it, as the card never wraps a right-to-left line (`marketing.md`).
- **The exercises** (the audit's autocomplete, 05/11/2026): «تمارين اوتوكاد للمبتدئين», «رسومات
  اوتوكاد للمبتدئين» and «رسم اوتوكاد ثلاثي الابعاد» are suggested in six countries, «اوتوكاد رسم
  ميكانيكي», «اوتوكاد درج» and «رسومات اوتوكاد صعبه» in Egypt and Saudi Arabia. So the library's
  title is «تمارين أوتوكاد», its search title «تمارين أوتوكاد للمبتدئين، محلولة ومجانية», and each
  exercise's «تمرين أوتوكاد…» with the discipline or «ثلاثي الأبعاد» where it fits.
- **The DXF page** (Google's suggestions in Egypt and Saudi Arabia, 08/11/2026): «فتح ملف dxf»
  and «فتح ملف dxf اون لاين», «فتح ملفات dxf أون لاين», «برنامج فتح ملفات dxf» (للكمبيوتر,
  للاندرويد) and, for a viewer, «عارض ملفات dxf». Title «فتح ملف ⁨DXF⁩ أون لاين»; search title
  «فتح ملف ⁨DXF⁩ أون لاين: عارض ملفات ⁨DXF⁩ مجاني» (58 with the brand), «أون لاين» spelt as the
  home's. Its object names without an Arabic AutoCAD word (SOLID, TRACE, XLINE, RAY, MLINE,
  WIPEOUT) carry their DXF names beside them, as the command line counts them by those names.
- **The DXF edit page**: Google suggests nothing in Arabic for editing a DXF in Egypt or Saudi
  Arabia (12/11/2026; «dxf online editor» comes in English), so its search title follows the
  Arabic H1s that rank for «تعديل ملف dxf اون لاين» (Aspose, KulmanLab: «محرر … DXF … مجاني»):
  «محرر ⁨DXF⁩ أون لاين مجاني: عدّل ملف ⁨DXF⁩ واحفظه».

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
   30 tool names, and 5 swept solid rows since (04/11/2026); in `packages/editor/src/locales/ar.json`, split from the site's catalog since,
   the layer dialogs (`Layers.dialog`), the rail's flyouts and MTEXT's unsaved-changes dialog;
   in `messages/ar.json`, 79 new keys (the docs' pages and shortcuts, `Docs.*`) and 18 rewritten
   (the FAQ, the Status section), and on 05/11/2026 the search texts (`Metadata`'s title and
   descriptions, the H1 and `Hero.lead`, the taglines) and the FAQ's 3D question (`Faq.q10`,
   `Faq.a10`); on 06/11/2026 the landing's redesign, about 70 keys (`Hero`, `Proof`, `Commands`,
   `Precision`, `Toolset`, `Solids`, `LocalFirst`, `Audience`, the FAQ's DWG and class questions,
   `Footer.trademark`).
3. **The rest** of `messages/ar.json` and `cad/locales/ar.json`, the plurals' six categories first.

A review received goes in as any fix, and the status lines then name its date.
