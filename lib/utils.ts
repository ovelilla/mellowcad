import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// WHY: in Tailwind 4 `px-*` is `padding-inline`, `mx-*` `margin-inline` and
// `inset-x-*` `inset-inline`, so each overrides its logical sides too — but
// tailwind-merge 3.6 only pairs them with the physical ones. Without this, a
// caller's `px-1.5` no longer replaced a component's `ps-2.5 pe-2` once the
// components went logical for RTL, and the padding silently changed.
const twMerge = extendTailwindMerge({
  extend: {
    conflictingClassGroups: {
      px: ["ps", "pe"],
      mx: ["ms", "me"],
      "inset-x": ["start", "end"],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
