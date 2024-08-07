export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Nákupní košík",
  description: "Jednoduchá aplikace pro správu seznamů",
  navItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Seznamy",
      href: "/lists",
    },
  ],
  navMenuItems: [
    {
      label: "Seznamy",
      href: "/seznamy",
    },
  ],
};
