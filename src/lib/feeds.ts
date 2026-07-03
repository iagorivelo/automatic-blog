export type Category = {
  slug: string;
  label: string;
  feeds: { name: string; url: string }[];
};

export const CATEGORIES: Category[] = [
  {
    slug: "tecnologia",
    label: "Tecnologia",
    feeds: [
      { name: "G1 Tecnologia", url: "https://g1.globo.com/rss/g1/tecnologia/" },
      { name: "Tecmundo", url: "https://rss.tecmundo.com.br/feed" },
      { name: "Canaltech", url: "https://canaltech.com.br/rss/" },
    ],
  },
  {
    slug: "economia",
    label: "Economia",
    feeds: [
      { name: "G1 Economia", url: "https://g1.globo.com/rss/g1/economia/" },
      { name: "InfoMoney", url: "https://www.infomoney.com.br/feed/" },
    ],
  },
  {
    slug: "ciencia-e-saude",
    label: "Ciência e Saúde",
    feeds: [
      {
        name: "G1 Ciência e Saúde",
        url: "https://g1.globo.com/rss/g1/ciencia-e-saude/",
      },
    ],
  },
  {
    slug: "entretenimento",
    label: "Entretenimento",
    feeds: [
      { name: "G1 Pop & Arte", url: "https://g1.globo.com/rss/g1/pop-arte/" },
    ],
  },
  {
    slug: "mundo",
    label: "Mundo",
    feeds: [{ name: "G1 Mundo", url: "https://g1.globo.com/rss/g1/mundo/" }],
  },
  {
    slug: "politica",
    label: "Política",
    feeds: [
      { name: "G1 Política", url: "https://g1.globo.com/rss/g1/politica/" },
    ],
  },
];

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}
