"use client";

import React from "react";
import { Vortex } from "@/components/ui/vortex";

export function VortexDemo() {
  return (
    <div
      className="w-full mx-0 rounded-md h-[40rem] overflow-hidden">
      <Vortex
        backgroundColor="black"
        className="flex items-center flex-col justify-center px-2 md:px-10 py-4 w-full h-full">
        {/* Empty - content will be overlayed from the parent component */}
      </Vortex>
    </div>
  );
}
