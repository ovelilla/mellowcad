import { CadEditor } from "@mellowcad/editor"

import { HostTopBar } from "./host-top-bar"

// A server component may hand the editor a client component (`HostTopBar`
// comes from a "use client" module) or `null`, never a function of its own:
// the top bar is the host's, and the palette panel is gone with its zone.
export default function Page() {
  return <CadEditor components={{ TopBar: HostTopBar, PalettePanel: null }} />
}
