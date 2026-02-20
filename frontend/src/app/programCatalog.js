export const PROGRAM_NAV_ITEMS = [
  {
    label: "Women Empowerment",
    title: "Women empowerment program (wezesha dada initiative)",
    slug: "women-empowerment-program-wezesha-dada-initiative",
  },
  {
    label: "Youth Empowerment",
    title: "Youth empowerment program",
    slug: "youth-empowerment-program",
  },
  {
    label: "School Mentorship",
    title: "School mentorship programmes",
    slug: "school-mentorship-programmes",
  },
  {
    label: "Community Outreach",
    title: "Community outreach programme",
    slug: "community-outreach-programme",
  },
  {
    label: "Naturing Talent",
    title: "Naturing talent",
    slug: "naturing-talent",
  },
];

export function getProgramPath(program) {
  const idOrSlug = program?.slug || program?.id;
  return idOrSlug ? `/programs/${idOrSlug}` : "/programs";
}

