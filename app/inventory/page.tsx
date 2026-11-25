import type { Metadata } from "next";
import InventoryClient from "@/components/InventoryClient";

export const metadata: Metadata = {
  title: "Your inventory — Bastilla",
  description: "Load your stock sheet or type it in. It is saved only on this device and never sent anywhere.",
};

export default function InventoryPage() {
  return <InventoryClient />;
}
