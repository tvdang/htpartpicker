"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/primitives/table";
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogDescription,
  DialogTitle,
} from "@/components/primitives/dialog";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/primitives/button";
import { PlusIcon, WrenchIcon } from "@heroicons/react/16/solid";
import { Badge } from "@/components/primitives/badge";
import { TextLink } from "@/components/primitives/text";
import { Input } from "@/components/primitives/input";
import { Item, items } from "@/data/products";
import { TypewriterEffectSmooth } from "@/components/effects/typewriter-effect";
import BuildCard from "./buildcard";

type BuildSelection = {
  brand: string;
  model: string;
  pricePaid: string;
};

type BadgeColor =
  | "teal"
  | "blue"
  | "purple"
  | "amber"
  | "yellow"
  | "green"
  | "red"
  | "fuchsia";
interface BadgeColors {
  [key: string]: BadgeColor;
}

const badgeColors = {
  device: "teal",
  speaker: "blue",
  accessory: "fuchsia",
  works: "yellow",
  recommended: "green",
  incompatible: "red",
  single: "amber",
  pair: "purple",
} as BadgeColors;

function SectionHeading() {
  return (
    <div className="flex items-center gap-4">
      <WrenchIcon className="h-6 w-6 md:h-10 md:w-10" />
      <TypewriterEffectSmooth
        className=""
        words={[
          { text: "Build" },
          { text: "your" },
          {
            text: "Home",
            className: "text-sky-700 dark:text-sky-800",
          },
          {
            text: "Theater",
            className: "text-sky-800 dark:text-sky-900",
          },
        ]}
      />
    </div>
  );
}

function BuildTable() {
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [selections, setSelections] = useState<Record<string, BuildSelection>>(
    {}
  );
  const [draftBrand, setDraftBrand] = useState("");
  const [draftModel, setDraftModel] = useState("");

  function openItemDialog(item: Item) {
    const selection = selections[item.name];
    setDraftBrand(selection?.brand ?? "");
    setDraftModel(selection?.model ?? "");
    setEditingItem(item);
  }

  function saveSelection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const brand = draftBrand.trim();
    const model = draftModel.trim();
    if (!brand || !model) return;

    if (!editingItem) return;
    setSelections((currentSelections) => ({
      ...currentSelections,
      [editingItem.name]: {
        brand,
        model,
        pricePaid:
          currentSelections[editingItem.name]?.brand === brand &&
          currentSelections[editingItem.name]?.model === model
            ? currentSelections[editingItem.name].pricePaid
            : "",
      },
    }));
    setEditingItem(null);
  }

  function updatePricePaid(item: Item, pricePaid: string) {
    setSelections((currentSelections) => ({
      ...currentSelections,
      [item.name]: { ...currentSelections[item.name], pricePaid },
    }));
  }

  const totalCost = Object.values(selections).reduce((total, selection) => {
    if (!selection.pricePaid.trim()) return total;
    const price = Number(selection.pricePaid);
    return Number.isFinite(price) && price >= 0 ? total + price : total;
  }, 0);

  return (
    <>
      <Dialog
        open={editingItem !== null}
        onClose={() => setEditingItem(null)}
      >
        <form onSubmit={saveSelection}>
          <DialogTitle>
            Add your {editingItem?.name.toLowerCase()}
          </DialogTitle>
          <DialogDescription>
            Enter the brand and model number for this component.
          </DialogDescription>
          <DialogBody className="space-y-4">
            <label className="block space-y-2" htmlFor="component-brand">
              <span className="text-sm font-medium">Brand</span>
              <Input
                autoComplete="organization"
                id="component-brand"
                name="brand"
                placeholder="e.g. Sony"
                required
                value={draftBrand}
                onChange={(event) => setDraftBrand(event.target.value)}
              />
            </label>
            <label className="block space-y-2" htmlFor="component-model">
              <span className="text-sm font-medium">Model number</span>
              <Input
                id="component-model"
                name="model"
                placeholder="e.g. STR-AN1000"
                required
                value={draftModel}
                onChange={(event) => setDraftModel(event.target.value)}
              />
            </label>
          </DialogBody>
          <DialogActions>
            <Button
              plain
              type="button"
              onClick={() => setEditingItem(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!draftBrand.trim() || !draftModel.trim()}
            >
              Save component
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Table
        striped
        dense
        className="[--gutter:theme(spacing.6)] sm:[--gutter:theme(spacing.8)]"
      >
        <TableHead>
          <TableRow>
            <TableHeader>Component</TableHeader>
            <TableHeader>Type</TableHeader>
            <TableHeader>Selection</TableHeader>
            <TableHeader>Price paid</TableHeader>
            <TableHeader>Link</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.name}>
              <TableCell>{item.name}</TableCell>
              <TableCell>
                <Badge color={badgeColors[item.type]}>{item.type}</Badge>
              </TableCell>
              <TableCell>
                <Button
                  className="print:hidden"
                  onClick={() => openItemDialog(item)}
                >
                  <PlusIcon />
                  Add {item.name}
                  {item.quantity === "pair" ? " pair" : ""}
                  {item.quantity === "multiple" ? "s" : ""}
                </Button>
                {selections[item.name] && (
                  <div className="mt-2 space-y-2">
                    <p className="text-sm">
                      {selections[item.name].brand} {selections[item.name].model}
                    </p>
                  </div>
                )}
              </TableCell>
              <TableCell>
                {selections[item.name] ? (
                  <label className="flex items-center gap-1">
                    <span className="sr-only">
                      Price paid for {item.name}
                    </span>
                    <span aria-hidden="true">$</span>
                    <Input
                      className="print:hidden"
                      type="number"
                      min="0"
                      step="0.01"
                      inputMode="decimal"
                      placeholder="Price paid"
                      aria-label={`Price paid for ${item.name}`}
                      value={selections[item.name].pricePaid}
                      onChange={(event) =>
                        updatePricePaid(item, event.target.value)
                      }
                    />
                    <span className="hidden print:inline">
                      {selections[item.name].pricePaid.trim()
                        ? Number(
                            selections[item.name].pricePaid
                          ).toLocaleString("en-US", {
                            style: "currency",
                            currency: "USD",
                          })
                        : "—"}
                    </span>
                  </label>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell>
                {selections[item.name] ? (
                  <TextLink
                    href={`https://www.google.com/search?q=${encodeURIComponent(
                      `${selections[item.name].brand} ${selections[item.name].model}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Search Google
                  </TextLink>
                ) : (
                  <span className="text-sm text-zinc-500">—</span>
                )}
              </TableCell>
            </TableRow>
          ))}
          <TableRow className="font-semibold">
            <TableCell colSpan={3}>Total cost</TableCell>
            <TableCell>${totalCost.toFixed(2)}</TableCell>
            <TableCell />
          </TableRow>
        </TableBody>
      </Table>
    </>
  );
}

export default function BuildPage() {
  return (
    <div className="build-page max-w-6xl w-full space-y-4 md:space-y-6 lg:space-y-8">
      <h1 className="mb-4 hidden text-2xl font-bold print:block">
        Home Theater Build
      </h1>
      <div className="print:hidden">
        <SectionHeading />
      </div>
      <BuildCard />
      {/* for now we will dynamically change config based on components */}
      {/* <Configurations />  */}
      <BuildTable />
    </div>
  );
}
