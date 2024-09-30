import React from "react";
import { useLoaderData, useFetcher } from "@remix-run/react";
import {
  LoaderFunctionArgs,
  json,
  redirect,
  ActionFunctionArgs,
} from "@remix-run/node";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { getUser } from "@/utils/session.server";
import { db } from "@/db/index.server";
import { orders, orderItems, Users, products } from "@/db/schema";
import { eq, desc, inArray } from "drizzle-orm";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = (await getUser(request)) as Users;

  // First, get all products of this farmer
  const farmerProducts = await db.query.products.findMany({
    where: eq(products.farmerId, user.id),
    columns: { id: true },
  });

  const farmerProductIds = farmerProducts.map((product) => product.id);

  // Then, get all order items containing these products
  const relevantOrderItems = await db.query.orderItems.findMany({
    where: inArray(orderItems.productId, farmerProductIds),
    columns: { orderId: true },
  });

  const relevantOrderIds = [
    ...new Set(relevantOrderItems.map((item) => item.orderId)),
  ];

  // Finally, get the full order details
  const farmerOrders = await db.query.orders.findMany({
    where: inArray(orders.id, relevantOrderIds),
    orderBy: [desc(orders.createdAt)],
    with: {
      orderItems: {
        with: {
          product: true,
        },
      },
      consumer: true,
    },
  });

  return json({ user, orders: farmerOrders });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const orderId = formData.get("orderId") as string;
  const newStatus = formData.get("status") as string;

  await db
    .update(orders)
    .set({ status: newStatus })
    .where(eq(orders.id, orderId));

  return json({ success: true });
}

export default function FarmerOrdersPage() {
  const { user, orders } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  const handleStatusChange = (orderId: string, newStatus: string) => {
    fetcher.submit(
      { orderId, status: newStatus },
      { method: "post", action: "/dashboard/orders" }
    );
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-6">Manage Orders</h1>
      {orders.length === 0 ? (
        <p>You don't have any orders yet.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Order #{order.id.slice(0, 8)}</span>
                  <Select
                    onValueChange={(value) =>
                      handleStatusChange(order.id, value)
                    }
                    defaultValue={order.status}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-2">Total: ₹{order.totalAmount.toFixed(2)}</p>
                <p className="mb-2">
                  Date: {new Date(order.createdAt).toLocaleDateString()}
                </p>
                <p className="mb-2">
                  Customer: {order.consumer.name} ({order.consumer.email})
                </p>
                <h3 className="font-semibold mt-4 mb-2">Items:</h3>
                <ul className="list-disc list-inside">
                  {order.orderItems
                    .filter((item) => item.product.farmerId === user.id)
                    .map((item) => (
                      <li key={item.id}>
                        {item.product.name} - Quantity: {item.quantity}, Price:
                        ₹{item.price.toFixed(2)}
                      </li>
                    ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
