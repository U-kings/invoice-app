"use client";

import { LoaderCircle } from "lucide-react";

export function AuthLoader() {
  return (
    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
  );
}