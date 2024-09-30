import { Link } from "@remix-run/react";
import React from "react";
import { Button } from "~/components/ui/button";

const CreativeLandingPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 to-blue-500 p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2 animate-pulse">
            KrishiKunj
          </h1>
          <p className="text-xl text-white mb-8">
            Empowering farmers, connecting communities
          </p>
        </div>
        <div className="relative">
          <div className="absolute inset-0 bg-white opacity-20 blur transform -skew-y-6 rounded-3xl"></div>
          <div className="relative bg-white p-8 rounded-3xl shadow-xl">
            <div className="mb-6 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <Button
              asChild
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-full transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
            >
              <Link to="/login">Login to Your Farm</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreativeLandingPage;
