/**
 * The value of an arithmetic expression, as EXTRUDE's and REVOLVE's
 * Expression take one (`2*3` makes a height of 6, extrude/x02): numbers,
 * `+ - * / ^`, a sign and parentheses. Null for what is none — AutoCAD's
 * `The syntax is incorrect or a variable is not defined.` WHY no names:
 * AutoCAD reads its parameters' (PARAMETERS) and functions' names too, and
 * this engine has no parameters.
 */
export function evaluateExpression(text: string): number | null {
  const tokens = text.match(
    /\d+\.?\d*(?:[eE][+-]?\d+)?|\.\d+(?:[eE][+-]?\d+)?|[-+*/^()]|\S/g
  )
  if (!tokens) return null
  let at = 0
  const peek = () => tokens[at]
  const take = () => tokens[at++]
  // sum := product (("+" | "-") product)*
  const sum = (): number | null => {
    let value = product()
    while (value !== null && (peek() === "+" || peek() === "-")) {
      const op = take()
      const right = product()
      if (right === null) return null
      value = op === "+" ? value + right : value - right
    }
    return value
  }
  // product := power (("*" | "/") power)*
  const product = (): number | null => {
    let value = power()
    while (value !== null && (peek() === "*" || peek() === "/")) {
      const op = take()
      const right = power()
      if (right === null) return null
      value = op === "*" ? value * right : value / right
    }
    return value
  }
  // power := unary ("^" power)?
  const power = (): number | null => {
    const base = unary()
    if (base === null || peek() !== "^") return base
    take()
    const exponent = power()
    return exponent === null ? null : base ** exponent
  }
  const unary = (): number | null => {
    if (peek() === "-" || peek() === "+") {
      const sign = take() === "-" ? -1 : 1
      const value = unary()
      return value === null ? null : sign * value
    }
    const token = take()
    if (token === "(") {
      const value = sum()
      return take() === ")" ? value : null
    }
    const value = token === undefined ? NaN : Number(token)
    return Number.isFinite(value) ? value : null
  }
  const value = sum()
  return value !== null && at === tokens.length && Number.isFinite(value)
    ? value
    : null
}
