import React, { useState } from "react";
import { Plus, Search, ChevronRight, Edit, DollarSign } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Link, useLoaderData, useFetcher } from "@remix-run/react";
import { LoaderFunctionArgs, ActionFunctionArgs, json } from "@remix-run/node";
import { db } from "@/db/index.server";
import { products, Users, bids } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";
import { getUser } from "@/utils/session.server";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = (await getUser(request)) as Users;
  if (!user || !user.isFarmer) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const allProducts = await db
    .select({
      ...products,
      activeBids: count(bids.id),
    })
    .from(products)
    .leftJoin(
      bids,
      and(eq(products.id, bids.productId), eq(bids.status, "active"))
    )
    .where(eq(products.farmerId, user.id))
    .groupBy(products.id);

  return json({ user, allProducts });
}

export async function action({ request }: ActionFunctionArgs) {
  const user = (await getUser(request)) as Users;
  if (!user || !user.isFarmer) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const formData = await request.formData();
  const productId = formData.get("productId") as string;
  const isBidding = formData.get("isBidding") === "true";

  await db
    .update(products)
    .set({ isBidding })
    .where(eq(products.id, productId));

  return json({ success: true });
}

const InventoryPage = () => {
  const { allProducts } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const handleStartBid = (product: any) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

  const confirmStartBid = () => {
    if (selectedProduct) {
      fetcher.submit(
        { productId: selectedProduct.id, isBidding: "true" },
        { method: "post" }
      );
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div>
        <h1 className="text-2xl font-bold mb-4">My Inventory</h1>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search inventory..."
            className="pl-10 pr-4 py-2 w-full rounded-full bg-gray-100"
          />
        </div>
      </div>

      <div>
        {allProducts && allProducts.length > 0 ? (
          <>
            {allProducts.map((item) => (
              <Card key={item.id} className="mb-4 overflow-hidden">
                <CardContent className="p-0 px-1">
                  <div className="flex items-center">
                    <img
                      src={item.image || "/placeholder-image.jpg"}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-sm"
                    />
                    <div className="flex-grow p-3">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <p className="text-sm text-gray-600">
                        {item.quantity} {item.unit}
                      </p>
                      <p className="font-bold text-green-600">
                        ₹{item.price.toFixed(2)}
                      </p>
                      {item.isBidding && item.activeBids > 0 && (
                        <p className="text-sm text-blue-600">
                          {item.activeBids} active bid(s)
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col space-y-2 mr-4">
                      <Link to={`/dashboard/inventory/${item.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </Link>
                      {item.isBidding ? (
                        <Link to={`/dashboard/inventory/${item.id}/bids`}>
                          <Button variant="outline" size="sm">
                            <DollarSign className="h-4 w-4 mr-2" />
                            Bids
                          </Button>
                        </Link>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStartBid(item)}
                        >
                          <DollarSign className="h-4 w-4 mr-2" />
                          Start Bid
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <div className="flex items-center justify-center h-96">
            <p className="font-semibold text-center">No Products yet!</p>
          </div>
        )}
      </div>

      <Button className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg">
        <Link to="add">
          <Plus className="h-6 w-6" />
        </Link>
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start Bidding</DialogTitle>
            <DialogDescription>
              Are you sure you want to start bidding for this product?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmStartBid}>Confirm</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryPage;
