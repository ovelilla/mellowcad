import { createTranslator } from "next-intl"
import { describe, expect, it } from "vitest"

import type { AppLocale } from "@/i18n/routing"

import { formatPlural, pluralMessage } from "./plural"

function split(locale: AppLocale, message: string) {
  const t = createTranslator({ locale, messages: { message } })
  return pluralMessage(locale, (count) => t("message", { count }))
}

describe("plural messages for client islands", () => {
  const english = split(
    "en",
    "{count, plural, one {# object} other {# objects}} saved"
  )

  it("keeps one form per category with the count as #", () => {
    expect(english.forms).toEqual({
      one: "# object saved",
      other: "# objects saved",
    })
  })

  it("formats in the browser as the ICU message would", () => {
    expect(formatPlural(english, 1)).toBe("1 object saved")
    expect(formatPlural(english, 3)).toBe("3 objects saved")
    expect(formatPlural(english, 1200)).toBe("1,200 objects saved")
  })

  it("covers every category a language gives whole numbers", () => {
    const arabic = split(
      "ar",
      "{count, plural, zero {لا شيء} one {واحد} two {اثنان} few {# قليلة} many {# كثيرة} other {# أخرى}}"
    )
    expect(Object.keys(arabic.forms).sort()).toEqual(
      ["few", "many", "one", "other", "two", "zero"].sort()
    )
    expect(formatPlural(arabic, 0)).toBe("لا شيء")
    expect(formatPlural(arabic, 2)).toBe("اثنان")
  })

  it("keeps the other form of a language whose whole numbers never reach it", () => {
    const russian = split(
      "ru",
      "{count, plural, one {# объект} few {# объекта} many {# объектов} other {# объекта}}"
    )
    expect(russian.forms).toEqual({
      one: "# объект",
      few: "# объекта",
      many: "# объектов",
      other: "# объекта",
    })
    expect(formatPlural(russian, 21)).toBe("21 объект")
    expect(formatPlural(russian, 1200)).toBe("1\u00a0200 объектов")
  })

  it("refuses a form that prints its count twice", () => {
    expect(() =>
      split("en", "{count, plural, one {# of #} other {# of #}}")
    ).toThrow(/Cannot split/)
  })
})
