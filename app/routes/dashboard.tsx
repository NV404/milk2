import { Users } from "@/db/schema";
import { getUser, logout } from "@/utils/session.server";
import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { Bell, Menu, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = (await getUser(request)) as Users;
  if (!user.isFarmer) {
    return redirect("/");
  }

  return { user };
}

export default function Dashboard() {
  const { user } = useLoaderData<typeof loader>();
  return (
    <div className="p-4 max-w-4xl mx-auto bg-background text-foreground">
      <header className="flex justify-between items-center mb-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <nav className="flex flex-col space-y-4">
              <a href="/dashboard">Dashboard</a>
              <a href="/dashboard/inventory">Inventory</a>
              <a href="/dashboard/orders">Orders</a>
              <a href="/dashboard/analytics">Analytics</a>
              <a href="/dashboard/marketplace">Marketplace</a>
              <a href="/dashboard/learning">Learning Center</a>
              <a href="/dashboard/community">Farmer Community</a>
              <a href="/dashboard/support">Support</a>
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <Bell className="h-6 w-6" />
          </Button>
          {/* <Button variant="ghost" size="icon">
            <Settings className="h-6 w-6" />
          </Button> */}
          <Link to={"/dashboard/profile"}>
            <Avatar>
              <AvatarImage src={user.profileImage || ""} />
              <AvatarFallback>RS</AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
