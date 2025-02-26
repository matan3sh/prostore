'use client'

import { Form } from '@/components/ui/form'
import { productDefaultValues } from '@/lib/constants'
import { insertProductSchema, updateProductSchema } from '@/lib/validators'
import { Product } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

interface ProductFormProps {
  type: 'Create' | 'Update'
  product?: Product
  productId?: string
}

const ProductForm = ({ type, product }: ProductFormProps) => {
  // const router = useRouter()
  // const toast = useToast()

  const form = useForm<z.infer<typeof insertProductSchema>>({
    resolver:
      type === 'Create'
        ? zodResolver(insertProductSchema)
        : zodResolver(updateProductSchema),
    defaultValues:
      product && type === 'Update' ? product : productDefaultValues,
  })

  return (
    <Form {...form}>
      <form className="space-y-8">
        <div className="flex flex-col md:flex-row gap-5">
          {/* Name */}
          {/* Slug */}
        </div>
        <div className="flex flex-col md:flex-row gap-5">
          {/* Category */}
          {/* Brand */}
        </div>
        <div className="flex flex-col md:flex-row gap-5">
          {/* Price */}
          {/* Stock */}
        </div>
        <div className="upload-field flex flex-col md:flex-row gap-5">
          {/* Images */}
        </div>
        <div className="upload-field">{/* isFeatured */}</div>
        <div>{/* Description */}</div>
        <div>{/* Submit Button */}</div>
      </form>
    </Form>
  )
}

export default ProductForm
