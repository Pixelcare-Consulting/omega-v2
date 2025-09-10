const originalWarn = console.warn
console.warn = (...args) => {
  if (typeof args[0] === "string" && args[0].includes("Only plain objects can be passed to Client Components")) {
    return // ignore this warning
  }
  originalWarn(...args)
}
