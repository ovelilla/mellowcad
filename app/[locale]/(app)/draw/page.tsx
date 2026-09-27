import { getLocale } from "next-intl/server"

import { CadWorkspace } from "@/components/cad/cad-workspace"
import { loadEngineLocale } from "@/i18n/engine"

// The engine's catalog travels in the page, so the engine starts in the
// page's language without waiting for another request.
export default async function Page() {
  return (
    <CadWorkspace engineLocale={await loadEngineLocale(await getLocale())} />
  )
}
