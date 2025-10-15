import {themes as prismThemes} from 'prism-react-renderer';


/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Mat Ice Hub',
  tagline: 'What is this?',
  favicon: 'img/fleur.svg',
    
  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://matice.ca',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          routeBasePath: "/",
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  headTags: [
    {
      tagName: 'script',
      attributes: {
        type: 'application/ld+json',
      },
      innerHTML: JSON.stringify({
        '@context': 'https://matice.ca/',
        '@type': 'Mat Ice Hub',
        name: 'Mat Ice Hub',
        url: 'https://www.matice.ca/',
        logo: 'https://matice.ca/img/fleur.svg',
        description: "The Mat Ice Hub"
      }),
    },
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      metadata: [
        { name: 'keywords', content: 'documentation, tech, unifi, scripting, powershell' },
        { property: 'og:url', content: 'https://matice.ca' },
        { name: 'description', content: 'The Mat Ice Hub, a collection of my scripts, tutorials and whatever crosses my mind at that moment.' },
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: 'Mat Ice Hub' },
        { property: 'og:description', content: 'The Mat Ice Hub, a collection of my scripts, tutorials and whatever crosses my mind at that moment.' },
        { property: 'og:image', content: 'https://matice.ca/img/mat_ice.png' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { property: 'twitter:domain', content: 'matice.ca' },
        { property: 'twitter:url', content: 'https://matice.ca' },
        { name: 'twitter:title', content: 'Mat Ice Hub' },
        { name: 'twitter:description', content: 'The Mat Ice Hub, a collection of my scripts, tutorials and whatever crosses my mind at that moment.' },
        { name: 'twitter:image', content: 'https://matice.ca/img/mat_ice.png' },
      ],
      
      docs: {
        sidebar: {
          hideable: true,
        }
      },
      navbar: {
        title: 'Mat Ice Hub',
        
        items: [
          {
            type: "doc",
            docId: "scripting/scripting",
            position: "left",
            label: "Scripting",
          },
          

          {
            type: "doc",
            docId: "implementations/implementations",
            position: "left",
            label: "Implementations",
          },

          {
            type: "doc",
            docId: "general/general",
            position: "left",
            label: "General Documentation",
          },

          {
            type: "doc",
            docId: "myservers/myservers",
            position: "left",
            label: "My Servers",
          },

          {
            type: "doc",
            docId: "intrests/intrests",
            position: "left",
            label: "Intrests",
          },

          {
            type: "doc",
            docId: "cooking/cooking",
            position: "right",
            label: "Cooking",
          },
          {
            href: 'https://github.com/Mat-Ice-QC',
            label: 'GitHub',
            position: 'right',
          },

          

        ],
      },
      footer: {
        style: 'dark',
        copyright: ` <a href="https://www.gnu.org/licenses/agpl-3.0.txt">AGPL-3.0</a> Mat Ice Hub, Built with <a href="https://docusaurus.io/">Docusaurus</a>.`,
      },
      prism: {
        theme: prismThemes.coy,
        darkTheme: prismThemes.twilight,
        additionalLanguages: ['powershell','bash'],
      },
    }),
};

export default config;