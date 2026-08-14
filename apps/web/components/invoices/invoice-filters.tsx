"use client";

import { Search, SlidersHorizontal } from "lucide-react";

import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";

export function InvoiceFilters() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          placeholder="Search invoices..."
          className="h-11 pl-9"
        />
      </div>

      <Button
        variant="outline"
        className="h-11"
      >
        <SlidersHorizontal className="mr-2 h-4 w-4" />
        Filters
      </Button>
    </div>
  );
}