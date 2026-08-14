"use client";

import {
  Download,
  Trash2,
  X,
} from "lucide-react";

import { Button } from "@workspace/ui/components/button";

interface InvoiceBulkActionsProps {
  selectedCount: number;
  onClear: () => void;
}

export function InvoiceBulkActions({
  selectedCount,
  onClear,
}: InvoiceBulkActionsProps) {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-muted/40 p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">
          {selectedCount}{" "}
          {selectedCount === 1
            ? "invoice"
            : "invoices"}{" "}
          selected
        </span>

        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="h-8 gap-1.5"
        >
          <X className="h-3.5 w-3.5" />
          Clear
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5"
        >
          <Download className="h-3.5 w-3.5" />
          Download
        </Button>

        <Button
          variant="destructive"
          size="sm"
          className="h-8 gap-1.5"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </Button>
      </div>
    </div>
  );
}