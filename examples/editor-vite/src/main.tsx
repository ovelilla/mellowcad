import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { CadEditor } from "@mellowcad/editor"
import "@mellowcad/editor/styles.css"
import "./index.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CadEditor />
  </StrictMode>
)
