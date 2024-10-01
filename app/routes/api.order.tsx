import { db } from "@/db/index.server";
import { orders, users, Users } from "@/db/schema";
import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { eq } from "drizzle-orm";

function formatOrderData(data: any) {
  const orderMessages = data.orders.map((order: any) => {
    const orderNumber = order.id.split("-")[0].slice(0, 5); // Using the first 5 characters of the ID as order number
    const statusMessage =
      order.status === "shipped"
        ? `Your order ${orderNumber} is Shipped`
        : `Your order ${orderNumber} is still processing`;
    const hindiMessage =
      order.status === "shipped"
        ? `आपका ऑर्डर ${orderNumber} भेज दिया गया है`
        : `आपका ऑर्डर ${orderNumber} अभी भी प्रक्रिया में है`;

    return { english: statusMessage, hindi: hindiMessage };
  });

  const englishMessage = orderMessages
    .map((msg: any) => msg.english)
    .join(", ");
  const hindiMessage =
    orderMessages.map((msg: any) => msg.hindi).join(", ") + "। धन्यवाद!";

  return {
    english: englishMessage + ". Thank you!",
    hindi: hindiMessage + " धन्यवाद!",
  };
}

export async function loader({ request }: LoaderFunctionArgs) {
  const allOrders = await db.select().from(orders);
  //   console.log(allOrders, "data");
  const data = formatOrderData({ orders: allOrders });
  return { data: data };
}
