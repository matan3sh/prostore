'use client'

import { cn } from '@/lib/utils'
import Image from 'next/image'
import { useState } from 'react'

interface Props {
  images: string[]
}

const ProductImages = ({ images }: Props) => {
  const [current, setCurrent] = useState(0)

  return (
    <div className="space-y-4">
      <Image
        src={images[current]}
        alt="product image"
        width={1000}
        height={1000}
        className="min-h-[300px] object-cover object-center"
      />

      <div className="flex">
        {images.map((image, index) => (
          <div
            key={image}
            onClick={() => setCurrent(index)}
            className={cn(
              'border mr-2 cuesor-pointer hover:border-orange-600',
              index === current && 'border-orange-500'
            )}
          >
            <Image
              src={image}
              alt="product image"
              width={100}
              height={100}
              className="object-cover object-center cursor-pointer"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProductImages
