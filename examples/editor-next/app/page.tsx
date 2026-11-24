import { CadEditor } from "@mellowcad/editor"

import { HostTitleBar } from "./host-title-bar"

// A server component may hand the editor a client component (`HostTitleBar`
// comes from a "use client" module) or `null`, never a function of its own:
// the title bar is the host's, and the palette panel is gone with its zone.
export default function Page() {
  return (
    <CadEditor components={{ TitleBar: HostTitleBar, PalettePanel: null }} />
  )
}
