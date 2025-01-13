'use client'

import { Button } from '@/components/ui/button'
import { ToastAction } from '@/components/ui/toast'
import { useToast } from '@/hooks/use-toast'
import { addItemToCart } from '@/lib/actions/cart.actions'
import { CartItem } from '@/types'
import { useRouter } from 'next/navigation'

interface Props {
  item: CartItem
}

const AddToCart = ({ item }: Props) => {
  const router = useRouter()
  const { toast } = useToast()

  const handleAddToCart = async () => {
    const res = await addItemToCart(item)

    if (!res.success) {
      toast({
        variant: 'destructive',
        description: res.message,
      })
      return
    }

    toast({
      description: `${item.name} added to cart`,
      action: (
        <ToastAction
          className="bg-primary text-white hover:bg-gray-800"
          altText="Go to cart"
          onClick={() => router.push('/cart')}
        >
          Go to cart
        </ToastAction>
      ),
    })
  }

  return (
    <Button className="w-full" type="button" onClick={handleAddToCart}>
      Add To Cart
    </Button>
  )
}

export default AddToCart
