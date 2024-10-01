import React from "react";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { ExternalLink } from "lucide-react";

interface Scheme {
  name: string;
  government: string;
  link: string;
  description: string;
  benefits: string;
}

export async function loader({ request }: LoaderFunctionArgs) {
  // In a real application, you would fetch this data from an API or database
  const schemes = {
    schemes: [
      {
        name: "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
        government: "Center",
        link: "https://pmkisan.gov.in/",
        description:
          "A central sector scheme providing income support to all landholding farmer families to supplement their financial needs.",
        benefits:
          "₹6,000 per year paid in three equal installments directly to farmers' bank accounts.",
      },
      {
        name: "Mukhyamantri Kisan Pension Yojana",
        government: "State",
        link: "https://uk.gov.in/",
        description:
          "A pension scheme for small and marginal farmers in Uttarakhand to provide financial security during old age.",
        benefits:
          "Monthly pension for small and marginal farmers aged above 60 years.",
      },
      {
        name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
        government: "Center",
        link: "https://pmfby.gov.in/",
        description:
          "Crop insurance scheme to provide financial support to farmers in case of crop failure due to natural calamities, pests, and diseases.",
        benefits:
          "Insurance coverage and financial support for crop loss due to natural calamities, pests, and diseases.",
      },
      {
        name: "Deendayal Upadhyaya Kisan Kalyan Yojana",
        government: "State",
        link: "https://uk.gov.in/",
        description:
          "State-level initiative to provide financial support and guidance to small and marginal farmers for sustainable agriculture.",
        benefits:
          "Financial assistance for modern agricultural techniques and equipment to improve productivity.",
      },
      {
        name: "Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)",
        government: "Center",
        link: "https://pmksy.gov.in/",
        description:
          "Central scheme to improve access to irrigation by ensuring water availability for farms, focusing on water conservation.",
        benefits:
          "Financial support for irrigation infrastructure, promoting efficient water use and increasing agricultural productivity.",
      },
      {
        name: "Pandit Deendayal Upadhyay Kisan Yojana",
        government: "State",
        link: "https://uk.gov.in/",
        description:
          "A state scheme aimed at providing farmers with loans at a reduced interest rate to support agricultural development.",
        benefits:
          "Subsidized loans to farmers for purchasing seeds, fertilizers, and agricultural equipment.",
      },
    ],
  };

  return json(schemes);
}

export default function SchemesPage() {
  const { schemes } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Agricultural Schemes
      </h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {schemes.map((scheme: Scheme, index: number) => (
          <Card key={index} className="flex flex-col h-full">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl mb-2">{scheme.name}</CardTitle>
                <Badge
                  variant={
                    scheme.government === "Center" ? "default" : "secondary"
                  }
                >
                  {scheme.government}
                </Badge>
              </div>
              <CardDescription>{scheme.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <h3 className="font-semibold mb-2">Benefits:</h3>
              <p>{scheme.benefits}</p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <a href={scheme.link} target="_blank" rel="noopener noreferrer">
                  Learn More <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
