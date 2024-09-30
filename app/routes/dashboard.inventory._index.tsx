import React from "react";
import { Plus, Search, ChevronRight } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Link, useLoaderData } from "@remix-run/react";
import { LoaderFunctionArgs } from "@remix-run/node";
import { db } from "@/db/index.server";
import { products, Users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getUser } from "@/utils/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = (await getUser(request)) as Users;
  const allProducts = await db
    .select()
    .from(products)
    .where(eq(products.farmerId, user.id));
  return { user, allProducts };
}

const InventoryPage = () => {
  const { allProducts } = useLoaderData<typeof loader>();
  return (
    <div className=" min-h-screen">
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
                <CardContent className="p-0">
                  <div className="flex items-center">
                    <img
                      src={""}
                      alt={item.name}
                      className="w-20 h-20 object-cover"
                    />
                    <div className="flex-grow p-3">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <p className="text-sm text-gray-600">
                        {item.quantity} {item.unit}
                      </p>
                      <p className="font-bold text-green-600">
                        ₹{item.price.toFixed(2)}
                      </p>
                    </div>
                    <ChevronRight className="h-6 w-6 text-gray-400 mr-4" />
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
    </div>
  );
};

export default InventoryPage;
