/**
 * Marketing content.
 *
 * Static and in the bundle, not in the database, for the same reason the Week 2
 * research data is: this is writing I did, and it changes when I learn
 * something, which is a code change. Only assets the user chooses to save go to
 * Supabase.
 *
 * Spanish is the source language and English is the translation, not the other
 * way round. The buyer is a reseller in Mexico City. The English exists because
 * a real and under-served slice of this market negotiates with suppliers in
 * English and sells in Spanish, and because a page that cannot be read by half
 * its audience is a page that does not work.
 *
 * `Localized` makes a missing translation a compile error rather than a blank
 * card nobody notices until it is live.
 */

export type Lang = "es" | "en";

export type Localized = { es: string; en: string };

export const LANGS: Lang[] = ["es", "en"];

/* ---------------------------------------------------------------- persona */

export type PersonaFact = { k: Localized; v: Localized; source: Localized };

export const PERSONA = {
  name: "Marisol",
  tag: {
    es: "Revendedora independiente, Ciudad de México",
    en: "Independent reseller, Mexico City",
  } satisfies Localized,
  summary: {
    es: "38 años. Vende ropa de mujer por Instagram y cierra por WhatsApp. Entre 80 y 150 prendas en stock. Trabaja desde el celular, entre un pendiente y otro.",
    en: "38. Sells women's clothing on Instagram and closes on WhatsApp. Between 80 and 150 items in stock. Works from her phone, between other jobs.",
  } satisfies Localized,
  facts: [
    {
      k: { es: "Dónde la encuentran", en: "Where they find her" },
      v: { es: "Instagram y Facebook", en: "Instagram and Facebook" },
      source: {
        es: "Estudio de competencia, semana 2",
        en: "Competitor study, week 2",
      },
    },
    {
      k: { es: "Dónde cierra", en: "Where she closes" },
      v: { es: "WhatsApp, a mano", en: "WhatsApp, by hand" },
      source: {
        es: "~64% del comercio electrónico PyME en México pasa por WhatsApp",
        en: "~64% of Mexican small-business ecommerce runs through WhatsApp",
      },
    },
    {
      k: { es: "Pregunta más común", en: "Most common question" },
      v: { es: "¿Tienes mi talla?", en: "Do you have my size?" },
      source: {
        es: "La respuesta equivocada pierde la venta dos veces",
        en: "A wrong answer loses the sale twice",
      },
    },
    {
      k: { es: "Techo de gasto", en: "Spend ceiling" },
      v: { es: "Alrededor de $500 MXN al mes", en: "Around MXN 500 a month" },
      source: {
        es: "Leadsales cobra ~$1,450 por tres usuarios",
        en: "Leadsales charges ~MXN 1,450 for three seats",
      },
    },
  ] satisfies PersonaFact[],
};

/* ------------------------------------------------------- landing page copy */

/** Headline variants, keyed by the ids in EXPERIMENTS.headline.variants. */
export const HEADLINES: Record<string, Localized> = {
  problem: {
    es: "Tus clientas preguntan a medianoche. Tú contestas a las nueve.",
    en: "Your customers ask at midnight. You answer at nine.",
  },
  outcome: {
    es: "Contesta cada mensaje al instante, sin inventar lo que no tienes.",
    en: "Answer every message instantly, without inventing stock you don't have.",
  },
};

/** CTA label variants, keyed by EXPERIMENTS.cta.variants. */
export const CTAS: Record<string, Localized> = {
  soft: { es: "Ver cómo funciona", en: "See how it works" },
  direct: { es: "Probar el agente", en: "Try the agent" },
};

export const LANDING = {
  subhead: {
    es: "Un agente que lee tu catálogo, responde preguntas y arma el pedido. Tú confirmas antes de que exista cualquier venta.",
    en: "An agent that reads your catalog, answers questions and assembles the basket. You confirm before any order exists.",
  } satisfies Localized,
  props: [
    {
      title: { es: "Responde desde tu catálogo", en: "Answers from your catalog" },
      body: {
        es: "Nunca afirma una talla que no puede confirmar. Si no está en el catálogo, lo dice y te pasa la conversación.",
        en: "It never claims a size it cannot confirm. If it isn't in the catalog, it says so and hands the conversation to you.",
      },
    },
    {
      title: { es: "Arma el pedido", en: "Builds the basket" },
      body: {
        es: "Junta las prendas, suma el total y repite el pedido completo en cada turno, para que nadie se confunda.",
        en: "It collects the items, totals them, and restates the whole basket on every turn so nobody loses track.",
      },
    },
    {
      title: { es: "Tú confirmas", en: "You confirm" },
      body: {
        es: "Nada se convierte en pedido por su cuenta. El agente propone; la decisión sigue siendo tuya.",
        en: "Nothing becomes an order on its own. The agent proposes; the decision stays yours.",
      },
    },
  ],
  roadmapNote: {
    es: "Lo que ya funciona y lo que sigue en construcción, sin adornos.",
    en: "What works today and what is still being built, stated plainly.",
  } satisfies Localized,
};

