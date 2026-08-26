import { createCheckout } from "@/lib/payments/payment"

export async function POST(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ invoiceId: string }>
  }
) {
  try {
    const { invoiceId } = await params

    const body = await request.json()

    const checkout = await createCheckout(
      invoiceId,
      body.businessCountry,
      body.customerCountry
    )

    return Response.json(checkout)
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create checkout",
      },
      {
        status: 400,
      }
    )
  }
}