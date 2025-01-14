'use client'

import { Button } from '@/components/ui/button'
import { ToastAction } from '@/components/ui/toast'
import { useToast } from '@/hooks/use-toast'
import { addItemToCart, removeItemFromCart } from '@/lib/actions/cart.actions'
import { Cart, CartItem } from '@/types'
import { MinusIcon, PlusIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Props {
  item: CartItem
  cart?: Cart
}

const AddToCart = ({ item, cart }: Props) => {
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
      description: res.message,
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

  const handleRemoveFromCart = async () => {
    const res = await removeItemFromCart(item.productId)

    toast({
      variant: res.success ? 'default' : 'destructive',
      description: res.message,
    })
  }

  // Check if item is in cart
  const existItem =
    cart && cart?.items.find((x) => x.productId === item.productId)

  return existItem ? (
    <div>
      <Button type="button" variant={'outline'} onClick={handleRemoveFromCart}>
        <MinusIcon className="h-4 w-4" />
      </Button>
      <span className="px-2">{existItem.quantity}</span>
      <Button type="button" variant={'outline'} onClick={handleAddToCart}>
        <PlusIcon className="h-4 w-4" />
      </Button>
    </div>
  ) : (
    <Button className="w-full" type="button" onClick={handleAddToCart}>
      <PlusIcon /> Add To Cart
    </Button>
  )
}

export default AddToCart
