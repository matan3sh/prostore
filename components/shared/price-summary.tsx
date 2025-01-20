import { formatCurrency } from '@/lib/utils'

const PLACE_ORDER_CATEGORIES = [
  { label: 'Items', key: 'itemsPrice' },
  { label: 'Tax', key: 'taxPrice' },
  { label: 'Shipping', key: 'shippingPrice' },
  { label: 'Total', key: 'totalPrice' },
] as const

type CartKey = (typeof PLACE_ORDER_CATEGORIES)[number]['key']

interface Props {
  cartPrices: Record<CartKey, string>
}

const PriceSummary = ({ cartPrices }: Props) => {
  return (
    <>
      {PLACE_ORDER_CATEGORIES.map(({ label, key }) => (
        <div key={key} className="flex justify-between">
          <div>{label}</div>
          <div>{formatCurrency(cartPrices[key])}</div>
        </div>
      ))}
    </>
  )
}

export default PriceSummary