/* ----------------------------------------------------------- social posts */

export type Channel = "Instagram" | "Facebook" | "WhatsApp" | "TikTok";
export type Stage = "awareness" | "consideration" | "decision";

export type SocialPost = {
  id: string;
  channel: Channel;
  stage: Stage;
  body: Localized;
};

export const POSTS: SocialPost[] = [
  {
    id: "p01",
    channel: "Instagram",
    stage: "awareness",
    body: {
      es: "Son las 11:40 de la noche. Llega un mensaje: \"¿tienes este vestido en mediana?\"\n\nTú ya estás dormida. Ella ya está viendo otra cuenta.\n\nNo perdiste la venta por precio. La perdiste por horario.",
      en: "It's 11:40pm. A message arrives: \"do you have this dress in medium?\"\n\nYou're already asleep. She's already looking at another account.\n\nYou didn't lose that sale on price. You lost it on hours.",
    },
  },
  {
    id: "p02",
    channel: "Instagram",
    stage: "awareness",
    body: {
      es: "La pregunta número uno en ropa no es el precio.\n\nEs \"¿tienes mi talla?\"\n\nY es la que más caro cuesta contestar mal.",
      en: "The number one question in apparel isn't price.\n\nIt's \"do you have my size?\"\n\nAnd it's the one that costs the most to get wrong.",
    },
  },
  {
    id: "p03",
    channel: "TikTok",
    stage: "awareness",
    body: {
      es: "Cosas que una revendedora hace 40 veces al día:\n\n· copiar el mismo mensaje\n· buscar la talla en una libreta\n· sumar el total a mano\n· volver a explicar el envío\n\nNinguna de las cuatro es vender.",
      en: "Things a reseller does 40 times a day:\n\n· paste the same message\n· look up a size in a notebook\n· add the total by hand\n· explain shipping again\n\nNone of those four is selling.",
    },
  },
  {
    id: "p04",
    channel: "Instagram",
    stage: "consideration",
    body: {
      es: "Un bot genérico contesta cualquier cosa con seguridad, aunque sea mentira.\n\nEste agente solo responde con lo que está en tu catálogo. Si no lo tiene, lo dice.\n\nPreferimos un \"déjame confirmarte\" a una venta que después tienes que cancelar.",
      en: "A generic bot answers anything confidently, even when it's wrong.\n\nThis agent only answers from what's in your catalog. If it isn't there, it says so.\n\nA \"let me check\" beats a sale you have to cancel afterwards.",
    },
  },
  {
    id: "p05",
    channel: "Facebook",
    stage: "consideration",
    body: {
      es: "Las herramientas que existen cobran por usuario y asumen que tienes un equipo de ventas.\n\nSi eres una persona, pagas por asientos que nunca vas a llenar.\n\nPor eso el plan de entrada cuesta $299 al mes y no $1,450.",
      en: "The tools that exist charge per seat and assume you have a sales team.\n\nIf you're one person, you pay for seats you'll never fill.\n\nThat's why the entry plan is MXN 299 a month, not 1,450.",
    },
  },
  {
    id: "p06",
    channel: "Instagram",
    stage: "consideration",
    body: {
      es: "El agente arma el pedido y te lo deja listo.\n\nTú lo revisas, lo corriges si hace falta y lo confirmas.\n\nNada sale sin que tú lo veas. Esa es la parte que no vamos a automatizar.",
      en: "The agent assembles the basket and leaves it ready.\n\nYou review it, correct it if needed, and confirm it.\n\nNothing goes out without you seeing it. That's the part we won't automate.",
    },
  },
  {
    id: "p07",
    channel: "WhatsApp",
    stage: "consideration",
    body: {
      es: "Mensaje para tu lista de difusión:\n\n\"Hola 👋 A partir de esta semana contesto más rápido, incluso de madrugada. Si preguntas por una talla, te respondo con lo que realmente tengo. Cualquier pedido sigo confirmándotelo yo.\"",
      en: "Message for your broadcast list:\n\n\"Hi 👋 From this week I reply faster, even late at night. If you ask about a size, you'll get an answer based on what I actually have. I still confirm every order myself.\"",
    },
  },
  {
    id: "p08",
    channel: "TikTok",
    stage: "decision",
    body: {
      es: "Prueba de 30 segundos:\n\nPregúntale por una talla que SÍ tienes. Te la confirma.\nPregúntale por una que NO. Te dice que no la tiene.\n\nEso es todo el producto. Lo demás es presumir.",
      en: "30-second test:\n\nAsk it for a size you DO have. It confirms it.\nAsk for one you DON'T. It tells you it doesn't have it.\n\nThat's the whole product. The rest is showing off.",
    },
  },
  {
    id: "p09",
    channel: "Instagram",
    stage: "decision",
    body: {
      es: "$299 al mes. Sin contrato, sin instalación, sin equipo de ventas.\n\nSi en el primer mes no contestas más rápido que hoy, no tiene caso que sigas.\n\nEntra y pruébalo con tu propio catálogo.",
      en: "MXN 299 a month. No contract, no installation, no sales team.\n\nIf you aren't replying faster within the first month, there's no reason to continue.\n\nGo in and try it with your own catalog.",
    },
  },
  {
    id: "p10",
    channel: "Facebook",
    stage: "decision",
    body: {
      es: "Lo que todavía NO hace, dicho antes de que lo preguntes:\n\n· no sube tu inventario solo (aún)\n· no lleva apartados (aún)\n· no se conecta a WhatsApp oficial (aún)\n\nLo que sí hace, lo hace hoy. Lo demás está en la ruta pública.",
      en: "What it does NOT do yet, said before you ask:\n\n· it doesn't import your inventory on its own (yet)\n· it doesn't track layaway (yet)\n· it isn't on the official WhatsApp API (yet)\n\nWhat it does do, it does today. The rest is on the public roadmap.",
    },
  },
];

