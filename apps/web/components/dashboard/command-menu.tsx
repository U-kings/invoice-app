"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useHotkeys } from "react-hotkeys-hook";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@workspace/ui/components/command";

import {
  Dialog,
  DialogContent,
} from "@workspace/ui/components/dialog";

const pages = [
  {
    title: "Dashboard",
    href: "/dashboard",
  },
  {
    title: "Invoices",
    href: "/dashboard/invoices",
  },
  {
    title: "Customers",
    href: "/dashboard/customers",
  },
  {
    title: "Payments",
    href: "/dashboard/payments",
  },
  {
    title: "Reports",
    href: "/dashboard/reports",
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
  },
];

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);

  const router = useRouter();

  useHotkeys("ctrl+k,meta+k", (e) => {
    e.preventDefault();
    setOpen((prev) => !prev);
  });

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogContent className="overflow-hidden p-0">
        <Command>
          <CommandInput placeholder="Search..." />

          <CommandList>
            <CommandEmpty>
              No results found.
            </CommandEmpty>

            <CommandGroup heading="Pages">
              {pages.map((page) => (
                <CommandItem
                  key={page.href}
                  onSelect={() => {
                    router.push(page.href);
                    setOpen(false);
                  }}
                >
                  {page.title}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}