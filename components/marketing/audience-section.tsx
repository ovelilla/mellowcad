import { BookOpen, PencilRuler, School, Wrench } from "lucide-react"
import { getTranslations } from "next-intl/server"

import { SectionHeading } from "./section-heading"

const AUDIENCES = [
  { key: "students", icon: BookOpen },
  { key: "drafters", icon: PencilRuler },
  { key: "teachers", icon: School },
  { key: "makers", icon: Wrench },
] as const

/**
 * Who MellowCAD serves today, students first — practice needs neither DWG nor
 * a plotter — and, as plainly, who it does not serve yet.
 */
export async function AudienceSection() {
  const t = await getTranslations("Audience")

  return (
    <section
      aria-labelledby="audience-title"
      id="audience"
      className="defer mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-4 py-10 sm:px-6"
    >
      <SectionHeading
        id="audience-title"
        label={t("label")}
        title={t("title")}
      />
      <ul className="grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
        {AUDIENCES.map(({ key, icon: Icon }) => (
          <li key={key} className="flex flex-col gap-2">
            <Icon className="size-5 text-fg-subtle" aria-hidden="true" />
            <h3 className="text-lg font-semibold">{t(`${key}Title`)}</h3>
            <p className="text-fg-muted">{t(`${key}Body`)}</p>
          </li>
        ))}
      </ul>
      <p className="measure text-sm text-fg-subtle">{t("notFor")}</p>
    </section>
  )
}