/* ---------------------------------------------------------- video scripts */

export type Beat = { t: string; line: Localized };

export type VideoScript = {
  id: string;
  title: Localized;
  channel: Channel;
  length: string;
  beats: Beat[];
};

export const SCRIPTS: VideoScript[] = [
  {
    id: "v1",
    title: { es: "El mensaje de medianoche", en: "The midnight message" },
    channel: "Instagram",
    length: "30s",
    beats: [
      {
        t: "0:00",
        line: {
          es: "Pantalla de celular, 11:40 pm. Llega un mensaje preguntando por una talla.",
          en: "Phone screen, 11:40pm. A message arrives asking about a size.",
        },
      },
      {
        t: "0:06",
        line: {
          es: "\"Esta pregunta llega todas las noches. Y casi siempre se contesta al día siguiente.\"",
          en: "\"This question arrives every night. And it almost always gets answered the next day.\"",
        },
      },
      {
        t: "0:14",
        line: {
          es: "Corte: el agente responde en segundos, con la talla que sí existe en el catálogo.",
          en: "Cut: the agent replies in seconds, with the size that actually exists in the catalog.",
        },
      },
      {
        t: "0:22",
        line: {
          es: "\"No inventa. Solo contesta lo que tienes.\" Cierre con el nombre y el precio.",
          en: "\"It doesn't invent. It only answers from what you have.\" End on the name and price.",
        },
      },
    ],
  },
  {
    id: "v2",
    title: { es: "Qué pasa cuando no lo tienes", en: "What happens when you don't have it" },
    channel: "TikTok",
    length: "45s",
    beats: [
      {
        t: "0:00",
        line: {
          es: "\"Lo importante de un agente de ventas no es lo que contesta. Es lo que se niega a contestar.\"",
          en: "\"The important thing about a sales agent isn't what it answers. It's what it refuses to answer.\"",
        },
      },
      {
        t: "0:08",
        line: {
          es: "En pantalla: se pregunta por una talla que no está en el catálogo.",
          en: "On screen: ask for a size that isn't in the catalog.",
        },
      },
      {
        t: "0:18",
        line: {
          es: "El agente dice que no la tiene y ofrece pasar la conversación a la vendedora.",
          en: "The agent says it doesn't have it and offers to hand the conversation over.",
        },
      },
      {
        t: "0:30",
        line: {
          es: "\"Un bot que adivina te hace cancelar ventas. Eso cuesta más que no contestar.\"",
          en: "\"A bot that guesses makes you cancel sales. That costs more than not replying.\"",
        },
      },
      {
        t: "0:40",
        line: { es: "Cierre: precio y liga.", en: "End on price and link." },
      },
    ],
  },
  {
    id: "v3",
    title: { es: "Tú confirmas, siempre", en: "You confirm, always" },
    channel: "Instagram",
    length: "60s",
    beats: [
      {
        t: "0:00",
        line: {
          es: "\"La pregunta que todas me hacen: ¿y si manda un pedido mal?\"",
            en: "\"The question everyone asks me: what if it sends a wrong order?\"",
        },
      },
      {
        t: "0:10",
        line: {
          es: "Mostrar la conversación completa: el agente arma el pedido y se detiene.",
          en: "Show the full conversation: the agent builds the basket and stops.",
        },
      },
      {
        t: "0:25",
        line: {
          es: "\"No puede. El pedido queda esperando tu confirmación. Literalmente no existe hasta que tú le das aceptar.\"",
          en: "\"It can't. The order sits waiting for your confirmation. It literally doesn't exist until you accept it.\"",
        },
      },
      {
        t: "0:40",
        line: {
          es: "Mostrar la pantalla de revisión, editar una cantidad, confirmar.",
          en: "Show the review screen, edit a quantity, confirm.",
        },
      },
      {
        t: "0:52",
        line: {
          es: "\"Automatizamos las respuestas. No automatizamos tu criterio.\"",
          en: "\"We automate the replies. We don't automate your judgment.\"",
        },
      },
    ],
  },
];

