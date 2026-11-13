import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../test/harness"
import { lineOf, p } from "../../test/builders"
import { ru as russian } from "../locales/ru"

// What Russian AutoCAD 2027's console prints and accepts, as a user of it types
// (the probes named in each case, ru-RU; docs/i18n/ru.md, "Command language").

function answer(cad: CadHarness, ...answers: string[]): CadHarness {
  for (const text of answers) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

const asked = (cad: CadHarness) => cad.state().commandLine.prompt
const inRussian = (entities = [lineOf(p(0, 0), p(10, 0))]) =>
  createHarness({ locale: russian, entities })

describe("Russian AutoCAD's command language", () => {
  it("asks ОТРЕЗОК's points, Undo lettered Т alone and О beside Close (line/p01, p164)", () => {
    const cad = answer(inRussian(), "ОТРЕЗОК")
    expect(asked(cad)).toBe("ОТРЕЗОК Первая точка:")
    expect(asked(answer(cad, "0,0"))).toBe(
      "ОТРЕЗОК Следующая точка или [оТменить]:"
    )
    expect(asked(answer(cad, "10,0", "10,10"))).toBe(
      "ОТРЕЗОК Следующая точка или [Замкнуть/Отменить]:"
    )
  })

  it("runs ОТРЕЗОК by its alias ОТ, typed in Cyrillic, and _LINE in any language", () => {
    expect(asked(answer(inRussian(), "от"))).toBe("ОТРЕЗОК Первая точка:")
    expect(asked(answer(inRussian(), "_LINE"))).toBe("ОТРЕЗОК Первая точка:")
  })

  it("leaves LINE, typed on the latin layout, an unknown command", () => {
    const cad = answer(inRussian(), "LINE")
    expect(cad.commandLog().join("\n")).toContain('"LINE"')
    expect(asked(cad)).toBe("Команда:")
  })

  // ОТ is ОТРЕЗОК's alias at Команда: and FROM where a point is asked: the
  // help's СМЕЩЕНИЕ is refused there (names/p03, 13/11/2026).
  it("takes ОТ at a point prompt as FROM, asking its base point and offset (names/p03)", () => {
    const cad = answer(inRussian(), "ОТРЕЗОК", "ОТ")
    expect(asked(cad)).toBe("ОТРЕЗОК Базовая точка:")
    expect(asked(answer(cad, "0,0"))).toBe("ОТРЕЗОК <Смещение>:")
    answer(cad, "@10,0", "20,0", "")
    const drawn = cad.latest()
    expect(drawn.type === "line" && drawn.start).toBeCloseToPoint(p(10, 0))
  })

  it("suggests ОТРЕЗОК for ОТ at Команда:, never FROM", () => {
    const cad = inRussian()
    cad.runtime.setCommandLineText("ОТ")
    const names = cad.state().commandLine.suggestions.map((row) => row.name)
    expect(names[0]).toBe("ОТРЕЗОК")
    expect(names).not.toContain("ОТ")
  })

  it("undoes with О, the name acad.pgp also gives UNION as an alias (desktop, names/d01)", () => {
    const cad = answer(inRussian([]), "ОТРЕЗОК", "0,0", "10,0", "")
    expect(cad.entities()).toHaveLength(1)
    answer(cad, "О")
    expect(cad.entities()).toHaveLength(0)
  })

  // The console's, where the table's 21215 says Точка (the offset probes).
  it("runs ПОДОБИЕ by ПОД, with Через for Through", () => {
    expect(asked(answer(inRussian(), "ПОД"))).toBe(
      "ПОДОБИЕ Укажите расстояние смещения или [Через/Удалить/Слой] <Через>:"
    )
  })

  it("reads -ПРИВЯЗКА's words by their three capitals (names/p07)", () => {
    const modes = answer(
      inRussian(),
      "-ПРИВЯЗКА",
      "КОН,ЦЕН,ПЕР,ПРО",
      "-ПРИВЯЗКА"
    )
    expect(asked(modes)).toBe("-ПРИВЯЗКА Список режимов объектной привязки:")
    expect(modes.commandLog().join("\n")).toContain(
      "Текущие режимы привязки: Кон,Цен,Пер,Про"
    )
  })

  it("takes СЕР at a point prompt as Midpoint and refuses С (names/p09)", () => {
    const cad = answer(inRussian(), "ОТРЕЗОК", "СЕР", "5,0.1", "20,20", "")
    expect(cad.commandLog().join("\n")).not.toContain("Неверная точка.")
    const drawn = cad.latest()
    expect(drawn.type === "line" && drawn.start).toBeCloseToPoint(p(5, 0))
    const refused = answer(inRussian(), "ОТРЕЗОК", "С")
    expect(refused.commandLog().join("\n")).toContain("Неверная точка.")
  })
})

// What only the desktop shows (names/d01, ru-RU, 13/11/2026): each drafting
// toggle says вкл or откл, Selection Cycling with a full stop after it.
describe("Russian words of the desktop", () => {
  it("echoes the drafting toggles as the desktop's history does (names/d01)", () => {
    const cad = createHarness({ locale: russian })
    const toggled = (key: string) => {
      const from = cad.commandLog().length
      cad.press(key)
      return cad.commandLog().slice(from)
    }
    expect([
      ...toggled("F9"),
      ...toggled("F3"),
      ...toggled("F8"),
      ...toggled("F10"),
      ...toggled("F11"),
      ...toggled("F7"),
      ...toggled("F7"),
      ...toggled("F4"),
      ...toggled("F4"),
    ]).toEqual([
      " <Шаг вкл>",
      " <Привязка вкл>",
      " <Орто вкл>",
      " <Полярная вкл>",
      " <Объектное отслеживание откл>",
      " <Сетка откл>",
      " <Сетка вкл>",
      " <Циклический выбор вкл.>",
      " <Циклический выбор откл.>",
    ])
  })
})
