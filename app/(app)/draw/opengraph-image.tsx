import messages from "@/messages/en.json"
import { OG_SIZE, ogImage } from "@/lib/og"

export const alt = messages.Metadata.ogAlt
export const size = OG_SIZE
export const contentType = "image/png"

export default function Image() {
  return ogImage({
    eyebrow: messages.Og.tagline,
    title: messages.Og.drawTitle,
  })
}
