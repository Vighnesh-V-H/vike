import { auth } from "@/auth";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { PLANS } from "./stripe";

export async function getUserSubscriptionPlan() {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      ...PLANS.FREE,
      isSubscribed: false,
      isCanceled: false,
      isActive: true,
    };
  }

  const [userSubscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, session.user.id))
    .orderBy(desc(subscriptions.createdAt))
    .limit(1);

  if (!userSubscription) {
    return {
      ...PLANS.FREE,
      isSubscribed: false,
      isCanceled: false,
      isActive: true,
    };
  }

  const isActive = userSubscription.status === "active";
  const isCanceled = userSubscription.cancelAtPeriodEnd;

  let plan = PLANS.FREE;
  if (isActive && !isCanceled) {
    if (userSubscription.planId === PLANS.PRO.stripePriceId) {
      plan = PLANS.PRO;
    } else if (userSubscription.planId === PLANS.ENTERPRISE.stripePriceId) {
      plan = PLANS.ENTERPRISE;
    }
  }

  return {
    ...plan,
    isSubscribed: isActive,
    isCanceled,
    isActive: isActive && !isCanceled,
  };
}
