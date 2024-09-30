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
import { LoaderFunctionArgs } from "@remix-run/node";
import { Users } from "@/db/schema";
import { useLoaderData } from "@remix-run/react";

const mockData = [
  { name: "Jan", value: 4000 },
  { name: "Feb", value: 3000 },
  { name: "Mar", value: 5000 },
  { name: "Apr", value: 4500 },
  { name: "May", value: 6000 },
  { name: "Jun", value: 5500 },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const user = (await getUser(request)) as Users;
  return { user };
}

const EnhancedFarmerDashboard = () => {
  const { user } = useLoaderData<typeof loader>();
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <CardTitle className="text-xl">
          Welcome, {user.fullName || ""}
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
                <p className="text-2xl font-bold mb-2">₹27,980.24</p>
              </TabsContent>
              <TabsContent value="all">
                <p className="text-2xl font-bold mb-2">₹27,980.24</p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Weather Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-2xl font-bold">28°C</p>
                <p className="text-sm">Partly Cloudy</p>
              </div>
              <Sun className="h-12 w-12 text-yellow-500" />
            </div>
            <div className="flex justify-between mt-4">
              <div className="flex items-center">
                <Droplet className="h-4 w-4 mr-2" />
                <span>62% Humidity</span>
              </div>
              <div className="flex items-center">
                <Wind className="h-4 w-4 mr-2" />
                <span>8 km/h Wind</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="mb-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
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
                  <li className="flex justify-between">
                    <span>Rice</span>
                    <span>2,500 kg</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Wheat</span>
                    <span>1,800 kg</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Potatoes</span>
                    <span>3,200 kg</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full mt-4">
                  Manage Inventory
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Pending Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex justify-between items-center">
                    <span>Order #1234</span>
                    <Badge>Processing</Badge>
                  </li>
                  <li className="flex justify-between items-center">
                    <span>Order #1235</span>
                    <Badge variant="secondary">Shipped</Badge>
                  </li>
                  <li className="flex justify-between items-center">
                    <span>Order #1236</span>
                    <Badge variant="outline">Pending</Badge>
                  </li>
                </ul>
                <Button variant="outline" className="w-full mt-4">
                  View All Orders
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Market Prices</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span>Rice</span>
                    <span className="flex items-center">
                      ₹35/kg{" "}
                      <TrendingUp className="h-4 w-4 text-green-500 ml-1" />
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>Wheat</span>
                    <span className="flex items-center">
                      ₹28/kg{" "}
                      <TrendingUp className="h-4 w-4 text-green-500 ml-1" />
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>Potatoes</span>
                    <span>₹15/kg</span>
                  </li>
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
        <TabsContent value="orders">Orders management content</TabsContent>
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
            <LineChart data={mockData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alerts & Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-center text-yellow-500">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <span>
                Pest outbreak reported in nearby areas. Take preventive
                measures.
              </span>
            </li>
            <li className="flex items-center text-blue-500">
              <Truck className="h-4 w-4 mr-2" />
              <span>
                New transportation subsidy available for long-distance
                deliveries.
              </span>
            </li>
            <li className="flex items-center text-green-500">
              <TrendingUp className="h-4 w-4 mr-2" />
              <span>
                Wheat prices expected to rise next month. Consider holding your
                stock.
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </>
  );
};

export default EnhancedFarmerDashboard;
