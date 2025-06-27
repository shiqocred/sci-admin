import React from "react";
import { Client } from "./_components/client";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Verification Email" };

const VerifyPage = async () => {
  return (
    <div className="bg-white w-full h-full">
      <div className="[background-image:radial-gradient(88%_100%_at_top,rgba(134,239,172,0.5),rgba(134,239,172,0))] w-full h-full flex items-center justify-center">
        <Client />
      </div>
    </div>
  );
};

export default VerifyPage;
