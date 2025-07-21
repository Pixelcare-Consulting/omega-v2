type FormatCurrency = {
  amount: number
  currency?: string
  isAutoNotation?: boolean
  minDecimal?: number
  maxDecimal?: number
}

export function formatCurrency({ amount, currency = "USD", isAutoNotation = false, minDecimal = 0, maxDecimal = 2 }: FormatCurrency) {
  const currencyFormatter = new Intl.NumberFormat("en-US", {
    currency,
    style: "currency",
    minimumFractionDigits: minDecimal,
    maximumFractionDigits: maxDecimal,
    notation: isAutoNotation ? (amount > 999_999 ? "compact" : "standard") : "standard",
  })

  return currencyFormatter.format(amount)
}

type FormatNumber = {
  amount: number
  isAutoNotation?: boolean
  minDecimal?: number
  maxDecimal?: number
}

export function formatNumber({ amount, isAutoNotation = false, minDecimal = 0, maxDecimal = 2 }: FormatNumber) {
  const numberFormatter = new Intl.NumberFormat("en-US", {
    notation: isAutoNotation ? (amount > 999_999 ? "compact" : "standard") : "standard",
  })

  return numberFormatter.format(amount)
}
