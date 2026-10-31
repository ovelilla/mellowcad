import { describe, expect, it } from "vitest"

import {
  CATALOG_DIRS,
  type Leaf,
  freshness,
  nextRecord,
  readLeaves,
  readRecord,
  recordFile,
  recordTags,
  translationTags,
} from "../scripts/locales/sources"

// A translation keeps the English it was made from (scripts/locales/sources.ts):
// once English moves on, the translation is stale until someone reads it again.
describe.each(CATALOG_DIRS)("the translations in %s", (dir) => {
  const english = readLeaves(dir, "en")
  const tags = translationTags(dir)

  it("record the English of every translated key, and nothing else", () => {
    expect(recordTags(dir).sort(), "run npm run locales").toEqual(tags.sort())
    for (const tag of tags) {
      const { unrecorded, orphaned } = freshness(
        english,
        readLeaves(dir, tag),
        readRecord(dir, tag)
      )
      expect(
        { unrecorded, orphaned },
        `${recordFile(dir, tag)}: run npm run locales`
      ).toEqual({ unrecorded: [], orphaned: [] })
    }
  })

  it("are no older than their English", () => {
    const show = (leaf: Leaf) => JSON.stringify(leaf)
    const stale = tags.flatMap((tag) =>
      freshness(english, readLeaves(dir, tag), readRecord(dir, tag)).stale.map(
        ({ key, was, now }) => ({ id: `${tag}:${key}`, was, now })
      )
    )
    const review = `review each translation, then npm run locales -- --reviewed ${stale.map(({ id }) => `'${id}'`).join(" ")}`
    expect(
      stale.map(({ id, was, now }) => `${id}: ${show(was)} → ${show(now)}`),
      review
    ).toEqual([])
  })
})

describe("npm run locales", () => {
  const english = new Map([
    ["a", "New A"],
    ["b", "B"],
  ])
  const translation = new Map([
    ["a", "A traducida"],
    ["b", "B traducida"],
    ["gone", "Ya no está en inglés"],
  ])

  it("keeps a stale key's English until the key is named as reviewed", () => {
    const record = { a: "Old A", gone: "Gone" }
    expect(nextRecord(english, translation, record, () => false)).toEqual({
      a: "Old A",
      b: "B",
    })
    expect(
      nextRecord(english, translation, record, (key) => key === "a")
    ).toEqual({ a: "New A", b: "B" })
  })
})
