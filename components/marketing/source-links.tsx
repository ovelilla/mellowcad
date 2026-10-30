import { ENGINE_PACKAGE, ENGINE_PACKAGE_URL, REPOSITORY_URL } from "@/lib/site"

/** The rich tags of a message that links the repository and the engine's npm page. */
export const sourceLinks = {
  package: ENGINE_PACKAGE,
  github: (chunks: React.ReactNode) => (
    <a href={REPOSITORY_URL} className="underline-link">
      {chunks}
    </a>
  ),
  npm: (chunks: React.ReactNode) => (
    <a href={ENGINE_PACKAGE_URL} className="underline-link">
      {chunks}
    </a>
  ),
}
