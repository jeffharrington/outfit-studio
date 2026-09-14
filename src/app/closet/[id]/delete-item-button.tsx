"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { deleteClothingItem } from "@/lib/actions/items";
import { Button } from "@/components/ui/button";

export function DeleteItemButton({ id }: { id: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [isDeleting, startDelete] = useTransition();

  function handleDelete() {
    startDelete(async () => {
      try {
        await deleteClothingItem(id);
        toast.success("Item deleted");
        router.push("/closet");
      } catch {
        toast.error("Something went wrong deleting this item.");
      }
    });
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Delete this item?</span>
        <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
          {isDeleting ? "Deleting…" : "Yes, delete"}
        </Button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={isDeleting}
          className="cursor-pointer text-sm text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <Button variant="destructive" size="sm" onClick={() => setConfirming(true)}>
      <Trash2 />
      Delete item
    </Button>
  );
}
