// Generated from ru.json by `npm run locales`. Do not edit.
import type { EditorLocale } from "./types"

export const ru: EditorLocale = {
  "tag": "ru",
  "messages": {
    "Workspace": {
      "canvas": "Область рисования САПР"
    },
    "Keys": {
      "save": "Ctrl+S",
      "open": "Ctrl+O",
      "undo": "Ctrl+Z",
      "redo": "Ctrl+Y",
      "commandLine": "Ctrl+9",
      "cleanScreen": "Ctrl+0",
      "cut": "Ctrl+X",
      "copy": "Ctrl+C",
      "copyBase": "Ctrl+Shift+C",
      "paste": "Ctrl+V"
    },
    "TitleBar": {
      "menu": "Меню приложения",
      "new": "Создать",
      "open": "Открыть",
      "save": "Сохранить",
      "saveAs": "Сохранить как",
      "newHint": "Создание нового чертежа",
      "newDrawing": "Чертеж",
      "newDrawingHint": "Создание нового чертежа.",
      "openHint": "Открытие файла",
      "openDrawing": "Чертеж",
      "openDrawingHint": "Открытие существующего файла чертежа.",
      "saveAsHint": "Сохранение копии чертежа",
      "saveAsDrawing": "Чертеж",
      "saveAsDrawingHint": "Сохранение текущего чертежа в формате файлов по умолчанию.",
      "saveAsOther": "Другие форматы",
      "saveAsOtherHint": "Сохранение текущего чертежа в формате файлов DXF.",
      "utilities": "Утилиты",
      "utilitiesHint": "Инструменты работы с чертежом",
      "units": "Единицы",
      "unitsHint": "Задание формата отображения и точности координат и углов.",
      "openDocuments": "Открытые документы",
      "language": "Язык",
      "feedback": "Обратная связь",
      "help": "Справка",
      "saving": "Сохранение…",
      "saved": "Сохранено",
      "savedHint": "Сохранено на этом устройстве",
      "undo": "Отменить",
      "redo": "Повторить",
      "undoCount": [
        [
          "count",
          2,
          {
            "=1": [
              "Отменить ",
              0,
              " команду"
            ],
            "other": [
              "Отменить ",
              0,
              " команд(ы)"
            ]
          }
        ]
      ],
      "redoCount": [
        [
          "count",
          2,
          {
            "=1": [
              "Повторить ",
              0,
              " команду"
            ],
            "other": [
              "Повторить ",
              0,
              " команд(ы)"
            ]
          }
        ]
      ]
    },
    "NavigationBar": {
      "label": "Панель навигации",
      "zoom": "Зумирование",
      "extents": "Показать до границ",
      "window": "Показать рамкой",
      "previous": "Показать предыдущий",
      "in": "Увеличить",
      "out": "Уменьшить"
    },
    "Viewport": {
      "view": [
        "Управление видами: ",
        [
          "name"
        ]
      ]
    },
    "ViewCube": {
      "label": "ViewCube",
      "home": "Исходный вид",
      "parallel": "Параллельная",
      "setHome": "Текущий вид как исходный",
      "rollClockwise": "Повернуть по часовой стрелке",
      "rollCounterclockwise": "Повернуть против часовой стрелки",
      "wcs": "МСК",
      "unnamed": "Без имени",
      "newUcs": "Новая ПСК",
      "adjacent": {
        "up": "Показать грань сверху",
        "down": "Показать грань снизу",
        "left": "Показать грань слева",
        "right": "Показать грань справа"
      }
    },
    "Ribbon": {
      "tabs": {
        "home": "Главная",
        "insert": "Вставка",
        "annotate": "Аннотации",
        "tools3d": "3D-инструменты",
        "view": "Вид"
      },
      "panels": {
        "draw": "Рисование",
        "modify": "Редактирование",
        "annotation": "Аннотации",
        "layers": "Слои",
        "block": "Блок",
        "properties": "Свойства",
        "utilities": "Утилиты",
        "clipboard": "Буфер обмена",
        "insertBlock": "Блок",
        "blockDefinition": "Определение блока",
        "text": "Текст",
        "dimensions": "Размеры",
        "markup": "Пометка",
        "viewportTools": "Инструменты видового экрана",
        "visualStyles": "Визуальные стили",
        "coordinates": "Координаты",
        "palettes": "Палитры",
        "navigate": "Навигация",
        "modeling": "Моделирование",
        "solidEditing": "Редактирование тела",
        "coordinates3d": "Координаты"
      },
      "items": {
        "line": "Отрезок",
        "polyline": "Полилиния",
        "circle": "Центр, радиус",
        "circlediameter": "Центр, диаметр",
        "circle2p": "2 точки",
        "circle3p": "3 точки",
        "arc": "3 точки",
        "arcsce": "Начало, центр, конец",
        "arccse": "Центр, начало, конец",
        "rectangle": "Прямоугольник",
        "polygon": "Полигон",
        "ellipsecenter": "Центр",
        "ellipse": "Ось, конец",
        "ellipsearc": "Эллиптическая дуга",
        "hatch": "Штриховка",
        "splinefit": "Сплайн по определяющим точкам",
        "splinecv": "Сплайн по управляющим вершинам",
        "xline": "Вспомогательная линия",
        "ray": "Луч",
        "point": "Несколько точек",
        "divide": "Поделить",
        "measuresegments": "Разметить",
        "region": "Область",
        "wipeout": "Маскировка",
        "polyline3d": "3D полилиния",
        "move": "Перенести",
        "copy": "Копировать",
        "stretch": "Растянуть",
        "rotate": "Повернуть",
        "mirror": "Отразить зеркально",
        "scale": "Масштаб",
        "trim": "Обрезать",
        "extend": "Удлинить",
        "fillet": "Сопряжение",
        "chamfer": "Фаска",
        "array": "Прямоугольный массив",
        "arraypath": "Массив по траектории",
        "arraypolar": "Круговой массив",
        "erase": "Стереть",
        "explode": "Расчленить",
        "offset": "Сместить",
        "pedit": "Редактировать полилинию",
        "splinedit": "Редактировать сплайн",
        "break": "Разорвать",
        "breakatpoint": "Разорвать в точке",
        "join": "Соединить",
        "mtext": "Многострочный текст",
        "text": "Однострочный текст",
        "dimlinear": "Линейный",
        "dimaligned": "Параллельный",
        "dimangular": "Угловой",
        "dimradius": "Радиус",
        "dimdiameter": "Диаметр",
        "textStyle": "Стиль текста",
        "dimensionStyle": "Размерный стиль",
        "manageTextStyles": "Управление стилями текста...",
        "manageDimensionStyles": "Управление размерными стилями...",
        "layerProperties": "Свойства слоя",
        "insert": "Вставка",
        "block": "Создать",
        "attedit": "Один",
        "attdef": "Определение атрибутов",
        "matchprop": "Копирование свойств",
        "list": "Список",
        "measure": "Расстояние",
        "measurearea": "Площадь",
        "id": "Координаты",
        "ptype": "Отображение точек...",
        "paste": "Вставить",
        "cutclip": "Вырезать",
        "copyclip": "Копировать в буфер",
        "copybase": "Копировать с базовой точкой",
        "createBlock": "Создать блок",
        "dimspace": "Отрегулировать пространство",
        "dimensionUpdate": "Обновить",
        "dimcontinue": "Продолжить",
        "dimbaseline": "Базовый",
        "ucsIcon": "Знак ПСК",
        "viewCube": "View Cube",
        "ucs": "ПСК",
        "ucsWorld": "ПСК, Мировая СК",
        "ucsX": "X",
        "ucsY": "Y",
        "ucsZ": "Z",
        "ucsPrevious": "ПСК, Предыдущая СК",
        "ucsOrigin": "Начало",
        "ucsZAxis": "Ось Z",
        "ucs3Point": "3 точки",
        "ucsView": "Вид",
        "ucsObject": "Объект",
        "ucsFace": "Грань",
        "propertiesPalette": "Свойства",
        "blocksPalette": "Блоки",
        "commandLine": "Командная строка",
        "pan": "Панорамирование",
        "orbit": "Орбита",
        "zoomExtents": "Границы",
        "zoomWindow": "Рамка",
        "zoomPrevious": "Предыдущий",
        "zoomIn": "Увелич",
        "zoomOut": "Уменьш",
        "box": "Ящик",
        "cylinder": "Цилиндр",
        "cone": "Конус",
        "sphere": "Сфера",
        "pyramid": "Пирамида",
        "wedge": "Клин",
        "torus": "Тор",
        "extrude": "Выдавить",
        "revolve": "Вращать",
        "presspull": "Вытягивание",
        "filletedge": "Сопряжение по кромке",
        "chamferedge": "Фаска по кромке",
        "slice": "Сечение",
        "union": "Объединение",
        "subtract": "Вычитание",
        "intersect": "Пересечение",
        "solideditextrude": "Выдавить грани",
        "solidedittaper": "Свести грани на конус",
        "solideditmove": "Перенести грани",
        "solideditcopy": "Копировать грани",
        "solideditoffset": "Сместить грани",
        "solideditrotate": "Повернуть грани",
        "solideditdelete": "Удалить грани",
        "insertAttedit": "Один",
        "defineAttributes": "Задание атрибутов",
        "multilineText": "Многострочный текст",
        "dimensionsLinear": "Линейный",
        "dimensionsAligned": "Параллельный",
        "dimensionsAngular": "Угловой",
        "dimensionsRadius": "Радиус",
        "dimensionsDiameter": "Диаметр",
        "axisX": "X",
        "axisY": "Y",
        "axisZ": "Z",
        "view3d": "Вид",
        "world": "Мировая",
        "previous": "Предыдущий",
        "attModeNormal": "Сохранить отображение атрибутов",
        "attModeOn": "Показать все атрибуты",
        "attModeOff": "Скрыть все атрибуты"
      },
      "splits": {
        "circle": "Круг",
        "arc": "Дуга",
        "text": "Текст",
        "array": "Массив",
        "measure": "Измерить",
        "editAttributes": "Редактировать атрибуты",
        "editAttribute": "Редактировать атрибут",
        "rotateUcs": "Повернуть ПСК",
        "defineUcs": "Определить ПСК"
      },
      "layer": "Слой",
      "color": "Цвет объекта",
      "lineweight": "Вес линий",
      "linetype": "Тип линий",
      "pin": "Закрепить",
      "moreColors": "Дополнительные цвета...",
      "minimize": {
        "full": "Показать всю ленту",
        "tabs": "Свернуть до вкладок",
        "panelTitles": "Свернуть до названий панелей",
        "panelButtons": "Свернуть до кнопок панелей",
        "cycle": "Перебор всех вариантов"
      }
    },
    "CommandLine": {
      "label": "Командная строка",
      "typeCommand": "Введите команду",
      "history": "Журнал команд",
      "close": "Закрыть",
      "recentCommands": "Последние команды"
    },
    "DynamicInput": {
      "locked": "заблокировано"
    },
    "StatusBar": {
      "coordinates": "Координаты",
      "model": "МОДЕЛЬ",
      "modelSpace": "Пространство модели",
      "grid": "Сетка",
      "objectSnap": "Объектная привязка",
      "objectSnapSettings": "Параметры объектной привязки",
      "snapMode": "Шаговая привязка",
      "snapSettings": "Параметры привязки",
      "snap": "Шаг",
      "gridSnap": "Шаговая привязка",
      "polarSnap": "Полярная привязка",
      "snapX": "Шаг по X",
      "snapXSpacing": "Шаг привязки по X",
      "snapY": "Шаг по Y",
      "snapYSpacing": "Шаг привязки по Y",
      "polarDistance": "Шаг",
      "polarSnapDistance": "Шаг полярной привязки",
      "ortho": "Режим «Орто»",
      "polarTracking": "Полярное отслеживание",
      "polarTrackingAngle": "Угол полярного отслеживания",
      "polarAngle": "Полярный угол",
      "objectSnapTracking": "Объектное отслеживание",
      "selectionCycling": "Циклический выбор",
      "selectionCyclingSettings": "Параметры циклического выбора",
      "selectionList": "Отображать поле списка циклического выбора",
      "showLineweight": "Показать вес линий",
      "units": "Единицы",
      "cleanScreen": "Очистить экран",
      "customization": "Адаптация"
    },
    "Units": {
      "title": "Единицы чертежа",
      "length": "Линейные",
      "type": "Формат",
      "precision": "Точность",
      "decimal": "Десятичные",
      "insertionScale": "Масштаб вставки",
      "insertedContent": "Единицы для изменения вставленных элементов:",
      "millimeters": "Миллиметры",
      "centimeters": "Сантиметры",
      "meters": "Метры",
      "sampleOutput": "Пример",
      "ok": "ОК",
      "cancel": "Отмена"
    },
    "SaveAs": {
      "title": "Сохранение чертежа",
      "fileName": "Имя файла:",
      "fileType": "Тип файла:",
      "tools": "Сервис",
      "options": "Параметры…",
      "save": "Сохранить",
      "cancel": "Отмена",
      "drawing": "Чертеж MellowCAD (*.ecad.json)",
      "dxf2018": "AutoCAD 2018 DXF (*.dxf)",
      "dxf2013": "AutoCAD 2013/LT2013 DXF (*.dxf)",
      "dxf2010": "AutoCAD 2010/LT2010 DXF (*.dxf)",
      "dxf2007": "AutoCAD 2007/LT2007 DXF (*.dxf)",
      "dxf2004": "AutoCAD 2004/LT2004 DXF (*.dxf)",
      "dxf2000": "AutoCAD 2000/LT2000 DXF (*.dxf)",
      "dxfR12": "AutoCAD R12/LT2 DXF (*.dxf)",
      "optionsTitle": "Параметры сохранения",
      "dxfOptions": "Параметры DXF",
      "format": "Формат",
      "ascii": "ASCII",
      "binary": "ДВОИЧНЫЙ",
      "selectObjects": "С выбором объектов",
      "preview": "С миниатюрой",
      "precision": "Число десятичных знаков (от 0 до 16)",
      "ok": "ОК"
    },
    "SnapOverride": {
      "from": "От",
      "pointFilters": "Координатные фильтры",
      "none": "Ничего"
    },
    "SelectionCycling": {
      "title": "Выбор",
      "none": "Нет"
    },
    "ShortcutMenu": {
      "label": "Контекстное меню",
      "repeat": [
        "Повторить ",
        [
          "command"
        ]
      ],
      "clipboard": "Буфер обмена",
      "copyBase": "Копировать с базовой точкой",
      "paste": "Вставить",
      "undo": "Отменить",
      "redo": "Повторить",
      "copySelection": "Копировать выбранные",
      "deselectAll": "Отменить выбор",
      "properties": "Свойства",
      "enter": "Ввод",
      "cancel": "Отмена",
      "snapOverrides": "Переопределение привязок",
      "dimensionStyle": "Размерный стиль"
    },
    "Layers": {
      "title": "Слои",
      "newLayer": "Создать слой",
      "deleteLayer": "Удалить слой",
      "setCurrentLayer": "Установить",
      "keys": {
        "new": "Д",
        "delete": "У",
        "setCurrent": "С"
      },
      "withKey": [
        [
          "label"
        ],
        " (Alt+",
        [
          "key"
        ],
        ")"
      ],
      "currentLayer": [
        "Текущий слой: ",
        [
          "name"
        ]
      ],
      "all": "Все",
      "status": [
        [
          "filter"
        ],
        ": отображается слоев — ",
        [
          "shown",
          4
        ],
        ", всего слоев — ",
        [
          "total",
          4
        ]
      ],
      "statusShort": [
        [
          "filter"
        ],
        ": ",
        [
          "shown",
          4
        ],
        " из ",
        [
          "total",
          4
        ]
      ],
      "current": "Текущий слой",
      "colorLabel": [
        "Цвет слоя ",
        [
          "name"
        ]
      ],
      "color": "Цвет слоя",
      "linetypeLabel": [
        "Тип линий слоя ",
        [
          "name"
        ]
      ],
      "lineweightLabel": [
        "Вес линий слоя ",
        [
          "name"
        ]
      ],
      "on": "Вкл",
      "off": "Откл",
      "unlocked": "Разблокировано",
      "locked": "Заблокировано",
      "rename": "Щелкните имя выбранного слоя еще раз, чтобы переименовать его",
      "renameLabel": [
        "Переименовать слой ",
        [
          "name"
        ]
      ],
      "list": "Список слоев",
      "dialog": {
        "close": "Закрыть",
        "notDeleted": {
          "title": "Слой — не удален",
          "instruction": "Выбранный слой не удален.",
          "content": "Следующие слои нельзя удалить:",
          "base": "Слои 0 и Defpoints",
          "current": "Текущий слой",
          "inUse": "Слои, содержащие объекты",
          "xref": "Слои, зависимые от внешних ссылок"
        },
        "currentOff": {
          "title": "Слой — текущий слой отключен",
          "instruction": "Текущий слой будет отключен. Выберите требуемое действие.",
          "turnOff": "Отключить текущий слой",
          "turnOffNote": "Объекты, создаваемые с этого момента, не будут отображаться на чертеже, пока слой не будет снова включен.",
          "keepOn": "Оставить текущий слой включенным"
        },
        "nameInUse": {
          "title": "Слой — имя уже существует",
          "instruction": [
            "Имя ",
            [
              "name"
            ],
            " уже используется."
          ],
          "content": "Необходимо ввести другое имя."
        },
        "invalidName": {
          "title": "Слой",
          "instruction": "Недопустимые символы в имени слоя.",
          "content": "В именах слоев не допускается употребление следующих символов:"
        },
        "cannotRename": {
          "title": "Слой — переименование",
          "instruction": "Выбранный слой нельзя переименовать.",
          "content": "Следующие слои нельзя переименовать:",
          "base": "Слой 0",
          "xref": "Слои, зависимые от внешних ссылок"
        }
      },
      "columns": {
        "status": "Статус",
        "name": "Имя",
        "on": "Вкл",
        "lock": "Блокировать",
        "color": "Цвет",
        "linetype": "Тип линий",
        "lineweight": "Вес линий"
      }
    },
    "TextStyle": {
      "title": "Стили текста",
      "current": [
        "Текущий стиль текста: ",
        [
          "name"
        ]
      ],
      "styles": "Стили:",
      "allStyles": "Все стили",
      "stylesInUse": "Задействованные стили",
      "font": "Шрифт",
      "fontName": "Имя шрифта:",
      "size": "Размер",
      "height": "Высота",
      "setCurrent": "Сделать текущим",
      "new": "Новый...",
      "delete": "Удалить",
      "apply": "Применить",
      "cancel": "Отмена",
      "close": "Закрыть",
      "newTitle": "Новый стиль текста",
      "styleName": "Имя стиля:",
      "ok": "ОК"
    },
    "DimStyle": {
      "title": "Диспетчер размерных стилей",
      "current": [
        "Текущий размерный стиль: ",
        [
          "name"
        ]
      ],
      "styles": "Стили:",
      "list": "Вывести в список:",
      "allStyles": "Все стили",
      "stylesInUse": "Задействованные стили",
      "setCurrent": "Установить",
      "new": "Новый...",
      "modify": "Редактировать...",
      "close": "Закрыть",
      "menuSetCurrent": "Установить",
      "rename": "Переименовать",
      "delete": "Удалить",
      "createTitle": "Создание нового размерного стиля",
      "newStyleName": "Имя нового стиля:",
      "startWith": "На основе:",
      "continue": "Далее",
      "cancel": "Отмена",
      "newTitle": [
        "Новый размерный стиль: ",
        [
          "name"
        ]
      ],
      "modifyTitle": [
        "Изменение размерного стиля: ",
        [
          "name"
        ]
      ],
      "ok": "ОК",
      "lines": "Линии",
      "symbolsAndArrows": "Символы и стрелки",
      "text": "Текст",
      "fit": "Размещение",
      "primaryUnits": "Основные единицы",
      "dimensionLines": "Размерные линии",
      "baselineSpacing": "Шаг в базовых размерах:",
      "extensionLines": "Выносные линии",
      "extendBeyondDimLines": "Удлинение за размерные:",
      "offsetFromOrigin": "Отступ от объекта:",
      "arrowheads": "Стрелки",
      "arrowSize": "Размер стрелки:",
      "centerMarks": "Маркеры центра",
      "none": "Нет",
      "mark": "Маркер",
      "textAppearance": "Свойства текста",
      "textHeight": "Высота текста:",
      "textPlacement": "Размещение текста",
      "offsetFromDimLine": "Отступ от размерной линии:",
      "scaleForFeatures": "Масштаб размерных элементов",
      "useOverallScale": "Глобальный масштаб:",
      "fineTuning": "Подгонка элементов",
      "drawDimLine": "Размерная линия между выносными",
      "linearDimensions": "Линейные размеры",
      "precision": "Точность:",
      "decimalSeparator": "Десятичный разделитель:",
      "comma": "',' (запятая)",
      "period": "'.' (точка)",
      "space": "' ' (пробел)",
      "zeroSuppression": "Подавление нулей",
      "trailing": "Хвостовые",
      "angularDimensions": "Угловые размеры",
      "angularPrecision": "Точность:"
    },
    "Blocks": {
      "title": "Блоки",
      "empty": "Блоки не определены. Нарисуйте что-нибудь и выполните команду БЛОК.",
      "currentDrawing": "Текущий чертеж",
      "currentDrawingBlocks": "Блоки текущего чертежа",
      "filterHint": "Фильтр...",
      "views": {
        "extraLarge": "Очень большой значок",
        "large": "Крупный значок",
        "medium": "Средний значок",
        "small": "Мелкий значок",
        "list": "Список"
      },
      "options": "Параметры",
      "insertionPoint": "Точка вставки",
      "scale": "Масштаб",
      "uniformScale": "Единый масштаб",
      "rotation": "Поворот",
      "angle": "Угол",
      "x": "X:",
      "y": "Y:",
      "z": "Z:"
    },
    "Properties": {
      "noSelection": "Ничего не выбрано",
      "general": "Общие",
      "color": "Цвет",
      "colorLabel": "Цвет выбранных объектов",
      "layer": "Слой",
      "layerLabel": "Слой выбранных объектов",
      "linetype": "Тип линий",
      "linetypeLabel": "Тип линий выбранных объектов",
      "lineweight": "Вес линий",
      "lineweightLabel": "Вес линий выбранных объектов",
      "style": "Стиль",
      "textStyleLabel": "Стиль текста выбранных объектов",
      "dimStyle": "Размерный стиль",
      "dimStyleLabel": "Размерный стиль выбранных объектов",
      "varies": "*РАЗЛИЧНЫЕ*",
      "title": "Свойства",
      "objectType": "Тип объекта",
      "currentLayerLabel": "Текущий слой",
      "currentColorLabel": "Текущий цвет",
      "currentLinetypeLabel": "Текущий тип линий",
      "currentLineweightLabel": "Текущий вес линий",
      "lockedObjects": {
        "title": "Свойства — заблокированные объекты",
        "instruction": "Один или несколько выбранных объектов заблокированы и не могут быть обновлены.",
        "content": [
          "Объектов, исключенных из набора: ",
          [
            "count",
            4
          ]
        ],
        "close": "Закрыть"
      },
      "selectColor": "Выбор цвета..."
    },
    "MText": {
      "unsavedChanges": {
        "title": "Многострочный текст — несохраненные изменения",
        "instruction": "Сохранить изменения текста?",
        "yes": "Да",
        "no": "Нет",
        "cancel": "Отмена"
      }
    },
    "Palette": {
      "layers": "Диспетчер свойств слоев",
      "close": "Закрыть",
      "options": "Свойства",
      "move": "Переместить",
      "size": "Размер",
      "allowDocking": "Разрешить закрепление",
      "anchorLeft": "Закрепить Слева",
      "anchorRight": "Закрепить Справа",
      "autoHide": "Автоматически убирать с экрана",
      "autoHideButton": "Автоматически убирать с экрана",
      "ctrlPrevents": "Для отмены закрепления удерживайте Ctrl в нажатом состоянии.",
      "ctrlAllows": "Чтобы разрешить прикрепление, нажмите клавишу Ctrl.",
      "releasePrevents": "Для отключения прикрепления отпустите клавишу Ctrl.",
      "resize": "Ширина палитры"
    },
    "PointStyle": {
      "title": "Отображение точек",
      "figures": "Образцы отображения точек",
      "pointSize": "Размер точки:",
      "relative": "Относительно экрана",
      "absolute": "В абсолютных единицах",
      "percent": "%",
      "units": "Ед.",
      "invalid": "Неверный ввод.",
      "ok": "ОК",
      "cancel": "Отмена"
    }
  }
}