/* -------------------------------------------------------- campaign calendar */

export type CalendarDay = {
  day: number;
  channel: Channel;
  /** Which asset above runs that day. */
  asset: string;
  note: Localized;
};

export const CALENDAR: CalendarDay[] = [
  { day: 1, channel: "Instagram", asset: "p01", note: { es: "Abrir con el problema, no con el producto.", en: "Open on the problem, not the product." } },
  { day: 2, channel: "WhatsApp", asset: "p07", note: { es: "Avisar a la lista que ya existe.", en: "Tell the list it exists." } },
  { day: 3, channel: "TikTok", asset: "v1", note: { es: "Primer video. Medir vistas completas.", en: "First video. Watch completion rate." } },
  { day: 4, channel: "Instagram", asset: "p02", note: { es: "Reforzar la pregunta de la talla.", en: "Reinforce the size question." } },
  { day: 5, channel: "Facebook", asset: "p05", note: { es: "Precio frente a la competencia.", en: "Price against the competition." } },
  { day: 6, channel: "Instagram", asset: "p04", note: { es: "Diferencia contra un bot genérico.", en: "Difference from a generic bot." } },
  { day: 7, channel: "TikTok", asset: "p03", note: { es: "Formato lista, bajo esfuerzo.", en: "List format, low effort." } },
  { day: 8, channel: "Instagram", asset: "v2", note: { es: "El video que explica el rechazo.", en: "The video about refusing to answer." } },
  { day: 9, channel: "Instagram", asset: "p06", note: { es: "La confirmación humana como argumento.", en: "Human confirmation as the argument." } },
  { day: 10, channel: "Facebook", asset: "p10", note: { es: "Decir qué no hace, antes que lo pregunten.", en: "Say what it doesn't do, before they ask." } },
  { day: 11, channel: "Instagram", asset: "v3", note: { es: "Video largo, para quien ya dudó.", en: "Long video, for anyone already hesitating." } },
  { day: 12, channel: "TikTok", asset: "p08", note: { es: "La prueba de 30 segundos.", en: "The 30-second test." } },
  { day: 13, channel: "Instagram", asset: "p09", note: { es: "Precio y llamada directa.", en: "Price and a direct ask." } },
  { day: 14, channel: "WhatsApp", asset: "p07", note: { es: "Reenviar a quien no contestó. Revisar resultados A/B.", en: "Resend to non-responders. Review the A/B results." } },
];

/* --------------------------------------------------------------- helpers */

export function t(value: Localized, lang: Lang): string {
  return value[lang];
}

export const STAGE_LABEL: Record<Stage, Localized> = {
  awareness: { es: "Descubrimiento", en: "Awareness" },
  consideration: { es: "Consideración", en: "Consideration" },
  decision: { es: "Decisión", en: "Decision" },
};
