import { REPOSITORY_URL } from "./site"

/**
 * What a report link fills in on the issue forms (`.github/ISSUE_TEMPLATE`),
 * each the `id` of an input every form has (`lib/report.test.ts`): GitHub
 * fills a form's field from the query parameter of its `id`.
 */
export const REPORT_FIELDS = ["version", "browser", "language"] as const

export type ReportFields = Partial<
  Record<(typeof REPORT_FIELDS)[number], string>
>

/**
 * The repository's form chooser with the forms' fields filled in, which the
 * reporter reads before sending: nothing passes through a server of ours.
 * The chooser rather than a form, because GitHub carries the fields into the
 * form picked. GitHub shows it only to someone signed in, so the footer gives
 * the contact address beside the link.
 */
export function reportUrl(fields: ReportFields): string {
  const query = new URLSearchParams()
  for (const id of REPORT_FIELDS) {
    const value = fields[id]
    if (value) query.set(id, value)
  }
  const search = query.toString()
  return `${REPOSITORY_URL}/issues/new/choose${search && `?${search}`}`
}
