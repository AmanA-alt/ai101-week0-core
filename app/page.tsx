import LandingClient from "@/components/LandingClient";

export const metadata = {
  title: "Bastilla — responde cada mensaje sin inventar tu inventario",
  description:
    "Un agente de IA que lee tu catálogo, responde preguntas y arma el pedido. Tú confirmas antes de que exista cualquier venta.",
};

export default function Home() {
  return <LandingClient />;
}
