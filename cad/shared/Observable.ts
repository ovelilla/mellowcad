/**
 * Minimal typed observable used across layers so React (or anything else) can
 * subscribe to state changes without coupling the system to any framework.
 * It is the only piece of shared infrastructure; it has zero dependencies.
 */
export type Listener = () => void

export class Observable {
  private listeners = new Set<Listener>()

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  protected emit(): void {
    for (const listener of this.listeners) listener()
  }
}
