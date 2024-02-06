import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

const config: Config = {
  title: 'Axiom V2 Developer Docs',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://docs.axiom.xyz',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        blog: false,
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          editUrl:
            'https://github.com/axiom-crypto/axiom-docs/tree/main/',
          remarkPlugins: [
            remarkMath,             
            [require('@docusaurus/remark-plugin-npm2yarn'), {sync: true}
          ],
        ],
          rehypePlugins: [rehypeKatex],
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],
  stylesheets: [
    {
      href: 'https://cdn.jsdelivr.net/npm/katex@0.13.24/dist/katex.min.css',
      type: 'text/css',
      integrity:
        'sha384-odtC+0UGzzFL/6PNoE8rX/SPcQDXBJ+uRepguP4QkPCm2LBxH3FA3y+fKSiJ+AmM',
      crossorigin: 'anonymous',
    },
  ],
  themeConfig: {
    // TODO: add social card
    image: 'img/axiom-social-card.png',
    navbar: {
      title: 'Axiom V2',
      logo: {
        alt: 'Axiom Logo',
        src: 'img/axiom-logo.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          type: 'docSidebar',
          sidebarId: 'sdkSidebar',
          position: 'left',
          label: 'SDK',
        },
        {
          type: 'docSidebar',
          sidebarId: 'protocolSidebar',
          position: 'left',
          label: 'Protocol',
        },
//        {
//          type: 'docSidebar',
//          sidebarId: 'examplesSidebar',
//          position: 'left',
//         label: 'Examples',
//        },        
        {
          href: 'https://github.com/axiom-crypto',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    algolia: {
      appId: '1GK3YLZJDP',
      apiKey: 'fb7b90854a919921a4ea4813c44aa6c4',
      indexName: 'axiom',
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Build with Axiom',
          items: [
            {
              label: 'Github',
              href: 'https://github.com/axiom-crypto',
            },    
            {
              label: 'AxiomREPL',
              to: 'https://repl.axiom.xyz',
            },               
            {
              label: 'Axiom Explorer',
              to: 'https://explorer.axiom.xyz',
            },    
            {
              label: 'Axiom V1 Docs',
              href: 'https://docs-v1.axiom.xyz/',
            },    
          ],
        },
        {
          title: 'Learn More',
          items: [
            {
              label: 'Website',
              to: 'https://axiom.xyz',
            },
            {
              label: 'Blog',
              to: 'https://blog.axiom.xyz',
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/axiom_xyz',
            },
            {
              label: 'Telegram',
              href: 'https://t.me/axiom_discuss',
            },
            {
              label: 'Discord',
              href: 'https://discord.gg/4nDgMUq7Ra',
            },
          ],
        },
      ]
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'solidity', "typescript", "json", "javascript", "toml"],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
