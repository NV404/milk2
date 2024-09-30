import React from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Users } from "@/db/schema";
import { getUser } from "@/utils/session.server";
import { useLoaderData } from "@remix-run/react";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = (await getUser(request)) as Users;
  return { user };
}

const ProfileUpdatePage = () => {
  const { user } = useLoaderData<typeof loader>();
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Update Your Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div className="text-center">
            <Avatar className="w-24 h-24 mx-auto">
              <AvatarImage src="#" alt="Profile Picture" />
              <AvatarFallback>UP</AvatarFallback>
            </Avatar>
            <Button variant="outline" className="mt-2">
              Change Picture
            </Button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Enter your name"
              defaultValue={user.fullName || ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Address</Label>
            <Input id="address" placeholder="Enter your location" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              disabled
              placeholder="Enter your phone number"
              value={user.phoneNumber || ""}
              readOnly
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="Enter your email" />
          </div>
          <Button className="w-full">Update Profile</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileUpdatePage;
