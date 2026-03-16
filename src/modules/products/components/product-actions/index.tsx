"use client"

import { addToCart } from "@lib/data/cart"
import { useIntersection } from "@lib/hooks/use-in-view"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import Divider from "@modules/common/components/divider"
import OptionSelect from "@modules/products/components/product-actions/option-select"
import { isEqual } from "lodash"
import { useParams, usePathname, useSearchParams, useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import ProductPrice from "../product-price"
import MobileActions from "./mobile-actions"

// --- Facebook Pixel 工具函数 ---
const fbEvent = (eventName: string, options = {}) => {
  if (typeof window !== "undefined" && (window as any).fbq) {
    (window as any).fbq("track", eventName, options)
  }
}

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
}

const optionsAsKeymap = (
    variantOptions: HttpTypes.StoreProductVariant["options"]
) => {
  return variantOptions?.reduce((acc: Record<string, string>, varopt: any) => {
    acc[varopt.option_id] = varopt.value
    return acc
  }, {})
}

export default function ProductActions({
                                         product,
                                         region,
                                         disabled,
                                       }: ProductActionsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [options, setOptions] = useState<Record<string, string | undefined>>({})
  const [isAdding, setIsAdding] = useState(false)
  const [isBuying, setIsBuying] = useState(false)
  const countryCode = useParams().countryCode as string

  // 【默认选中逻辑 - 加锁版】
  useEffect(() => {
    if (product.variants && product.variants.length > 0 && Object.keys(options).length === 0) {
      const firstAvailableVariant = product.variants.find((v) => {
        const managed = v.manage_inventory
        const quantity = v.inventory_quantity ?? 0
        return !managed || v.allow_backorder || quantity > 0
      }) || product.variants[0]

      const variantOptions = optionsAsKeymap(firstAvailableVariant.options)
      if (variantOptions) {
        setOptions(variantOptions)
      }
    }
  }, [product.variants])

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return
    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  const setOptionValue = (optionId: string, value: string) => {
    setOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }))
  }

  const isValidVariant = useMemo(() => {
    return product.variants?.some((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  // URL 同步逻辑
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    const value = isValidVariant ? selectedVariant?.id : null
    if (params.get("v_id") === value) return
    if (value) {
      params.set("v_id", value)
    } else {
      params.delete("v_id")
    }
    router.replace(pathname + "?" + params.toString(), { scroll: false })
  }, [selectedVariant, isValidVariant])

  const inStock = useMemo(() => {
    if (selectedVariant && !selectedVariant.manage_inventory) return true
    if (selectedVariant?.allow_backorder) return true
    if (selectedVariant?.manage_inventory && (selectedVariant?.inventory_quantity || 0) > 0) return true
    return false
  }, [selectedVariant])

  const actionsRef = useRef<HTMLDivElement>(null)
  const inView = useIntersection(actionsRef, "0px")

  // --- 核心修改：加入购物车埋点 ---
  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return
    setIsAdding(true)
    try {
      await addToCart({ variantId: selectedVariant.id, quantity: 1, countryCode })

      // Facebook Pixel: AddToCart
      fbEvent("AddToCart", {
        content_ids: [product.id],
        content_name: product.title,
        content_type: "product",
        value: (selectedVariant.calculated_price?.calculated_amount || 0),
        currency: region?.currency_code?.toUpperCase() || "USD",
      })
    } catch (e) {
      console.error(e)
    } finally {
      setIsAdding(false)
    }
  }

  // --- 核心修改：立即购买埋点 ---
  const handleBuyNow = async () => {
    if (!selectedVariant?.id) return
    setIsBuying(true)
    try {
      await addToCart({ variantId: selectedVariant.id, quantity: 1, countryCode })

      // Facebook Pixel: AddToCart (立即购买也算加入购物车)
      fbEvent("AddToCart", {
        content_ids: [product.id],
        content_name: product.title,
        content_type: "product",
        value: (selectedVariant.calculated_price?.calculated_amount || 0),
        currency: region?.currency_code?.toUpperCase() || "USD",
      })

      router.push(`/${countryCode}/checkout`)
    } catch (e) {
      console.error(e)
    } finally {
      setIsBuying(false)
    }
  }

  return (
      <>
        <div className="flex flex-col gap-y-4" ref={actionsRef}>
          <div>
            {(product.variants?.length ?? 0) > 1 && (
                <div className="flex flex-col gap-y-6">
                  {(product.options || []).map((option) => (
                      <div key={option.id}>
                        <OptionSelect
                            option={option}
                            current={options[option.id]}
                            updateOption={setOptionValue}
                            title={option.title ?? ""}
                            disabled={!!disabled || isAdding || isBuying}
                        />
                      </div>
                  ))}
                  <Divider />
                </div>
            )}
          </div>

          <ProductPrice product={product} variant={selectedVariant} />

          <div className="flex flex-col gap-y-3 mt-4">
            <Button
                onClick={handleAddToCart}
                disabled={!inStock || !selectedVariant || !!disabled || isAdding || isBuying}
                variant="secondary"
                className="w-full min-h-[3rem] uppercase tracking-widest text-xs font-bold"
                isLoading={isAdding}
            >
              {!selectedVariant ? "Select variant" : !inStock ? "Out of stock" : "Add to cart"}
            </Button>

            <Button
                onClick={handleBuyNow}
                disabled={!inStock || !selectedVariant || !!disabled || isAdding || isBuying}
                variant="primary"
                className="w-full min-h-[3rem] uppercase tracking-widest text-xs font-bold"
                isLoading={isBuying}
            >
              Check out
            </Button>
          </div>

          <MobileActions
              product={product}
              variant={selectedVariant}
              options={options}
              updateOptions={setOptionValue}
              inStock={inStock}
              handleAddToCart={handleAddToCart}
              handleBuyNow={handleBuyNow}
              isAdding={isAdding}
              isBuying={isBuying}
              show={!inView}
              optionsDisabled={!!disabled || isAdding || isBuying}
          />
        </div>
      </>
  )
}