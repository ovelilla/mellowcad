import type { ClassValue } from "cn"
import { createCn } from "cn/config"

// The type scale's roles (globals.css) are font sizes: unknown, cn would take
// `text-ui` for a colour and drop it beside `text-muted-foreground`.
const merge = createCn({
  extend: {
    theme: {
      text: ["ui", "title"],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return merge(...inputs)
}
