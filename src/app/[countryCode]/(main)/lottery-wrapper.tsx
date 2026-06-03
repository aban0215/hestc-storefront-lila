import { retrieveCustomer } from "@lib/data/customer"
import LotteryModal from "@modules/home/components/lottery-modal"

export default async function LotteryModalWrapper() {
  const customer = await retrieveCustomer()
  return (
    <LotteryModal
      isLoggedIn={!!customer}
      customerEmail={customer?.email}
    />
  )
}
