const useCurrency = () => {
  const formatCents = (cents: number, currency: string): string =>
    new Intl.NumberFormat(`en-US`, { style: `currency`, currency }).format(cents / 100)

  return { formatCents }
}

export default useCurrency
