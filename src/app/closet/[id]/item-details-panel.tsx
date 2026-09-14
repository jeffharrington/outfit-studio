"use client";

import { Check, Pencil } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import type { ClothingItem } from "@/lib/actions/items";
import { updateClothingItem } from "@/lib/actions/items";
import { capitalize } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

import { DeleteItemButton } from "./delete-item-button";

const RATING_FIELDS = [
  { key: "casualness", label: "Casualness" },
  { key: "trendiness", label: "Trendiness" },
  { key: "boldness", label: "Boldness" },
  { key: "warmth", label: "Warmth" },
] as const;

type RatingKey = (typeof RATING_FIELDS)[number]["key"];

interface FormState {
  name: string;
  pattern: string;
  primaryColor: string;
  secondaryColor: string;
  casualness: number;
  trendiness: number;
  boldness: number;
  warmth: number;
}

function toFormState(item: ClothingItem): FormState {
  return {
    name: item.name ?? "",
    pattern: item.pattern ?? "",
    primaryColor: item.primary_color,
    secondaryColor: item.secondary_color ?? "",
    casualness: item.casualness,
    trendiness: item.trendiness,
    boldness: item.boldness,
    warmth: item.warmth,
  };
}

export function ItemDetailsPanel({ item: initialItem }: { item: ClothingItem }) {
  const [item, setItem] = useState(initialItem);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<FormState>(() => toFormState(initialItem));
  const [isSaving, startSave] = useTransition();

  function handleEdit() {
    setForm(toFormState(item));
    setIsEditing(true);
  }

  function handleCancel() {
    setForm(toFormState(item));
    setIsEditing(false);
  }

  function handleSave() {
    if (!form.primaryColor.trim()) return;
    startSave(async () => {
      try {
        const updated = await updateClothingItem(item.id, {
          name: form.name.trim() || null,
          pattern: form.pattern.trim() || null,
          primaryColor: form.primaryColor.trim(),
          secondaryColor: form.secondaryColor.trim() || null,
          casualness: form.casualness,
          trendiness: form.trendiness,
          boldness: form.boldness,
          warmth: form.warmth,
        });
        setItem(updated);
        setIsEditing(false);
        toast.success("Item updated");
      } catch {
        toast.error("Something went wrong saving these changes.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-6 rounded-lg border p-6">
      {isEditing ? (
        <div className="flex flex-col gap-2">
          <Label htmlFor="item-name" className="font-normal text-muted-foreground">
            Name
          </Label>
          <Input
            id="item-name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Untitled item"
          />
        </div>
      ) : (
        <h1 className="font-heading text-2xl font-normal tracking-normal">
          {item.name ?? "Untitled item"}
        </h1>
      )}

      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
        <div>
          <dt className="text-muted-foreground">Type</dt>
          <dd>{capitalize(item.category)}</dd>
        </div>
        <div className="flex flex-col gap-2">
          {isEditing ? (
            <>
              <Label htmlFor="item-pattern" className="font-normal text-muted-foreground">
                Pattern
              </Label>
              <Input
                id="item-pattern"
                value={form.pattern}
                onChange={(e) => setForm((prev) => ({ ...prev, pattern: e.target.value }))}
              />
            </>
          ) : (
            <>
              <dt className="text-muted-foreground">Pattern</dt>
              <dd>{item.pattern ? capitalize(item.pattern) : "—"}</dd>
            </>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {isEditing ? (
            <>
              <Label htmlFor="item-primary-color" className="font-normal text-muted-foreground">
                Primary color
              </Label>
              <Input
                id="item-primary-color"
                value={form.primaryColor}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, primaryColor: e.target.value }))
                }
                aria-invalid={!form.primaryColor.trim()}
              />
            </>
          ) : (
            <>
              <dt className="text-muted-foreground">Primary color</dt>
              <dd>{capitalize(item.primary_color)}</dd>
            </>
          )}
        </div>
        <div className="flex flex-col gap-2">
          {isEditing ? (
            <>
              <Label htmlFor="item-secondary-color" className="font-normal text-muted-foreground">
                Secondary color
              </Label>
              <Input
                id="item-secondary-color"
                value={form.secondaryColor}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, secondaryColor: e.target.value }))
                }
              />
            </>
          ) : (
            <>
              <dt className="text-muted-foreground">Secondary color</dt>
              <dd>{item.secondary_color ? capitalize(item.secondary_color) : "—"}</dd>
            </>
          )}
        </div>

        {RATING_FIELDS.map((field) => (
          <div key={field.key} className="flex flex-col gap-2">
            {isEditing ? (
              <>
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor={`item-${field.key}`}
                    className="font-normal text-muted-foreground"
                  >
                    {field.label}
                  </Label>
                  <span className="text-muted-foreground">{form[field.key]}</span>
                </div>
                <Slider
                  id={`item-${field.key}`}
                  min={1}
                  max={10}
                  step={1}
                  value={[form[field.key]]}
                  onValueChange={(next) => {
                    const value = Array.isArray(next) ? next[0] : next;
                    setForm((prev) => ({ ...prev, [field.key as RatingKey]: value }));
                  }}
                />
              </>
            ) : (
              <>
                <dt className="text-muted-foreground">{field.label}</dt>
                <dd>{item[field.key]}/10</dd>
              </>
            )}
          </div>
        ))}
      </dl>

      <div className="flex items-center gap-3 border-t pt-6">
        {isEditing ? (
          <>
            <Button
              variant="accent"
              onClick={handleSave}
              disabled={isSaving || !form.primaryColor.trim()}
            >
              <Check />
              {isSaving ? "Saving…" : "Save changes"}
            </Button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
              className="cursor-pointer text-sm text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Pencil />
              Edit item
            </Button>
            <DeleteItemButton id={item.id} />
          </>
        )}
      </div>
    </div>
  );
}
