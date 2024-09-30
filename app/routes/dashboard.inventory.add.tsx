import React, { useState } from "react";
import { ArrowLeft, Camera } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Label } from "~/components/ui/label";
import { ActionFunctionArgs } from "@remix-run/node";
import { Form, redirect } from "@remix-run/react";
import { db } from "@/db/index.server";
import { products, Users } from "@/db/schema";
import { getUser } from "@/utils/session.server";
import { s3Client } from "nodejs-s3-typescript";

const s3Config = {
  bucketName: process.env.S3_BUCKET as string,
  region: process.env.S3_REGION as string,
  accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
  s3Url: "https://saaskart.s3.us-east-2.amazonaws.com",
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  var imageS3Url: string = "";
  const name = formData.get("name") as string;
  const quantity = formData.get("quantity") as string;
  const unit = formData.get("unit") as string;
  const price = formData.get("price") as string;
  const description = formData.get("description") as string;

  const user = (await getUser(request)) as Users;

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

  const product = await db.insert(products).values({
    name,
    price: Number(price),
    quantity: Number(quantity),
    unit,
    type: "",
    description,
    image: imageS3Url,
    farmerId: user.id,
  });

  if (product) {
    return redirect("/dashboard/inventory");
  }
}

const AddItemPage = () => {
  const units = ["kg", "g", "l", "ml", "piece", "dozen", "bundle"];
  const [image, setImage] = useState<any>(null);

  const handleImageUpload = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const fileURL = URL.createObjectURL(file);
      setImage(fileURL);
    }
  };

  return (
    <div className="min-h-screen">
      <div>
        <Form method="post" className="space-y-4" encType="multipart/form-data">
          <div className="mb-4 flex flex-col items-center lg:flex-row">
            <Label className="mb-2 block w-full text-sm font-medium text-gray-700 lg:w-1/3">
              Image
            </Label>
            <div className="flex w-full items-center lg:w-2/3">
              <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-md bg-gray-200 p-2">
                {image ? (
                  <img
                    // className="h-full w-full object-contain"
                    src={image}
                    alt="Uploaded"
                  ></img>
                ) : (
                  <p>No Image</p>
                )}
              </div>
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
          <div className="space-y-2">
            <Label htmlFor="name" className="font-semibold text-gray-700">
              Name
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter item name"
              className="rounded-lg"
            />
          </div>

          <div className="flex space-x-4">
            <div className="space-y-2 flex-1">
              <Label htmlFor="quantity" className="font-semibold text-gray-700">
                Quantity
              </Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                placeholder="Enter quantity"
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2 flex-1">
              <Label htmlFor="unit" className="font-semibold text-gray-700">
                Unit
              </Label>
              <Select name="unit">
                <SelectTrigger id="unit" className="rounded-lg">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price" className="font-semibold text-gray-700">
              Price per unit
            </Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              placeholder="Enter price"
              className="rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="font-semibold text-gray-700"
            >
              Description
            </Label>
            <Input
              id="description"
              name="description"
              placeholder="Enter item description"
              className="rounded-lg"
            />
          </div>

          <Button type="submit" className="w-full rounded-lg">
            Add Item
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default AddItemPage;
