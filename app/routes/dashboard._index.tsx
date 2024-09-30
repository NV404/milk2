import React from "react";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Progress } from "~/components/ui/progress";
import { Badge } from "~/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Menu,
  Settings,
  Bell,
  ChevronRight,
  Droplet,
  Sun,
  Wind,
  TrendingUp,
  Truck,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { getUser } from "@/utils/session.server";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { Users, products, orders, marketPrices } from "@/db/schema";
import { useLoaderData } from "@remix-run/react";
import { db } from "@/db/index.server";
import { eq, sum, desc } from "drizzle-orm";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = (await getUser(request)) as Users;

  if (!user || !user.isFarmer) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayEarnings = await db
    .select({ total: sum(orders.totalAmount) })
    .from(orders)
    .where(eq(orders.consumerId, user.id))
    .where(eq(orders.createdAt, today))
    .execute();

  const inventory = await db
    .select({
      name: products.name,
      quantity: products.quantity,
      unit: products.unit,
    })
    .from(products)
    .where(eq(products.farmerId, user.id))
    .limit(3)
    .execute();

  const pendingorders = await db
    .select({
      id: orders.id,
      status: orders.status,
    })
    .from(orders)
    .where(eq(orders.consumerId, user.id))
    .where(eq(orders.status, "pending"))
    .limit(3)
    .execute();

  const marketPricess = await db
    .select({
      cropName: marketPrices.cropName,
      price: marketPrices.price,
    })
    .from(marketPrices)
    .orderBy(desc(marketPrices.date))
    .limit(3)
    .execute();

  const salesPerformance = await db
    .select({
      date: orders.createdAt,
      total: sum(orders.totalAmount),
    })
    .from(orders)
    .where(eq(orders.consumerId, user.id))
    .groupBy(orders.createdAt)
    .orderBy(desc(orders.createdAt))
    .limit(6)
    .execute();

  return json({
    user,
    todayEarnings: todayEarnings[0]?.total || 0,
    inventory,
    pendingorders,
    marketPricess,
    salesPerformance,
  });
}

const EnhancedFarmerDashboard = () => {
  const {
    user,
    todayEarnings,
    inventory,
    pendingorders,
    marketPricess,
    salesPerformance,
  } = useLoaderData<typeof loader>();

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <CardTitle className="text-xl">
          Welcome, {user.fullName || "Farmer"}
        </CardTitle>
        <Card>
          <CardContent>
            <p className="py-3 mt-2 font-semibold text-xl">Today's Earning</p>
            <Tabs defaultValue="today">
              <TabsList className="w-full">
                <TabsTrigger value="today" className="w-full">
                  Today
                </TabsTrigger>
                <TabsTrigger value="all" className="w-full">
                  All Time
                </TabsTrigger>
              </TabsList>
              <TabsContent value="today">
                <p className="text-2xl font-bold mb-2">
                  ₹{todayEarnings.toFixed(2)}
                </p>
              </TabsContent>
              <TabsContent value="all">
                <p className="text-2xl font-bold mb-2">
                  ₹{(todayEarnings * 30).toFixed(2)}
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        {/* Weather Forecast card remains unchanged */}
      </div>

      <Tabs defaultValue="overview" className="mb-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="orders">orders</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Current Inventory</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {inventory.map((item) => (
                    <li key={item.name} className="flex justify-between">
                      <span>{item.name}</span>
                      <span>
                        {item.quantity} {item.unit}
                      </span>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full mt-4">
                  Manage Inventory
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Pending orders</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {pendingorders.map((order: any) => (
                    <li
                      key={order.id}
                      className="flex justify-between items-center"
                    >
                      <span>Order #{order.id.slice(0, 8)}</span>
                      <Badge>{order.status}</Badge>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full mt-4">
                  View All orders
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Market Prices</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {marketPricess.map((price) => (
                    <li key={price.cropName} className="flex justify-between">
                      <span>{price.cropName}</span>
                      <span className="flex items-center">
                        ₹{price.price.toFixed(2)}/kg
                        <TrendingUp className="h-4 w-4 text-green-500 ml-1" />
                      </span>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full mt-4">
                  View Full Market Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="inventory">
          Inventory management content
        </TabsContent>
        <TabsContent value="orders">orders management content</TabsContent>
        <TabsContent value="insights">
          Insights and analytics content
        </TabsContent>
      </Tabs>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Sales Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(date) => new Date(date).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
              />
              <Line type="monotone" dataKey="total" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Alerts & Notifications card remains unchanged */}
    </>
  );
};

export default EnhancedFarmerDashboard;
