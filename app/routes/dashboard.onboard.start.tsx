import React from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Form, redirect } from "@remix-run/react";
import { ActionFunctionArgs } from "@remix-run/node";
import { db } from "@/db/index.server";
import { users } from "@/db/schema";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const name = formData.get("name") as string;

  const [user] = await db
    .update(users)
    .set({
      fullName: name,
    })
    .returning();

  if (user) {
    return redirect("/dashboard/onboard/location");
  }

  return null;
}

const OnboardingPage = () => {
  return (
    <Card className="w-full max-w-md h-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Welcome to KrishiKunj!
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="flex text-2xl text-center">
          Complete your profile to get started.
        </p>
        <Form method="post" className="space-y-4 h-full mt-5">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" placeholder="Enter your full name" />
          </div>
          <Button className="w-full bg-green-500 hover:bg-green-600">
            Start Your Journey
          </Button>
        </Form>
      </CardContent>
    </Card>
  );
};

export default OnboardingPage;
