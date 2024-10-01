import React from "react";
import { useLoaderData, useActionData, Form } from "@remix-run/react";
import {
  LoaderFunctionArgs,
  ActionFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import { db } from "@/db/index.server";
import { products, Users, bids, users } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { getUser } from "@/utils/session.server";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const user = (await getUser(request)) as Users;
  if (!user || !user.isFarmer) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const productId = params.productId;
  if (!productId) {
    throw new Response("Product ID is required", { status: 400 });
  }

  const product = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  if (!product || product.length === 0) {
    throw new Response("Product not found", { status: 404 });
  }

  const activeBids = await db
    .select({
      id: bids.id,
      amount: bids.amount,
      status: bids.status,
      createdAt: bids.createdAt,
      bidderName: users.fullName,
    })
    .from(bids)
    .innerJoin(users, eq(bids.bidderId, users.id))
    .where(and(eq(bids.productId, productId), eq(bids.status, "active")))
    .orderBy(desc(bids.createdAt));

  console.log(activeBids, "activeBids");

  return json({ user, product: product[0], activeBids });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const user = (await getUser(request)) as Users;
  if (!user || !user.isFarmer) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const formData = await request.formData();
  const action = formData.get("action");
  const bidId = formData.get("bidId") as string;
  const productId = params.productId;

  console.log(action, "action");

  if (!bidId) {
    return json({ error: "Bid ID is required" }, { status: 400 });
  }

  if (action === "accept") {
    await db.update(bids).set({ status: "accepted" }).where(eq(bids.id, bidId));
  } else if (action === "reject") {
    await db.update(bids).set({ status: "rejected" }).where(eq(bids.id, bidId));
  } else if (action === "select-winner") {
    // Update the winning bid
    await db.update(bids).set({ status: "won" }).where(eq(bids.id, bidId));

    // Update all other bids for this product to "inactive"
    await db
      .update(bids)
      .set({ status: "inactive" })
      .where(
        and(eq(bids.productId, productId as string), eq(bids.status, "active"))
      );

    // Update the product to stop bidding
    await db
      .update(products)
      .set({ isBidding: false })
      .where(eq(products.id, productId as string));
  } else {
    return json({ error: "Invalid action" }, { status: 400 });
  }

  return redirect(`/dashboard/inventory/${params.productId}/bids`);
}

const ProductBiddingPage = () => {
  const { product, activeBids } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-4">Bids for {product.name}</h1>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            <strong>Name:</strong> {product.name}
          </p>
          <p>
            <strong>Price:</strong> ₹{product.price.toFixed(2)}
          </p>
          <p>
            <strong>Quantity:</strong> {product.quantity} {product.unit}
          </p>
          <p>
            <strong>Bidding Status:</strong>{" "}
            {product.isBidding ? "Open" : "Closed"}
          </p>
        </CardContent>
      </Card>

      <h2 className="text-xl font-semibold mb-4">Active Bids</h2>
      {activeBids.length > 0 ? (
        activeBids.map((bid) => (
          <Card key={bid.id} className="mb-4">
            <CardContent className="flex justify-between items-center p-3">
              <div>
                <p>
                  <strong>Bidder:</strong> {bid.bidderName}
                </p>
                <p>
                  <strong>Amount:</strong> ₹{bid.amount.toFixed(2)}
                </p>
                <p>
                  <strong>Status:</strong> {bid.status}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(bid.createdAt as any).toLocaleString()}
                </p>
              </div>
              {bid.status === "active" && product.isBidding && (
                <Form method="post">
                  <input type="hidden" name="bidId" value={bid.id} />
                  <div className="space-x-2">
                    <Button
                      type="submit"
                      name="action"
                      value="accept"
                      variant="outline"
                    >
                      Accept
                    </Button>
                    <Button
                      type="submit"
                      name="action"
                      value="reject"
                      variant="outline"
                    >
                      Reject
                    </Button>
                    <Button
                      type="submit"
                      name="action"
                      value="select-winner"
                      variant="outline"
                    >
                      Select Winner
                    </Button>
                  </div>
                </Form>
              )}
            </CardContent>
          </Card>
        ))
      ) : (
        <p>No active bids for this product.</p>
      )}

      {actionData?.error && (
        <p className="text-red-500 mt-4">{actionData.error}</p>
      )}
    </div>
  );
};

export default ProductBiddingPage;
