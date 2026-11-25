import type { Metadata } from "next";
import ChatClient from "@/components/ChatClient";

export const metadata: Metadata = {
  title: "Ask the catalog — Bastilla",
  description:
    "A guided assistant that answers only from the catalog and hands you to a person when it cannot.",
};

/**
 * Thin server wrapper so the page carries real metadata, with the body in the
 * browser because the whole page is conversation state. Same split as the
 * homepage.
 */
export default function ChatPage() {
  return <ChatClient />;
}
