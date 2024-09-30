import { Link } from "@remix-run/react";
import React from "react";
import { Button } from "~/components/ui/button";

const CreativeLandingPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-200 p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2 animate-pulse">KrishiKunj</h1>
          <p className=" mb-8">Empowering farmers, connecting communities</p>
        </div>
        <div className="relative">
          <div className="absolute inset-0 bg-white opacity-20 blur transform -skew-y-6 rounded-3xl"></div>
          <div className="relative bg-white p-8 rounded-3xl shadow-xl">
            <div className="flex w-full items-center justify-center">
              <img src="./logo.png" className="w-40 h-40" />
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
