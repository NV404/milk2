import React, { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

const translations = {
  en: {
    welcome: "Welcome",
    todaysEarning: "Today's Earning",
    today: "Today",
    allTime: "All Time",
    currentInventory: "Current Inventory",
    manageInventory: "Manage Inventory",
    pendingOrders: "Pending Orders",
    viewAllOrders: "View All Orders",
    marketPrices: "Market Prices",
    viewFullMarketReport: "View Full Market Report",
    salesPerformance: "Sales Performance",
    overview: "Overview",
    inventory: "Inventory",
    orders: "Orders",
    insights: "Insights",
  },
  hi: {
    welcome: "स्वागत है",
    todaysEarning: "आज की कमाई",
    today: "आज",
    allTime: "कुल",
    currentInventory: "वर्तमान इन्वेंटरी",
    manageInventory: "इन्वेंटरी प्रबंधित करें",
    pendingOrders: "लंबित आदेश",
    viewAllOrders: "सभी आदेश देखें",
    marketPrices: "बाजार मूल्य",
    viewFullMarketReport: "पूरी बाजार रिपोर्ट देखें",
    salesPerformance: "बिक्री प्रदर्शन",
    overview: "अवलोकन",
    inventory: "इन्वेंटरी",
    orders: "आदेश",
    insights: "अंतर्दृष्टि",
  },
  km: {
    welcome: "स्वागत छ", // Kumaoni translation (approximate)
    todaysEarning: "आजको कमाई",
    today: "आज",
    allTime: "जम्मा",
    currentInventory: "हालको सामान",
    manageInventory: "सामान व्यवस्थापन",
    pendingOrders: "बाँकी आदेश",
    viewAllOrders: "सबै आदेश हेर्नुहोस्",
    marketPrices: "बजार मूल्य",
    viewFullMarketReport: "पूरा बजार रिपोर्ट हेर्नुहोस्",
    salesPerformance: "बिक्री प्रदर्शन",
    overview: "अवलोकन",
    inventory: "सामान",
    orders: "आदेश",
    insights: "अन्तर्दृष्टि",
  },
};

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
    pendingOrders,
    marketPrices,
    salesPerformance,
  } = useLoaderData<typeof loader>();

  const [language, setLanguage] = useState("en");
  const t = translations[language];

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <CardTitle className="text-xl">
          {t.welcome}, {user.fullName || "Farmer"}
        </CardTitle>
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
            <SelectItem value="km">कुमाऊनी (Kumaoni)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardContent>
            <p className="py-3 mt-2 font-semibold text-xl">{t.todaysEarning}</p>
            <Tabs defaultValue="today">
              <TabsList className="w-full">
                <TabsTrigger value="today" className="w-full">
                  {t.today}
                </TabsTrigger>
                <TabsTrigger value="all" className="w-full">
                  {t.allTime}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="today">
                <p className="text-2xl font-bold mb-2">₹{todayEarnings}</p>
              </TabsContent>
              <TabsContent value="all">
                <p className="text-2xl font-bold mb-2">₹{todayEarnings}</p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        {/* Weather Forecast card remains unchanged */}
      </div>

      <Tabs defaultValue="overview" className="mb-6">
        <TabsList>
          <TabsTrigger value="overview">{t.overview}</TabsTrigger>
          <TabsTrigger value="inventory">{t.inventory}</TabsTrigger>
          <TabsTrigger value="orders">{t.orders}</TabsTrigger>
          <TabsTrigger value="insights">{t.insights}</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>{t.currentInventory}</CardTitle>
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
                  {t.manageInventory}
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t.pendingOrders}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {pendingOrders?.map((order: any) => (
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
                  {t.viewAllOrders}
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t.marketPrices}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {marketPrices?.map((price) => (
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
                  {t.viewFullMarketReport}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="inventory">
          Inventory management content
        </TabsContent>
        <TabsContent value="orders">Orders management content</TabsContent>
        <TabsContent value="insights">
          Insights and analytics content
        </TabsContent>
      </Tabs>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t.salesPerformance}</CardTitle>
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
