"use client"

import { createContext, useContext } from "react"

// Where the editor's popups mount: a node inside its root, so its tokens,
// `dir` and `lang` reach them without the host's <body>. Base UI has no
// default container, so every Portal passes this one (ESLint). Outside an
// editor it is `undefined`, Base UI's own default (the body); `null` makes a
// portal wait until the node exists.
const PortalContainerContext = createContext<HTMLElement | null | undefined>(
  undefined
)

export function PortalContainerProvider({
  container,
  children,
}: {
  container: HTMLElement | null
  children: React.ReactNode
}) {
  return (
    <PortalContainerContext value={container}>
      {children}
    </PortalContainerContext>
  )
}

export function usePortalContainer(): HTMLElement | null | undefined {
  return useContext(PortalContainerContext)
}
