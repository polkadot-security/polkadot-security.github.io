// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import 'dotenv/config';

const serverUrl = process.env.SERVER_URL || 'https://polkadot-security.parity.io';

/** @type {import('@docusaurus/types').Config} */
const config = {
  favicon: "img/favicon.ico",
  title: "Polkadot Security Hub",
  tagline: "Polkadot Security Hub",
  titleDelimiter: "·",
  url: "https://polkadot-security.github.io", // FIXME
  baseUrl: "/",
  projectName: "hub",
  organizationName: "polkadot-security",
  deploymentBranch: "gh-pages",
  trailingSlash: false,
  markdown: {
    mermaid: true,
  },
  customFields: {
    // Put your custom environment here
    serverUrl,
  },
  themes: ["@docusaurus/theme-mermaid"],
  onBrokenLinks: "ignore",
  onBrokenMarkdownLinks: "warn",
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },
  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          editUrl: ({ docPath }) =>
            `https://github.com/polkadot-security/hub/edit/main/docs/${docPath}`,
          sidebarPath: "./sidebars.js",
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
        },
        theme: {
          customCss: [
            "./static/css/custom.css",
            "./static/css/copycode.css",
            "./static/css/socicon.css",
          ],
        },
        blog: {
          showReadingTime: true,
          editUrl: ({ blogPath }) =>
            `https://github.com/polkadot-security/hub/edit/main/blogs/${blogPath}`,
        },
      }),
    ],
  ],
  scripts: [
    'https://apisa.parity.io/latest.js'
  ],
  themeConfig: {
    image: "img/favicon.ico",
    navbar: {
      title: "Security",
      logo: {
        alt: "Polkadot Security Hub Logo",
        src: "img/Polkadot_Logo_Horizontal_Pink-Black.svg",
      },
      items: [
        {
          to: "docs/identify",
          sidebarId: "protectSidebar",
          position: "right",
          label: "Identify",
        },
        {
          to: "docs/detect",
          position: "right",
          label: "Detect",
        },
        {
          to: "docs/protect",
          sidebarId: "protectSidebar",
          position: "right",
          label: "Protect",
        },
        {
          type: "search",
          position: "right",
        },
        { to: "/blog", label: "Blog", position: "right" },
        {
          href: "https://github.com/polkadot-security/hub",
          label: "GitHub",
          position: "right",
        },
        {
          href: `${serverUrl}/login`,
          id: "login",
          label: "Login",
          position: "right",
          class: `${!serverUrl ? "hidden" : ""}`,
        },
      ],
    },
    footer: {
      copyright: `Copyright © ${new Date().getFullYear()} Parity Technologies`,
    },
    colorMode: {
      respectPrefersColorScheme: true,
    },
    prism: {
      additionalLanguages: ["rust"],
      theme: require("prism-react-renderer").themes.github,
    },
    liveCodeBlock: {
      playgroundPosition: "bottom",
    },
  },
};

export default config;
