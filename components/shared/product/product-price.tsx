import { cn } from '@/lib/utils'

interface Props {
  value: number
  className?: string
}

const ProductPrice = ({ value, className }: Props) => {
  // Ensure two decimal places
  const stringValue = value.toFixed(2)

  // Get the int/float parts
  const [int, float] = stringValue.split('.')

  return (
    <p className={cn('text-2xl', className)}>
      <span className="text-xs align-super">$</span>
      {int}
      <span className="text-xs align-super">.{float}</span>
    </p>
  )
}

export default ProductPrice
