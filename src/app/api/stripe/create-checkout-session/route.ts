import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const billingUrl = absoluteUrl("/settings/billing");

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    let stripeCustomerId = user.stripeCustomerId;

    if (!stripeCustomerId) {
      // Create a new Stripe customer if they don't have one
      const customer = await stripe.customers.create({
        email: user.email!,
        name: user.name || undefined,
      });
      stripeCustomerId = customer.id;
      await db
        .update(users)
        .set({ stripeCustomerId })
        .where(eq(users.id, user.id));
    }

    const { priceId } = await req.json();
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      billing_address_collection: "required",
      payment_method_types: ["card"],
      allow_promotion_codes: true,
      subscription_data: {
        trial_period_days: undefined,
        metadata: {
          userId: user.id,
        },
        billing_cycle_anchor: undefined, // This ensures billing starts immediately
      },
      success_url: `${billingUrl}?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${billingUrl}?canceled=true`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error("Error in create-checkout-session:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
