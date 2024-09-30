import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { users, Users } from "@/db/schema";
import { getUser } from "@/utils/session.server";
import { Form, redirect, useLoaderData } from "@remix-run/react";
import { db } from "@/db/index.server";
import { s3Client } from "nodejs-s3-typescript";

const s3Config = {
  bucketName: process.env.S3_BUCKET as string,
  region: process.env.S3_REGION as string,
  accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
  s3Url: "https://saaskart.s3.us-east-2.amazonaws.com",
};

export async function loader({ request }: LoaderFunctionArgs) {
  const user = (await getUser(request)) as Users;
  return { user };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  var imageS3Url: string = "";
  const name = formData.get("name") as string;
  const address = formData.get("address") as string;
  const email = formData.get("email") as string;

  try {
    const file = formData.get("image") as File;
    const s3 = new s3Client({
      ...s3Config,
    });
    const s3Upload = await s3.uploadFile(
      Buffer.from(await file.arrayBuffer()),
      "delete" + name
    );
    imageS3Url = s3Upload.location;
  } catch (e) {
    console.log(e);
  }

  const user = await db.update(users).set({
    fullName: name,
    address,
    email,
    profileImage: imageS3Url,
  });

  if (user) {
    return redirect("/dashboard");
  }

  return { error: "all fields are required" };
}

const ProfileUpdatePage = () => {
  const { user } = useLoaderData<typeof loader>();
  const [image, setImage] = useState<any>(user?.profileImage || null);

  const handleImageUpload = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const fileURL = URL.createObjectURL(file);
      setImage(fileURL);
    }
  };
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Update Your Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form method="post" className="space-y-4" encType="multipart/form-data">
          <div className="text-center">
            <Avatar className="w-24 h-24 mx-auto">
              <AvatarImage src={image} alt="Profile Picture" />
              <AvatarFallback>UP</AvatarFallback>
            </Avatar>
            <div className="mb-4 flex flex-col items-center lg:flex-row">
              <Label className="mb-2 block w-full text-sm font-medium text-gray-700 lg:w-1/3">
                Image
              </Label>
              <div className="flex w-full items-center justify-center lg:w-2/3">
                <div className="ml-4">
                  <Button
                    type="button"
                    variant="outline"
                    asChild
                    className="mb-2"
                  >
                    <label htmlFor="imageUpload" className="cursor-pointer">
                      Choose Image
                    </label>
                  </Button>
                  <input
                    className="hidden cursor-pointer bg-slate-200"
                    type="file"
                    accept="image/*"
                    name="image"
                    onChange={handleImageUpload}
                    id="imageUpload"
                  />
                  <p className="text-xs text-gray-500">SVG, PNG, JPG</p>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter your name"
              defaultValue={user.fullName || ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Address</Label>
            <Input
              id="address"
              name="address"
              placeholder="Enter your location"
            />
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
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
            />
          </div>
          <Button className="w-full">Update Profile</Button>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ProfileUpdatePage;
