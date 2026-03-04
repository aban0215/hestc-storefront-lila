"use client"

import { setAddresses } from "@lib/data/cart"
import compareAddresses from "@lib/util/compare-addresses"
import { CheckCircleSolid } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { Heading, Text, useToggleState } from "@medusajs/ui"
import Divider from "@modules/common/components/divider"
import Spinner from "@modules/common/icons/spinner"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useActionState, useEffect, useState } from "react" // 引入 useState
import BillingAddress from "../billing_address"
import ErrorMessage from "../error-message"
import ShippingAddress from "../shipping-address"
import { SubmitButton } from "../submit-button"

const Addresses = ({
                       cart,
                       customer,
                   }: {
    cart: HttpTypes.StoreCart | null
    customer: HttpTypes.StoreCustomer | null
}) => {
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()

    // 【核心改动 1】：改用内部 State 控制，初始值逻辑增强
    // 如果 URL 里明确说是 address，或者购物车里根本没地址，初始化就设为 true
    const [isForcedOpen, setIsForcedOpen] = useState(false)

    // 【核心改动 2】：在组件挂载和 cart 更新时强制校准状态
    useEffect(() => {
        const isStepAddress = searchParams.get("step") === "address"
        const hasNoAddress = !cart?.shipping_address?.address_1

        if (isStepAddress || hasNoAddress) {
            setIsForcedOpen(true)
        } else {
            setIsForcedOpen(false)
        }
    }, [cart?.shipping_address, searchParams])

    // 最终的判断依据
    const isOpen = isForcedOpen

    const { state: sameAsBilling, toggle: toggleSameAsBilling } = useToggleState(
        cart?.shipping_address && cart?.billing_address
            ? compareAddresses(cart?.shipping_address, cart?.billing_address)
            : true
    )

    const handleEdit = () => {
        router.push(pathname + "?step=address")
        setIsForcedOpen(true) // 显式开启
    }

    const [message, formAction] = useActionState(setAddresses, null)

    return (
        <div className="bg-white">
            <div className="flex flex-row items-center justify-between mb-6">
                <Heading
                    level="h2"
                    className="flex flex-row text-3xl-regular gap-x-2 items-baseline"
                >
                    Shipping Address
                    {!isOpen && cart?.shipping_address && <CheckCircleSolid />}
                </Heading>
                {!isOpen && cart?.shipping_address && (
                    <Text>
                        <button
                            onClick={handleEdit}
                            className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
                            data-testid="edit-address-button"
                        >
                            Edit
                        </button>
                    </Text>
                )}
            </div>
            {isOpen ? (
                <form action={formAction}>
                    <div className="pb-8">
                        <ShippingAddress
                            customer={customer}
                            checked={sameAsBilling}
                            onChange={toggleSameAsBilling}
                            cart={cart}
                        />

                        {!sameAsBilling && (
                            <div>
                                <Heading
                                    level="h2"
                                    className="text-3xl-regular gap-x-4 pb-6 pt-8"
                                >
                                    Billing address
                                </Heading>

                                <BillingAddress cart={cart} />
                            </div>
                        )}
                        <SubmitButton className="mt-6" data-testid="submit-address-button">
                            Continue to delivery
                        </SubmitButton>
                        <ErrorMessage error={message} data-testid="address-error-message" />
                    </div>
                </form>
            ) : (
                <div>
                    <div className="text-small-regular">
                        {cart && cart.shipping_address ? (
                            <div className="flex items-start gap-x-8">
                                <div className="flex items-start gap-x-1 w-full">
                                    <div
                                        className="flex flex-col w-1/3"
                                        data-testid="shipping-address-summary"
                                    >
                                        <Text className="txt-medium-plus text-ui-fg-base mb-1">
                                            Shipping Address
                                        </Text>
                                        <Text className="txt-medium text-ui-fg-subtle">
                                            {cart.shipping_address.first_name}{" "}
                                            {cart.shipping_address.last_name}
                                        </Text>
                                        <Text className="txt-medium text-ui-fg-subtle">
                                            {cart.shipping_address.address_1}{" "}
                                            {cart.shipping_address.address_2}
                                        </Text>
                                        <Text className="txt-medium text-ui-fg-subtle">
                                            {cart.shipping_address.postal_code},{" "}
                                            {cart.shipping_address.city}
                                        </Text>
                                        <Text className="txt-medium text-ui-fg-subtle">
                                            {cart.shipping_address.country_code?.toUpperCase()}
                                        </Text>
                                    </div>

                                    <div
                                        className="flex flex-col w-1/3 "
                                        data-testid="shipping-contact-summary"
                                    >
                                        <Text className="txt-medium-plus text-ui-fg-base mb-1">
                                            Contact
                                        </Text>
                                        <Text className="txt-medium text-ui-fg-subtle">
                                            {cart.shipping_address.phone}
                                        </Text>
                                        <Text className="txt-medium text-ui-fg-subtle">
                                            {cart.email}
                                        </Text>
                                    </div>

                                    <div
                                        className="flex flex-col w-1/3"
                                        data-testid="billing-address-summary"
                                    >
                                        <Text className="txt-medium-plus text-ui-fg-base mb-1">
                                            Billing Address
                                        </Text>

                                        {sameAsBilling ? (
                                            <Text className="txt-medium text-ui-fg-subtle">
                                                Billing and delivery address are the same.
                                            </Text>
                                        ) : (
                                            <>
                                                <Text className="txt-medium text-ui-fg-subtle">
                                                    {cart.billing_address?.first_name}{" "}
                                                    {cart.billing_address?.last_name}
                                                </Text>
                                                <Text className="txt-medium text-ui-fg-subtle">
                                                    {cart.billing_address?.address_1}{" "}
                                                    {cart.billing_address?.address_2}
                                                </Text>
                                                <Text className="txt-medium text-ui-fg-subtle">
                                                    {cart.billing_address?.postal_code},{" "}
                                                    {cart.billing_address?.city}
                                                </Text>
                                                <Text className="txt-medium text-ui-fg-subtle">
                                                    {cart.billing_address?.country_code?.toUpperCase()}
                                                </Text>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center py-10">
                                <Spinner />
                            </div>
                        )}
                    </div>
                </div>
            )}
            <Divider className="mt-8" />
        </div>
    )
}

export default Addresses