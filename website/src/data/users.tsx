/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {translate} from '@docusaurus/Translate';
import {sortBy} from '@site/src/utils/jsUtils';
import type {Props as IdealImageProps} from '@theme/IdealImage';

/*
 * ADD YOUR SITE TO THE DOCUSAURUS SHOWCASE
 *
 * Please don't submit a PR yourself: use the Github Discussion instead:
 * https://github.com/facebook/docusaurus/discussions/7826
 *
 * Instructions for maintainers:
 * - Add the site in the json array below
 * - `title` is the project's name (no need for the "Docs" suffix)
 * - A short (≤120 characters) description of the project
 * - Use relevant tags to categorize the site (read the tag descriptions on the
 *   https://docusaurus.io/showcase page and some further clarifications below)
 * - Add a local image preview (decent screenshot of the Docusaurus site)
 * - The image MUST be added to the GitHub repository, and use `require("img")`
 * - The image has to have minimum width 640 and an aspect of no wider than 2:1
 * - If a website is open-source, add a source link. The link should open
 *   to a directory containing the `docusaurus.config.js` file
 * - Resize images: node admin/scripts/resizeImage.js
 * - Run optimizt manually (see resize image script comment)
 * - Open a PR and check for reported CI errors
 *
 * Example PR: https://github.com/facebook/docusaurus/pull/7620
 */

// LIST OF AVAILABLE TAGS
// Available tags to assign to a showcase site
// Please choose all tags that you think might apply.
// We'll remove inappropriate tags, but it's less likely that we add tags.
export type TagType =
  // DO NOT USE THIS TAG: we choose sites to add to favorites
  | 'favorite'
  // For open-source sites, a link to the source code is required.
  // The source should be the *website's* source, not the project's source!
  | 'opensource'
  | 'product'
  // Feel free to add the 'design' tag as long as there's _some_ level of
  // CSS/swizzling.
  | 'design'
  // Site must have more than one locale.
  | 'i18n'
  | 'versioning'
  // Large sites are defined as those with > 200 pages, excluding versions.
  | 'large'
  | 'meta'
  | 'personal'
  // Right-to-left direction.
  | 'rtl';

// Add sites to this list
// prettier-ignore
const Users: User[] = [
  {
    title: 'AI-Speaker',
    description: 'Local, reliable, fast and private Audio and IoT gate.',
    preview: require('./showcase/aispeaker.png'),
    website: 'https://ai-speaker.com/',
    source: 'https://github.com/sviete/AIS-WWW',
    tags: ['opensource'],
  },
  {
    title: "Akara's blog",
    description: 'Personal frontend blog for learning',
    preview: require('./showcase/akara-blog.png'),
    website: 'https://messiahhh.github.io/blog/',
    source: 'https://github.com/messiahhh/blog',
    tags: ['opensource', 'personal'],
  },
  {
    title: 'Algolia DocSearch',
    description:
      'The best search experience for docs, integrates in minutes, for free',
    preview: require('./showcase/algolia.png'),
    website: 'https://docsearch.algolia.com/',
    source: 'https://github.com/algolia/docsearch/tree/main/packages/website',
    tags: ['favorite', 'opensource', 'product'],
  },
  {
    title: 'Apache APISIX',
    description:
      'A Dynamic, Real-Time, High-Performance Cloud-Native API Gateway',
    preview: require('./showcase/apache-apisix.png'),
    website: 'https://apisix.apache.org/',
    source: 'https://github.com/apache/apisix-website',
    tags: ['opensource', 'i18n', 'large'],
  },
  {
    title: 'Apex FP',
    description: 'Functional programming library for Salesforce Apex',
    preview: require('./showcase/apexfp.png'),
    website: 'https://www.apexfp.org',
    source: 'https://github.com/ipavlic/apex-fp/tree/master/website',
    tags: ['opensource'],
  },
  {
    title: 'Astronomer',
    description:
      'Enterprise-grade framework for Apache Airflow. Production-ready Airflow environments with just a few clicks',
    preview: require('./showcase/astronomer.png'),
    website: 'https://docs.astronomer.io',
    source: 'https://github.com/astronomer/docs',
    tags: ['product', 'versioning', 'opensource'],
  },
  {
    title: 'AvN Gateway',
    description:
      'The AvN Gateway API is the fastest way to interact with the Aventus Network Blockchain.',
    preview: require('./showcase/aventus.png'),
    website: 'https://aventus-network-services.github.io/avn-gateway-docs/',
    source: null,
    tags: ['versioning', 'product'],
  },
  {
    title: 'Awe framework',
    description:
      'Awe framework, Build light-weight and functional websites quickly',
    preview: require('./showcase/awe-framework.png'),
    website: 'https://docs.aweframework.com/',
    source: 'https://gitlab.com/aweframework/awe/-/tree/develop/website',
    tags: ['opensource', 'i18n', 'versioning'],
  },
  {
    title: 'Bandwidth',
    description:
      'Add powerful communications capabilities to your app from the only API platform with it’s own tier-1 carrier network.',
    preview: require('./showcase/bandwidth.png'),
    website: 'https://dev.bandwidth.com/',
    source: 'https://github.com/Bandwidth/api-docs',
    tags: ['opensource', 'large', 'product'],
  },
  {
    title: 'johnnyreilly.com',
    description: 'The blog of John Reilly ❤️🌻',
    preview: require('./showcase/johnnyreilly.png'),
    website: 'https://johnnyreilly.com/',
    source: 'https://github.com/johnnyreilly/blog.johnnyreilly.com',
    tags: ['opensource', 'personal', 'large'],
  },
  {
    title: 'Blog Matheus Brunelli',
    description:
      'Desenvolvimento de software, carreira, dicas de livros e muito JavaScript!',
    preview: require('./showcase/blogmatheusbrunelli.png'),
    website: 'https://mrbrunelli.github.io/blog/',
    source: 'https://github.com/mrbrunelli/blog',
    tags: ['opensource', 'personal'],
  },
  {
    title: 'Blogasaurus',
    description: 'A blog written using Docusaurus.',
    preview: require('./showcase/blogasaurus.png'),
    website: 'https://blog.palashsh.me/',
    source: 'https://github.com/BattleOfPlassey/blogasaurus',
    tags: ['personal', 'opensource'],
  },
  {
    title: 'Botonic',
    description: 'Build Chatbots and Conversational Apps Using React',
    preview: require('./showcase/botonic.png'),
    website: 'https://botonic.io/',
    source: 'https://github.com/hubtype/botonic/tree/master/docs/website',
    tags: ['opensource'],
  },
  {
    title: 'BoxyHQ',
    description: 'Enterprise Readiness made simple',
    preview: require('./showcase/boxyhq.png'),
    website: 'https://boxyhq.com/',
    source: 'https://github.com/boxyhq/website',
    tags: ['opensource'],
  },
  {
    title: 'Brainboard IDE',
    description: 'The new way to operate & manage your Cloud: visually.',
    preview: require('./showcase/brainboard.png'),
    website: 'https://docs.brainboard.co/start/cloud-use-cases',
    source: null,
    tags: ['product', 'design'],
  },
  {
    title: "Bruce's Wiki",
    description: 'A personal wiki by Bruce Song',
    preview: require('./showcase/bruce-wiki.png'),
    website: 'https://wiki.brucesong.xyz/',
    source: 'https://github.com/recallwei/wiki',
    tags: ['opensource', 'design', 'personal'],
  },
  {
    title: 'Build Tracker',
    description:
      'Track performance budgets & prevent unexpected bloat in your app',
    preview: require('./showcase/build-tracker.png'),
    website: 'https://buildtracker.dev',
    source: 'https://github.com/paularmstrong/build-tracker/tree/main/docs',
    tags: ['opensource'],
  },
  {
    title: 'Chaos Mesh',
    description: 'A Powerful Chaos Engineering Platform for Kubernetes.',
    preview: require('./showcase/chaos-mesh.png'),
    website: 'https://chaos-mesh.org',
    source: 'https://github.com/chaos-mesh/website',
    tags: ['opensource', 'product', 'i18n'],
  },
  {
    title: 'ChatKitty',
    description: 'A full suite of developer tools for any chat use-case.',
    preview: require('./showcase/chatkitty.png'),
    website: 'https://chatkitty.com',
    source: null,
    tags: ['product'],
  },
  {
    title: 'ClarityChallenge',
    description:
      'Documentation for the Clarity machine learning challenges for improving hearing aid signal processing',
    preview: require('./showcase/claritychallenge.png'),
    website: 'https://claritychallenge.github.io/clarity_CEC1_doc',
    source: 'https://github.com/claritychallenge/clarity_CEC1_doc',
    tags: ['opensource'],
  },
  {
    title: 'Clutch',
    description: 'An extensible API and UI platform for infrastructure tooling',
    preview: require('./showcase/clutch.png'),
    website: 'https://clutch.sh/',
    source: 'https://github.com/lyft/clutch/tree/main/docs/_website',
    tags: ['opensource'],
  },
  {
    title: 'Component Kit',
    description: 'A declarative UI framework for iOS',
    preview: require('./showcase/componentkit.png'),
    website: 'https://componentkit.org',
    source: null,
    tags: ['meta'],
  },
  {
    title: 'ConfigCat Feature Flags',
    description: 'A feature flag and remote configuration service.',
    preview: require('./showcase/configcat.png'),
    website: 'https://configcat.com/docs/',
    source: 'https://github.com/configcat/docs',
    tags: ['opensource', 'product'],
  },
  {
    title: 'Console Table',
    description: 'Printing Pretty Tables on your console.',
    preview: require('./showcase/console-table.png'),
    website: 'https://console-table.netlify.app/',
    source: 'https://github.com/ayonious/console-table-docu',
    tags: ['opensource'],
  },
  {
    title: 'Country State City API',
    description:
      'Get simplified countries, states & cities data without bloating up your database.',
    preview: require('./showcase/countrystatecity.png'),
    website: 'https://countrystatecity.in/',
    source: 'https://github.com/dr5hn/csc-website',
    tags: ['opensource', 'product'],
  },
  {
    title: 'Create React App',
    description: 'Set up a modern web app by running one command',
    preview: require('./showcase/create-react-app.png'),
    website: 'https://facebook.github.io/create-react-app/',
    source:
      'https://github.com/facebook/create-react-app/tree/main/docusaurus/website',
    tags: ['opensource', 'meta'],
  },
  {
    title: 'Daily Digest - COVID-19 IN FRANCE',
    description:
      'A website that presents daily COVID-19 statistics and news in France in the form of a daily digest.',
    preview: require('./showcase/daily-digest-covid-19-in-france.png'),
    website: 'https://covid-fr.misterfishup.com/en/',
    source: 'https://github.com/MisterFISHUP/covid-19-in-france',
    tags: ['opensource', 'i18n', 'large'],
  },
  {
    title: 'Dart Code Metrics',
    description:
      'Static analysis tool that helps analyse and improve Dart code quality.',
    preview: require('./showcase/dart-code-metrics.png'),
    website: 'https://dartcodemetrics.dev/',
    source: 'https://github.com/dart-code-checker/dart-code-metrics',
    tags: ['opensource'],
  },
  {
    title: 'Datagit',
    description:
      'A Persian tutorial website strives to make quality education for everyone.',
    preview: require('./showcase/datagit.png'),
    website: 'https://datagit.ir/',
    source: 'https://github.com/massoudmaboudi/datagit',
    tags: ['opensource', 'favorite', 'rtl'],
  },
  {
    title: 'DevSpace',
    description: 'Deploy & Develop Kubernetes Apps',
    preview: require('./showcase/devspace.png'),
    website: 'https://devspace.sh/cli/docs/',
    source: 'https://github.com/loft-sh/devspace/tree/master/docs',
    tags: ['opensource'],
  },
  {
    title: 'difranca | Tech-Notes',
    description:
      'This documentation aims to comprise my learning notes on various tech subjects.',
    preview: require('./showcase/difranca-technotes.png'),
    website: 'https://difranca.github.io/',
    source: 'https://github.com/difranca/difranca.github.io',
    tags: ['opensource', 'personal'],
  },
  {
    title: 'Digital Support Services Notes',
    description: 'Open source documented notes for Digital Support Services.',
    preview: require('./showcase/digitalsupportservices.png'),
    website: 'https://notes.nayanpatel.net',
    source: 'https://github.com/PatelN123/Digital-Support-Notes',
    tags: ['opensource', 'design', 'personal'],
  },
  {
    title: 'Discord Resources',
    description: 'All Discord resources in one place',
    preview: require('./showcase/discordresources.png'),
    website: 'https://discordresources.com/',
    source: 'https://github.com/Discord-Resources-Wiki/Discord-Resources-Wiki',
    tags: ['opensource'],
  },
  {
    title: 'Divine Web Service Framework',
    description: 'A divine collection of awesome web-related Node.js modules',
    preview: require('./showcase/divine-wsf.png'),
    website: 'https://divine-software.github.io/WSF/',
    source: 'https://github.com/Divine-Software/WSF/tree/master/website',
    tags: ['opensource'],
  },
  {
    title: 'Djamaile Rahamat',
    description: 'Djamaile Rahamat Blog on making cool stuff',
    preview: require('./showcase/djamaile.png'),
    website: 'https://djamaile.dev/',
    source: 'https://github.com/djamaile/portfolio',
    tags: ['opensource', 'personal'],
  },
  {
    title: 'Draft.js',
    description: 'Rich Text Editor Framework for React',
    preview: require('./showcase/draftjs.png'),
    website: 'https://draftjs.org/',
    source: 'https://github.com/facebook/draft-js/tree/main/website',
    tags: ['opensource', 'meta'],
  },
  {
    title: 'Drayman',
    description: 'Server-side component framework',
    preview: require('./showcase/drayman.png'),
    website: 'https://drayman.io/',
    source: 'https://github.com/Claviz/drayman/tree/main/docs',
    tags: ['opensource'],
  },
  {
    title: 'Dyte',
    description: 'The most developer friendly live video SDK',
    preview: require('./showcase/dyte.png'),
    website: 'https://docs.dyte.io',
    source: 'https://github.com/dyte-in/docs',
    tags: [
      'favorite',
      'product',
      'design',
      'versioning',
      'large',
      'opensource',
    ],
  },
  {
    title: 'easy-dates',
    description: 'JavaScript dates library',
    preview: require('./showcase/easy-dates.png'),
    website: 'https://easy-dates.dev',
    source: 'https://github.com/sandypockets/easy-dates/tree/main/docs',
    tags: ['opensource'],
  },
  {
    title: 'Easypanel',
    description: 'Server control panel based on Docker',
    preview: require('./showcase/easypanel.png'),
    website: 'https://easypanel.io',
    source: null,
    tags: ['product'],
  },
  {
    title: 'Eightshift',
    description:
      'All the tools you need to start building a modern WordPress project, using all the latest development tools.',
    preview: require('./showcase/eightshift-docs.png'),
    website: 'https://infinum.github.io/eightshift-docs/',
    source: 'https://github.com/infinum/eightshift-docs',
    tags: ['opensource', 'favorite', 'design'],
  },
  {
    title: 'Enarx',
    description:
      'Open source framework for running applications in TEEs (Trusted Execution Environments) based on WebAssembly.',
    preview: require('./showcase/enarx.png'),
    website: 'https://enarx.dev/',
    source: 'https://github.com/enarx/enarx.github.io',
    tags: ['opensource'],
  },
  {
    title: 'Eta',
    description: 'Faster embedded JS template engine in TypeScript',
    preview: require('./showcase/eta.png'),
    website: 'https://eta.js.org/',
    source: 'https://github.com/eta-dev/eta-docs',
    tags: ['opensource'],
  },
  {
    title: 'EverShop',
    description: 'An open-source e-commerce platform with Node and React',
    preview: require('./showcase/evershop.png'),
    website: 'https://evershop.io/',
    source: 'https://github.com/evershopcommerce/docs',
    tags: ['opensource', 'product'],
  },
  {
    title: 'FAST',
    description: 'The adaptive interface system for modern web experiences.',
    preview: require('./showcase/fast.png'),
    website: 'https://www.fast.design/docs/introduction/',
    source: 'https://github.com/microsoft/fast/tree/master/sites/website',
    tags: ['opensource', 'product'],
  },
  {
    title: 'FBT',
    description: 'An internationalization framework',
    preview: require('./showcase/fbt.png'),
    website: 'https://facebookincubator.github.io/fbt/',
    source: 'https://github.com/facebook/fbt/tree/main/website',
    tags: ['opensource', 'meta'],
  },
  {
    title: 'Fenghua Frontend Developer',
    description: 'Blogs and videos about frontend development',
    preview: require('./showcase/zxuqian.png'),
    website: 'https://zxuqian.cn',
    source: null,
    tags: ['personal', 'design'],
  },
  {
    title: 'Files Gallery',
    description:
      'Single-file PHP app that can be dropped into any folder, instantly creating a gallery of files and folders.',
    preview: require('./showcase/files-gallery.png'),
    website: 'https://www.files.gallery/',
    source: null,
    tags: ['product', 'design'],
  },
  {
    title: 'FireCMS',
    description: 'Firebase/Firestore based headless CMS',
    preview: require('./showcase/firecms.png'),
    website: 'https://firecms.co',
    source: 'https://github.com/Camberi/firecms/tree/master/website',
    tags: ['opensource', 'design'],
  },
  {
    title: 'FirelordJS',
    description: 'TypeScript Wrapper for Firestore',
    preview: require('./showcase/firelordjs.png'),
    website: 'https://firelordjs.com',
    source: 'https://github.com/tylim88/FirelordJSDoc',
    tags: ['opensource'],
  },
  {
    title: 'Flagsmith',
    description: 'Open Source Feature Flag and Remote Config Service',
    preview: require('./showcase/flagsmith.png'),
    website: 'https://docs.flagsmith.com',
    source: 'https://github.com/Flagsmith/flagsmith-docs',
    tags: ['opensource'],
  },
  {
    title: 'Flarum',
    description: 'Forums made simple. Modern, fast, and free!',
    preview: require('./showcase/flarum.png'),
    website: 'https://docs.flarum.org',
    source: 'https://github.com/flarum/docs',
    tags: ['opensource'],
  },
  {
    title: 'FlatifyCSS',
    description:
      'Modern flat design framework for the web — inspired by Duolingo design system.',
    preview: require('./showcase/flatifycss.png'),
    website: 'https://flatifycss.com',
    source: 'https://github.com/amir2mi/flatifycss/tree/master/website',
    tags: ['opensource', 'design'],
  },
  {
    title: 'FlexIt Analytics',
    description: 'Business Intelligence and Data Analytics platform',
    preview: require('./showcase/flexit.png'),
    website: 'https://learn.flexitanalytics.com/',
    source: 'https://github.com/ataft/flexit-docs',
    tags: ['opensource', 'product'],
  },
  {
    title: 'Flipper',
    description: 'Extensible mobile app debugger',
    preview: require('./showcase/flipper.png'),
    website: 'https://fbflipper.com',
    source: 'https://github.com/facebook/flipper/tree/main/website',
    tags: ['opensource', 'design', 'meta'],
  },
  {
    title: 'FoalTS',
    description: 'Node.JS framework for building web applications',
    preview: require('./showcase/foal.png'),
    website: 'https://foalts.org/',
    source: 'https://github.com/FoalTS/foal/tree/master/docs',
    tags: ['opensource', 'design', 'versioning', 'i18n'],
  },
  {
    title: 'FormatJS',
    description: 'Internationalize your web apps on the client & server.',
    preview: require('./showcase/formatjs.png'),
    website: 'https://formatjs.io/',
    source: 'https://github.com/formatjs/formatjs/tree/main/website',
    tags: ['opensource'],
  },
  {
    title: 'Froggit',
    description: 'French software factory based entirely on Free Software.',
    preview: require('./showcase/froggit.png'),
    website: 'https://www.froggit.fr/',
    source: 'https://lab.frogg.it/froggit/www/froggit.fr',
    tags: ['opensource', 'product'],
  },
  {
    title: 'Full Stack Chronicles',
    description:
      'A blog only Docusaurus site showcasing cloud, data and full stack design patterns and tutorials',
    preview: require('./showcase/fullstackchronicles.png'),
    website: 'https://fullstackchronicles.io/',
    source: 'https://github.com/stackql/fullstackchronicles.io',
    tags: ['opensource', 'personal'],
  },
  {
    title: 'GeekyWeb',
    description:
      'Learn to code yourself by exploring documentations, try GeekyWeb once',
    preview: require('./showcase/geekyweb.png'),
    website: 'https://geekyweb.eu.org/',
    source: 'https://github.com/Designatory/GeekyWeb',
    tags: ['opensource', 'design'],
  },
  {
    title: 'Ghostly',
    description: 'A divine template/print formatter engine',
    preview: require('./showcase/ghostly.png'),
    website: 'https://divine-software.github.io/ghostly/',
    source: 'https://github.com/Divine-Software/ghostly/tree/master/website',
    tags: ['opensource'],
  },
  {
    title: 'Gladys Assistant',
    description: 'A privacy-first, open-source home assistant',
    preview: require('./showcase/gladys-assistant.png'),
    website: 'https://gladysassistant.com/',
    source: 'https://github.com/GladysAssistant/v4-website',
    tags: ['opensource', 'i18n'],
  },
  {
    title: 'Gotenberg',
    description: 'A Docker-powered stateless API for PDF files',
    preview: require('./showcase/gotenberg.png'),
    website: 'https://gotenberg.dev/',
    source: 'https://github.com/gotenberg/gotenberg.dev',
    tags: ['opensource', 'versioning'],
  },
  {
    title: 'GTFS-to-HTML',
    description: 'Generate human-readable HTML timetables from GTFS',
    preview: require('./showcase/gtfs-to-html.png'),
    website: 'https://gtfstohtml.com',
    source: 'https://github.com/BlinkTagInc/gtfs-to-html/tree/master/www',
    tags: ['opensource'],
  },
  {
    title: 'Gulp',
    description: 'A toolkit to automate & enhance your workflow',
    preview: require('./showcase/gulp.png'),
    website: 'https://gulpjs.com',
    source: 'https://github.com/gulpjs/gulpjs.github.io',
    tags: ['opensource', 'large'],
  },
  {
    title: 'Haochen',
    description:
      'My personal website with a blog section to record all tech-related issues I encountered.',
    preview: require('./showcase/haochen.png'),
    website: 'https://haochenqi.com/',
    source: 'https://github.com/HaochenQ/Haochen-Blog',
    tags: ['personal', 'opensource'],
  },
  {
    title: 'Hasura',
    description:
      'The fastest way to create a GraphQL API from your data with authorization, real-time subscriptions, and more for free.',
    preview: require('./showcase/hasura.png'),
    website: 'https://hasura.io/docs/',
    source: 'https://github.com/hasura/graphql-engine/tree/master/docs',
    tags: ['favorite', 'opensource', 'product', 'large'],
  },
  {
    title: 'hCaptcha',
    description: 'hCaptcha.com anti-bot service docs',
    preview: require('./showcase/hcaptcha.png'),
    website: 'https://docs.hcaptcha.com/',
    source: null,
    tags: ['product'],
  },
  {
    title: 'Home Assistant',
    description: 'All you need to start developing',
    preview: require('./showcase/home-assistant.png'),
    website: 'https://developers.home-assistant.io/',
    source: 'https://github.com/home-assistant/developers.home-assistant',
    tags: ['opensource'],
  },
  {
    title: 'httpin',
    description: 'Decode an HTTP request into a custom struct in Go',
    preview: require('./showcase/httpin.png'),
    website: 'https://ggicci.github.io/httpin/',
    source: 'https://github.com/ggicci/httpin/tree/documentation/docs',
    tags: ['opensource'],
  },
  {
    title: 'I am Massoud',
    description: 'The portfolio of Massoud Maboudi, Full Stack Developer',
    preview: require('./showcase/iammassoud.png'),
    website: 'https://iammassoud.ir/',
    source: null,
    tags: ['personal', 'rtl'],
  },
  {
    title: 'icodex',
    description: 'Front end engineer personal website',
    preview: require('./showcase/icodex.png'),
    website: 'https://icodex.me/',
    source: 'https://github.com/wood3n/icodex-next',
    tags: ['opensource', 'personal'],
  },
  {
    title: 'Idb',
    description: 'iOS Development Bridge',
    preview: require('./showcase/idb.png'),
    website: 'https://www.fbidb.io/',
    source: 'https://github.com/facebook/idb/tree/main/website',
    tags: ['opensource', 'meta'],
  },
  {
    title: 'Indent',
    description:
      'Indent provides on-demand access control for cloud apps and infrastructure.',
    preview: require('./showcase/indent.png'),
    website: 'https://indent.com/developers',
    source: null,
    tags: ['product', 'design'],
  },
  {
    title: 'IntelAGENT Billing',
    description: 'OHIP Billing Agent',
    preview: require('./showcase/intelagent.png'),
    website: 'https://www.intelagent.ca/',
    source: 'https://github.com/intelagentbilling/docs',
    tags: ['opensource', 'product'],
  },
  {
    title: 'KayaFolio',
    description:
      "A Software Engineer's blog, documentation and project portfolio.",
    preview: require('./showcase/evantay.png'),
    website: 'https://evantay.com/',
    source: 'https://github.com/DigiPie/kaya-folio',
    tags: ['opensource', 'personal'],
  },
  {
    title: "Kuizuo's Personal Website",
    description: "A Software Enthusiast's blog, Sharing and Learning",
    preview: require('./showcase/kuizuo.png'),
    website: 'https://kuizuo.cn',
    source: 'https://github.com/kuizuo/blog',
    tags: ['personal', 'opensource', 'design'],
  },
  {
    title: 'Ionic',
    description:
      'An open source UI toolkit for building performant, high-quality mobile and desktop apps using web technologies.',
    preview: require('./showcase/ionic.png'),
    website: 'https://ionicframework.com/docs',
    source: 'https://github.com/ionic-team/ionic-docs',
    tags: [
      'favorite',
      'opensource',
      'product',
      'design',
      'i18n',
      'versioning',
      'large',
    ],
  },
  {
    title: 'IOTA-Wiki',
    description: 'Documentation and wiki for the IOTA project',
    preview: require('./showcase/iota-wiki.png'),
    website: 'https://wiki.iota.org',
    source: 'https://github.com/iota-community/iota-wiki',
    tags: ['favorite', 'opensource'],
  },
  {
    title: 'Jest',
    description:
      'A delightful JavaScript Testing Framework with a focus on simplicity.',
    preview: require('./showcase/jest.png'),
    website: 'https://jestjs.io/',
    source: 'https://github.com/facebook/jest/tree/master/website',
    tags: ['favorite', 'opensource', 'design', 'i18n', 'versioning'],
  },
  {
    title: 'Junjie',
    description: 'A personal website',
    preview: require('./showcase/junjie.png'),
    website: 'https://junjieweb.github.io',
    source: 'https://github.com/junjieweb/junjieweb.github.io',
    tags: ['personal', 'opensource'],
  },
  {
    title: 'Kosko',
    description: 'Organize Kubernetes manifests in JavaScript',
    preview: require('./showcase/kosko.png'),
    website: 'https://kosko.dev',
    source: 'https://github.com/tommy351/kosko/tree/master/website',
    tags: ['opensource'],
  },
  {
    title: 'Kotest',
    description: 'Kotlin test framework',
    preview: require('./showcase/kotest.png'),
    website: 'https://kotest.io',
    source: 'https://github.com/kotest/kotest/tree/master/documentation',
    tags: ['opensource'],
  },
  {
    title: 'kube-green',
    description:
      'A kubernetes (k8s) operator to suspend your pods when no-one using them to save energy',
    preview: require('./showcase/kube-green.png'),
    website: 'https://kube-green.dev',
    source: 'https://github.com/kube-green/kube-green.github.io',
    tags: ['opensource', 'product'],
  },
  {
    title: 'KubeVela',
    description:
      "A modern application engine that adapts to your application's needs, not the other way around.",
    preview: require('./showcase/kubevela.png'),
    website: 'https://kubevela.io/',
    source: 'https://github.com/oam-dev/kubevela.io',
    tags: ['opensource', 'versioning', 'i18n'],
  },
  {
    title: 'kwatch',
    description:
      'monitor & detect crashes in your Kubernetes(K8s) cluster instantly',
    preview: require('./showcase/kwatch.png'),
    website: 'https://kwatch.dev',
    source: 'https://github.com/abahmed/kwatch.dev',
    tags: ['opensource', 'product'],
  },
  {
    title: 'LabVIEW 编程经验',
    description: 'A book for LabVIEW Programming',
    preview: require('./showcase/labviewbook.png'),
    website: 'https://lv.qizhen.xyz',
    source: 'https://github.com/ruanqizhen/labview_book',
    tags: ['opensource', 'i18n'],
  },
  {
    title: 'Leedom',
    description: 'A handbook about coding',
    preview: require('./showcase/leedom.png'),
    website: 'https://dinosaur.leedom.me',
    source: 'https://github.com/leedom92/dinosaur',
    tags: ['opensource', 'personal'],
  },
  {
    title: 'Leon',
    description: 'Your open-source personal assistant.',
    preview: require('./showcase/leon.png'),
    website: 'https://docs.getleon.ai',
    source: 'https://github.com/leon-ai/docs.getleon.ai',
    tags: ['opensource', 'versioning', 'i18n'],
  },
  {
    title: 'Lerna',
    description:
      'A fast modern build system for managing and publishing multiple JavaScript/TypeScript packages from the same repository.',
    preview: require('./showcase/lerna.png'),
    website: 'https://lerna.js.org',
    source: 'https://github.com/lerna/lerna/tree/main/website',
    tags: ['opensource'],
  },
  {
    title: 'Liqvid',
    description: 'Interactive videos in React',
    preview: require('./showcase/liqvid.png'),
    website: 'https://liqvidjs.org/',
    source: 'https://github.com/liqvidjs/liqvidjs.org',
    tags: ['opensource'],
  },
  {
    title: 'Mailgo',
    description: 'A new concept of mailto and tel links',
    preview: require('./showcase/mailgo.png'),
    website: 'https://mailgo.dev/',
    source: 'https://github.com/manzinello/mailgo.dev',
    tags: ['opensource'],
  },
  {
    title: 'MapillaryJS',
    description: 'Interactive, extendable street imagery map experiences',
    preview: require('./showcase/mapillaryjs.png'),
    website: 'https://mapillary.github.io/mapillary-js/',
    source: 'https://github.com/mapillary/mapillary-js/tree/main/doc',
    tags: ['opensource', 'meta'],
  },
  {
    title: 'Matej Jellus',
    description:
      'IT enthusiast that loves to write code, try new things and share knowledge.',
    preview: require('./showcase/juffalow.png'),
    website: 'https://juffalow.com/',
    source: null,
    tags: ['personal'],
  },




  {
    title: 'Metro',
    description: 'The JavaScript bundler for React Native',
    preview: require('./showcase/metro.png'),
    website: 'https://facebook.github.io/metro/',
    source: 'https://github.com/facebook/metro/tree/main/website',
    tags: ['opensource', 'meta'],
  },
  {
    title: 'Mia-Platform',
    description:
      'The simplest way to develop and operate modern applications on Kubernetes.',
    preview: require('./showcase/mia-platform.png'),
    website: 'https://docs.mia-platform.eu/',
    source: null,
    tags: ['product', 'large', 'versioning'],
  },
  {
    title: 'MikroORM',
    description:
      'TypeScript ORM for Node.js based on Data Mapper, Unit of Work and Identity Map patterns.',
    preview: require('./showcase/mikro-orm.png'),
    website: 'https://mikro-orm.io',
    source: 'https://github.com/mikro-orm/mikro-orm/tree/master/docs',
    tags: ['opensource', 'large', 'versioning'],
  },
  {
    title: 'Mint Metrics',
    description:
      'Conversion optimisation and web analytics agency from Melbourne, Australia.',
    preview: require('./showcase/mintmetrics.png'),
    website: 'https://mintmetrics.io/',
    source: null,
    tags: ['design'],
  },
  {
    title: 'Mixcore CMS',
    description: 'Fully Open Source ASP.Net Core / Dotnet Core CMS UI Toolkit',
    preview: require('./showcase/mixcore.png'),
    website: 'https://docs.mixcore.org/',
    source: 'https://github.com/mixcore/docs/tree/master/website',
    tags: ['opensource'],
  },
  {
    title: 'moja global',
    description:
      'A non-profit project to accurately and affordably estimate greenhouse gas emissions and removals from the AFOLU sector',
    preview: require('./showcase/mojaglobal.png'),
    website: 'https://community.moja.global/',
    source: 'https://github.com/moja-global/community-website',
    tags: ['opensource', 'large', 'i18n', 'design'],
  },
  {
    title: 'Molecule',
    description:
      'A lightweight Web IDE UI framework built with React.js and inspired by VS Code.',
    preview: require('./showcase/molecule-home.png'),
    website: 'https://dtstack.github.io/molecule/',
    source: 'https://github.com/DTStack/molecule/tree/main/website',
    tags: ['opensource', 'i18n'],
  },
  {
    title: 'nanos world',
    description: 'The next-generation multiplayer open world sandbox game.',
    preview: require('./showcase/nanos-world.png'),
    website: 'https://docs.nanos.world/',
    source: 'https://github.com/nanos-world/docs',
    tags: ['opensource', 'versioning', 'i18n', 'product'],
  },
  {
    title: 'netboot.xyz',
    description: 'Your favorite operating systems in one place!',
    preview: require('./showcase/netbootxyz.png'),
    website: 'https://netboot.xyz',
    source: 'https://github.com/netbootxyz/netboot.xyz-docs/',
    tags: ['opensource'],
  },
  {
    title: 'Netdata Learn',
    description:
      'An educational site for monitoring and troubleshooting systems',
    preview: require('./showcase/netdata.png'),
    website: 'https://learn.netdata.cloud',
    source: 'https://github.com/netdata/netdata-learn-docusaurus',
    tags: ['opensource', 'product', 'large'],
  },
  {
    title: 'NextAuth.js',
    description: 'An open source serverless authentication library for next.js',
    preview: require('./showcase/nextauthjs.png'),
    website: 'https://next-auth.js.org/',
    source: 'https://github.com/nextauthjs/next-auth/tree/main/docs',
    tags: ['opensource', 'design'],
  },
  {
    title: 'Nocalhost',
    description:
      'An open-source toolsets help to build cloud-native applications easier and faster.',
    preview: require('./showcase/nocalhost.png'),
    website: 'https://nocalhost.dev/',
    source: 'https://github.com/nocalhost/nocalhost.github.io',
    tags: ['opensource', 'i18n'],
  },
  {
    title: 'Node SerialPort',
    description: 'Talk to your Serial devices',
    preview: require('./showcase/node-serialport.png'),
    website: 'https://serialport.io',
    source: 'https://github.com/serialport/website',
    tags: ['opensource', 'versioning'],
  },
  {
    title: 'Orbit.js',
    description: 'The Universal Data Layer',
    preview: require('./showcase/orbitjs.png'),
    website: 'https://orbitjs.com',
    source: 'https://github.com/orbitjs/orbit/tree/main/website',
    tags: ['opensource', 'versioning'],
  },
  {
    title: 'Ory',
    description:
      'Authentication, authorization, access control, and delegation (OAuth2 & OpenID Connect) services and APIs',
    preview: require('./showcase/ory.png'),
    website: 'https://www.ory.sh/docs',
    source: 'https://github.com/ory/docs/',
    tags: ['opensource'],
  },
  {
    title: 'OSS Insight',
    description:
      'OSS Insight provides open source software insight and compares projects and tools',
    preview: require('./showcase/ossinsight.png'),
    website: 'https://ossinsight.io',
    source: 'https://github.com/pingcap/ossinsight',
    tags: ['opensource', 'design'],
  },
  {
    title: 'Oxidizer',
    description: 'A Rust ORM based on tokio-postgres and refinery',
    preview: require('./showcase/oxidizer.png'),
    website: 'https://oxidizer-rs.github.io',
    source: 'https://github.com/oxidizer-rs/website',
    tags: ['opensource'],
  },
  {
    title: 'Paubox',
    description: 'Paubox API Documentation',
    preview: require('./showcase/paubox.png'),
    website: 'https://docs.paubox.com/',
    source: null,
    tags: ['product'],
  },
  {
    title: 'PcapPlusPlus',
    description:
      'A multi-platform C++ library for capturing, parsing and crafting of network packets',
    preview: require('./showcase/pcapplusplus.png'),
    website: 'https://pcapplusplus.github.io/',
    source: 'https://github.com/PcapPlusPlus/pcapplusplus.github.io',
    tags: ['opensource', 'versioning'],
  },
  {
    title: 'PCC Archive',
    description:
      "A wiki and web posts archive about Purrnelope's Country Club project.",
    preview: require('./showcase/pcc-archive.png'),
    website: 'https://pcc-archive.org/',
    source: 'https://github.com/CuratorCat/pcc-archive.org',
    tags: ['opensource', 'design'],
  },
  {
    title: 'pdfme',
    description:
      'Free and Open source PDF generator library fully written in TypeScript coming with a React based UI template editor',
    preview: require('./showcase/pdfme.png'),
    website: 'https://pdfme.com/',
    source: 'https://github.com/pdfme/pdfme/tree/main/website',
    tags: ['opensource', 'design', 'product'],
  },
  {
    title: 'Pearl UI',
    description:
      'A design-system-driven UI framework that helps developer build beautiful and accessible mobile apps right out of the box',
    preview: require('./showcase/pearl-ui.png'),
    website: 'https://docs.pearl-ui.dev/',
    source:
      'https://github.com/agrawal-rohit/pearl-ui/tree/main/documentationwebsite',
    tags: ['opensource', 'design', 'product'],
  },
  {
    title: 'Pglet',
    description:
      'Build internal web apps quickly in the language you already know',
    preview: require('./showcase/pglet.png'),
    website: 'https://pglet.io',
    source: 'https://github.com/pglet/website',
    tags: ['opensource'],
  },
  {
    title: 'Piano Analytics',
    description: 'Piano Analytics SDKs documentation for developers',
    preview: require('./showcase/piano-analytics.png'),
    website: 'https://developers.atinternet-solutions.com/piano-analytics/',
    source: null,
    tags: ['favorite', 'product', 'design'],
  },
  {
    title: 'Plausible Analytics',
    description:
      'A simple, open source, lightweight (< 1 KB) and privacy-friendly alternative to Google Analytics',
    preview: require('./showcase/plausible.png'),
    website: 'https://plausible.io/docs',
    source: 'https://github.com/plausible/docs',
    tags: ['opensource', 'product'],
  },
  {
    title: 'pnpm',
    description: 'Fast, disk space efficient package manager',
    preview: require('./showcase/pnpm.png'),
    website: 'https://pnpm.js.org/',
    source: 'https://github.com/pnpm/pnpm.github.io/',
    tags: ['opensource', 'i18n'],
  },
  {
    title: 'Postgres.ai – Database Lab',
    description:
      "Deploy with confidence. Been stung by a poorly tested database migration? We won't let it happen again.",
    preview: require('./showcase/postgres-ai.png'),
    website: 'https://postgres.ai/',
    source: 'https://gitlab.com/postgres-ai/docs',
    tags: ['opensource', 'product'],
  },
  {
    title: 'PptxGenJS',
    description: 'PowerPoint JavaScript Library',
    preview: require('./showcase/pptxgenjs.png'),
    website: 'https://gitbrent.github.io/PptxGenJS/',
    source: 'https://github.com/gitbrent/PptxGenJS/tree/gh-pages',
    tags: ['opensource', 'design'],
  },
  {
    title: 'PREFS',
    description: 'PREFS Python library website and documentation',
    preview: require('./showcase/prefs.png'),
    website: 'https://patitotective.github.io/PREFS/',
    source: 'https://github.com/Patitotective/PREFS/tree/main/website',
    tags: ['opensource', 'versioning'],
  },
  {
    title: 'Prismatic',
    description: 'The Embedded Integration Platform for B2B SaaS Teams',
    preview: require('./showcase/prismatic.png'),
    website: 'https://prismatic.io/docs/',
    source: null,
    tags: ['design', 'large', 'product'],
  },
  {
    title: 'Pyre',
    description: 'A performant type-checker for Python 3',
    preview: require('./showcase/pyre.png'),
    website: 'https://pyre-check.org',
    source:
      'https://github.com/facebook/pyre-check/tree/main/documentation/website',
    tags: ['opensource', 'meta'],
  },
  {
    title: 'QA-Board',
    description:
      'An open source run-tracker for algorithm and performance engineering with rich visualizations',
    preview: require('./showcase/qa-board.png'),
    website: 'https://samsung.github.io/qaboard/',
    source: 'https://github.com/Samsung/qaboard/tree/master/website',
    tags: ['opensource'],
  },
  {
    title: 'Quickwit',
    description:
      'The open source search engine on object storage with subsecond latency',
    preview: require('./showcase/quickwit.png'),
    website: 'https://quickwit.io',
    source: null,
    tags: ['favorite', 'design'],
  },
  {
    title: 'RaspiSuite',
    description:
      'A suite of mobile apps to leverage the full potential of your Raspberry Pi effortlessly.',
    preview: require('./showcase/raspisuite.png'),
    website: 'https://raspisuite.com',
    source: null,
    tags: ['design', 'product'],
  },
  {
    title: 'react-chat-elements',
    description: 'Chat UI package for React',
    preview: require('./showcase/react-chat-elements.png'),
    website: 'https://detaysoft.github.io/docs-react-chat-elements/',
    source: 'https://github.com/Detaysoft/react-chat-elements',
    tags: ['opensource'],
  },
  {
    title: 'React Complex Tree',
    description:
      'Unopinionated Accessible React Tree Component with Multi-Select and Drag-And-Drop',
    preview: require('./showcase/react-complex-tree.png'),
    website: 'https://rct.lukasbach.com/',
    source:
      'https://github.com/lukasbach/react-complex-tree/tree/main/packages/docs',
    tags: ['opensource'],
  },
  {
    title: 'React-Leaflet',
    description: 'React components for Leaflet maps',
    preview: require('./showcase/react-leaflet.png'),
    website: 'https://react-leaflet.js.org/',
    source:
      'https://github.com/PaulLeCam/react-leaflet/tree/master/packages/website',
    tags: ['opensource'],
  },
  {
    title: 'React Native',
    description: 'A framework for building native apps using React',
    preview: require('./showcase/reactnative.png'),
    website: 'https://reactnative.dev',
    source: 'https://github.com/facebook/react-native-website',
    tags: ['opensource', 'meta', 'large', 'favorite', 'design', 'versioning'],
  },
  {
    title: 'React Native ARIA',
    description:
      'A library that provides accessible UI primitives for React Native apps.',
    preview: require('./showcase/reactnative-aria.png'),
    website: 'https://react-native-aria.geekyants.com',
    source: 'https://github.com/GeekyAnts/react-native-aria-website',
    tags: ['opensource'],
  },
  {
    title: 'React Native Boilerplate',
    description:
      'A template for building solid applications with separation of concerns between UI, state management, and business logic.',
    preview: require('./showcase/reactnativeboilerplate.png'),
    website: 'https://thecodingmachine.github.io/react-native-boilerplate/',
    source:
      'https://github.com/thecodingmachine/react-native-boilerplate/tree/master/documentation',
    tags: ['opensource'],
  },
  {
    title: 'React Native Elements',
    description: 'Cross Platform React Native UI Toolkit',
    preview: require('./showcase/react-native-elements.png'),
    website: 'https://react-native-training.github.io/react-native-elements/',
    source:
      'https://github.com/react-native-elements/react-native-elements/tree/next/website',
    tags: ['opensource'],
  },
  {
    title: 'React Native iOS Kit',
    description: 'The missing React Native UI Kit for iOS.',
    preview: require('./showcase/react-native-ios-kit.png'),
    website: 'https://callstack.github.io/react-native-ios-kit',
    source:
      'https://github.com/callstack/react-native-ios-kit/tree/master/website',
    tags: ['opensource'],
  },
  {
    title: 'React Native Reanimated',
    description: "React Native's Animated library reimplemented",
    preview: require('./showcase/react-native-reanimated.png'),
    website: 'https://docs.swmansion.com/react-native-reanimated/',
    source:
      'https://github.com/software-mansion/react-native-reanimated/tree/master/docs',
    tags: ['opensource', 'design', 'versioning'],
  },
  {
    title: 'React Native Render HTML',
    description:
      'The hackable, full-featured Open Source HTML rendering solution for React Native.',
    preview: require('./showcase/rnrh.png'),
    website: 'https://meliorence.github.io/react-native-render-html',
    source:
      'https://github.com/meliorence/react-native-render-html/tree/master/apps/website',
    tags: ['opensource', 'design'],
  },
  {
    title: 'React Navigation',
    description: 'Routing and navigation for your React Native apps',
    preview: require('./showcase/react-navigation.png'),
    website: 'https://reactnavigation.org/',
    source: 'https://github.com/react-navigation/react-navigation.github.io',
    tags: ['opensource', 'design', 'versioning'],
  },
  {
    title: 'React Redux',
    description: 'Official React bindings for Redux',
    preview: require('./showcase/react-redux.png'),
    website: 'https://react-redux.js.org',
    source: 'https://github.com/reduxjs/react-redux/tree/master/website',
    tags: ['opensource'],
  },
  {
    title: 'Reactive Button',
    description: '3D animated react button component with progress bar',
    preview: require('./showcase/reactive-button.png'),
    website: 'https://arifszn.github.io/reactive-button',
    source: null,
    tags: ['design'],
  },
  {
    title: 'Realtime Web Applications Workshop',
    description:
      'A workshop about building realtime web applications with WebSockets and WebRTC.',
    preview: require('./showcase/realtime-apps-workshop.png'),
    website: 'https://realtime-apps-iap.github.io',
    source: 'https://github.com/realtime-apps-iap/realtime-apps-iap.github.io',
    tags: ['opensource'],
  },
  {
    title: 'Reddit Image Fetcher',
    description:
      'A JavaScript package for fetching reddit images, memes, wallpapers and more',
    preview: require('./showcase/reddit-image-fetcher.png'),
    website: 'https://arifszn.github.io/reddit-image-fetcher',
    source: null,
    tags: [],
  },
  {
    title: 'Redux',
    description: 'A Predictable State Container for JS Apps',
    preview: require('./showcase/redux.png'),
    website: 'https://redux.js.org/',
    source: 'https://github.com/reduxjs/redux/tree/master/website',
    tags: ['opensource'],
  },
  {
    title: 'Redux Cool',
    description: 'Build redux logic, without getting nervous 😬',
    preview: require('./showcase/redux-cool.png'),
    website: 'https://redux-cool.js.org/',
    source:
      'https://github.com/Ruben-Arushanyan/redux-cool/tree/master/website',
    tags: ['opensource'],
  },
  {
    title: 'Refine',
    description:
      'A React-based framework for building data-intensive applications in no time!',
    preview: require('./showcase/refine.png'),
    website: 'https://refine.dev',
    source: 'https://github.com/pankod/refine/tree/master/documentation',
    tags: [
      'favorite',
      'opensource',
      'product',
      'design',
      'versioning',
      'large',
    ],
  },
  {
    title: 'Relay',
    description: 'The GraphQL client that scales with you',
    preview: require('./showcase/relay.png'),
    website: 'https://relay.dev/',
    source: 'https://github.com/facebook/relay/tree/main/website',
    tags: ['opensource', 'favorite', 'design', 'versioning'],
  },
  {
    title: 'Rematch',
    description:
      'Redux best practices without the boilerplate in less than 2kb',
    preview: require('./showcase/rematch.png'),
    website: 'https://rematchjs.org',
    source: 'https://github.com/rematch/rematch/tree/main/website',
    tags: ['opensource', 'design'],
  },
  {
    title: 'Remirror',
    description:
      'The editor that makes ProseMirror fun to use for React developers',
    preview: require('./showcase/remirror.png'),
    website: 'https://remirror.io/',
    source: 'https://github.com/remirror/remirror/tree/main/website',
    tags: ['opensource', 'design', 'large'],
  },
  {
    title: 'Remotion',
    description: 'Write videos programmatically in React',
    preview: require('./showcase/remotion.png'),
    website: 'https://www.remotion.dev/',
    source: 'https://github.com/JonnyBurger/remotion/tree/main/packages/docs',
    tags: ['opensource', 'product'],
  },
  {
    title: 'Repeater.js',
    description: 'The missing constructor for creating safe async iterators',
    preview: require('./showcase/repeaterjs.png'),
    website: 'https://repeater.js.org/',
    source: 'https://github.com/repeaterjs/repeater/tree/master/website',
    tags: ['opensource'],
  },
  {
    title: 'replicad',
    description: 'The library to build browser based 3D models with code.',
    preview: require('./showcase/replicad.png'),
    website: 'https://replicad.xyz/',
    source:
      'https://github.com/sgenoud/replicad/tree/main/packages/replicad-docs',
    tags: ['opensource'],
  },
  {
    title: 'RSocket',
    description: 'Application protocol providing Reactive Streams semantics.',
    preview: require('./showcase/rsocket.png'),
    website: 'https://rsocket.io/',
    source: 'https://github.com/rsocket/rsocket-website',
    tags: ['opensource'],
  },
  {
    title: 'Runiac',
    description: 'Run IaC Anywhere with Ease',
    preview: require('./showcase/runiac.png'),
    website: 'https://runiac.io',
    source: 'https://github.com/runiac/website',
    tags: ['opensource'],
  },
  {
    title: 'Saleor',
    description: 'Saleor Documentation',
    preview: require('./showcase/saleor.png'),
    website: 'https://docs.getsaleor.com/',
    source: 'https://github.com/mirumee/saleor-docs',
    tags: ['opensource', 'product', 'versioning'],
  },
  {
    title: 'SAP Cloud SDK',
    description:
      'The one-stop shop for developing and extending SAP applications in the cloud.',
    preview: require('./showcase/sapcloudsdk.png'),
    website: 'https://sap.github.io/cloud-sdk/',
    source: 'https://github.com/SAP/cloud-sdk',
    tags: ['opensource', 'product', 'large'],
  },
  {
    title: 'Sapphire',
    description: 'A next-gen object-oriented Discord.js bot framework.',
    preview: require('./showcase/sapphire.png'),
    website: 'https://www.sapphirejs.dev',
    source: 'https://github.com/sapphiredev/website',
    tags: ['opensource', 'large'],
  },
  {
    title: 'Sass Fairy',
    description:
      'Enhances built-in Sass modules with additional functions and adds modules for handling breakpoints and exceptions.',
    preview: require('./showcase/sass-fairy.png'),
    website: 'https://sass-fairy.com/',
    source: 'https://github.com/roydukkey/sass-fairy/tree/master/website',
    tags: ['opensource'],
  },
  {
    title: 'SCI WP Framework',
    description: 'A PHP framework to create MVC plugins for WordPress',
    preview: require('./showcase/sciwp.png'),
    website: 'https://sciwp.com/',
    source: 'https://github.com/sciwp/docs',
    tags: ['opensource'],
  },
  {
    title: 'Seaography - 🧭 A GraphQL framework and code generator for SeaORM',
    description:
      'Seaography is a GraphQL framework for building GraphQL resolvers using SeaORM entities.',
    preview: require('./showcase/Seaography.png'),
    website: 'https://www.sea-ql.org/Seaography/',
    source: 'https://github.com/SeaQL/seaql.github.io/tree/master/Seaography',
    tags: ['opensource'],
  },
  {
    title: 'SeaORM - 🐚 An async & dynamic ORM for Rust',
    description:
      'A relational ORM to help you build web services in Rust with the familiarity of dynamic languages.',
    preview: require('./showcase/SeaORM.png'),
    website: 'https://www.sea-ql.org/SeaORM/',
    source: 'https://github.com/SeaQL/seaql.github.io/tree/master/SeaORM',
    tags: ['opensource', 'versioning'],
  },
  {
    title: 'SeaQL - Building data intensive applications in Rust',
    description:
      'We help developers in building data intensive applications in Rust, such as web services, command line tools or apps.',
    preview: require('./showcase/SeaQL-blog.png'),
    website: 'https://www.sea-ql.org/blog/',
    source: 'https://github.com/SeaQL/seaql.github.io/tree/master/Blog',
    tags: ['opensource'],
  },
  {
    title: 'Sequence',
    description:
      'Automation toolkit for creating repeatable, predictable, and defensible end-to-end forensic and ediscovery workflows.',
    preview: require('./showcase/sequence.png'),
    website: 'https://sequence.sh/',
    source: 'https://gitlab.com/reductech/sequence/sequence-docs',
    tags: ['large', 'opensource', 'versioning'],
  },
  {
    title: 'Seven-innovation-base official website',
    description: 'About seven-innovation-base',
    preview: require('./showcase/seven-innovation-base.png'),
    website: 'https://七院创新基地.cn',
    source: 'https://github.com/seven-innovation-base/official-website',
    tags: ['opensource', 'personal'],
  },
  {
    title: 'SICOPE Model',
    description: 'An open source model-based testing tool for web applications',
    preview: require('./showcase/sicope-model.png'),
    website: 'https://sicope-model.github.io/',
    source: 'https://github.com/sicope-model/sicope-model-website',
    tags: ['opensource'],
  },
  {
    title: 'Single SPA',
    description: 'A javascript router for front-end microservices',
    preview: require('./showcase/single-spa.png'),
    website: 'https://single-spa.js.org/',
    source:
      'https://github.com/single-spa/single-spa.js.org/tree/master/website',
    tags: ['opensource', 'large', 'versioning', 'i18n'],
  },
  {
    title: 'Shotstack',
    description: 'The cloud video editing API',
    preview: require('./showcase/shotstack.png'),
    website: 'https://shotstack.io/docs/guide/',
    source: 'https://github.com/shotstack/documentation',
    tags: ['product', 'design', 'opensource'],
  },
  {
    title: 'smash.gg',
    description: 'Turning passions into careers',
    preview: require('./showcase/smashgg.png'),
    website: 'https://developer.smash.gg',
    source: 'https://github.com/smashgg/developer-portal/tree/master/website',
    tags: ['opensource', 'product'],
  },
  {
    title: 'Smart Docs',
    description:
      'A smart contract documentation visualizer for Solidity ABI interfaces.',
    preview: require('./showcase/smart-docs.png'),
    website: 'https://smart-docs.vercel.app/',
    source: 'https://github.com/wowtvds/smart-docs',
    tags: ['opensource', 'product', 'design'],
  },
  {
    title: 'SmartCookieWeb',
    description:
      'Webpage for an open source, telemetry-free Android web browser',
    preview: require('./showcase/smartcookieweb.png'),
    website: 'https://smartcookieweb.com/',
    source: null,
    tags: ['product', 'i18n'],
  },
  {
    title: 'social-embed',
    description:
      'Drop-in replacement for embed-friendly websites (and à la carte APIs for detecting and parsing them)',
    preview: require('./showcase/social-embed.png'),
    website: 'https://social-embed.git-pull.com/',
    source:
      'https://github.com/social-embed/social-embed/tree/master/packages/site',
    tags: ['opensource'],
  },
  {
    title: 'SODA for SPARC',
    description:
      'Simplifying data curation for researchers funded by the NIH SPARC initiative',
    preview: require('./showcase/sodaforsparc.png'),
    website: 'https://docs.sodaforsparc.io/',
    source: 'https://github.com/fairdataihub/SODA-for-SPARC-Docs',
    tags: ['opensource', 'versioning'],
  },
  {
    title: 'Spicetify',
    description: 'Powerful CLI tool to take control of the Spotify client.',
    preview: require('./showcase/spicetify.png'),
    website: 'https://spicetify.app/',
    source: 'https://github.com/spicetify/spicetify-docs',
    tags: ['opensource'],
  },
  {
    title: 'SpotifyAPI-NET',
    description: 'A Client for the Spotify Web API, written in C#/.NET',
    preview: require('./showcase/spotifyapi-net.png'),
    website: 'https://johnnycrazy.github.io/SpotifyAPI-NET/',
    source: 'https://github.com/JohnnyCrazy/SpotifyAPI-NET',
    tags: ['opensource', 'versioning'],
  },
  {
    title: 'SQL Frames',
    description: 'DataFrames meet SQL, in the browser',
    preview: require('./showcase/sqlframes_docusaurus.png'),
    website: 'https://sqlframes.com/',
    source: null,
    tags: ['product'],
  },
  {
    title: 'StackQL',
    description:
      'A data centric approach to provision, querying, and management of cloud infra and SaaS across multiple clouds.',
    preview: require('./showcase/stackql.png'),
    website: 'https://stackql.io/',
    source: null,
    tags: ['product'],
  },
  {
    title: 'StackQL Provider Registry',
    description:
      'Cloud infra and SaaS provider documentation for StackQL providers.',
    preview: require('./showcase/registry.stackql.io.png'),
    website: 'https://registry.stackql.io/',
    source: 'https://github.com/stackql/registry.stackql.io',
    tags: ['opensource', 'product', 'large'],
  },
  {
    title: 'Stryker Mutator',
    description: 'Mutation testing for JavaScript, .NET and JVM',
    preview: require('./showcase/stryker-mutator.png'),
    website: 'https://stryker-mutator.io',
    source: 'https://github.com/stryker-mutator/stryker-mutator.github.io',
    tags: ['opensource'],
  },
  {
    title: 'Stylable',
    description: 'A CSS preprocessor made for components',
    preview: require('./showcase/stylable.png'),
    website: 'https://stylable.io',
    source: 'https://github.com/wixplosives/stylable.io',
    tags: ['opensource'],
  },
  {
    title: 'Svix',
    description: 'Webhooks as a Service',
    preview: require('./showcase/svix.png'),
    website: 'https://docs.svix.com/',
    source: 'https://github.com/svix/svix-docs',
    tags: ['opensource', 'product'],
  },
  {
    title: 'SweetCode',
    description:
      'SweetCode company website and documentation for the Pixel Manager for WooCommerce',
    preview: require('./showcase/sweetcode.png'),
    website: 'https://sweetcode.com/',
    source: null,
    tags: ['product'],
  },
  {
    title: 'Synergies',
    description:
      'A performant and distributed state library for creating reusable React state logic by synergyzing atomar context pieces',
    preview: require('./showcase/synergies.png'),
    website: 'https://synergies.js.org',
    source: 'https://github.com/lukasbach/synergies/tree/main/packages/docs',
    tags: ['opensource', 'design'],
  },
  {
    title: 'Sado0823',
    description: "Sado0823's Blog and Portfolio Website",
    preview: require('./showcase/sado0823.png'),
    website: 'https://sado0823.github.io',
    source: 'https://github.com/sado0823/sado0823.github.io',
    tags: ['opensource', 'personal'],
  },
  {
    title: 'TalentBrick',
    description:
      'Learning made easy without ADS and trackers, Clear concepts at a glance, and Get access to quality study materials.',
    preview: require('./showcase/talentbrick.png'),
    website: 'https://www.talentbrick.com/',
    source: 'https://gitlab.com/talentbrick/talentbrick',
    tags: ['opensource', 'design'],
  },
  {
    title: 'TamalWeb',
    description: 'A web developers personal blog and portfolio helping other developers with tips',
    preview: require('./showcase/tamalwebsite.png'),
    website: 'https://tamalweb.com/',
    source: 'https://github.com/tamalchowdhury/tamalwebsite',
    tags: ['personal', 'opensource'],
  },
  {
    title: 'Taro',
    description: 'An open cross-end and cross-frame solution',
    preview: require('./showcase/docs-taro-zone.png'),
    website: 'https://docs.taro.zone/',
    source: 'https://github.com/NervJS/taro/tree/docs',
    tags: ['opensource', 'versioning', 'large', 'i18n'],
  },
  {
    title: 'Tauri',
    description:
      'Build an optimized, secure, and frontend-independent application for multi-platform deployment.',
    preview: require('./showcase/tauri.png'),
    website: 'https://tauri.app/',
    source: 'https://github.com/tauri-apps/tauri-docs',
    tags: ['opensource', 'i18n', 'product', 'design'],
  },
  {
    title: 'TechHarvesting',
    description:
      'Learn full stack web development from tutorials and blog posts',
    preview: require('./showcase/techharvesting.png'),
    website: 'https://techharvesting.in',
    source: 'https://github.com/techharvesting/techharvesting.github.io',
    tags: ['opensource', 'personal'],
  },
  {
    title: 'Testing Library',
    description:
      'Simple and complete testing utilities that encourage good testing practices',
    preview: require('./showcase/testing-library.png'),
    website: 'https://testing-library.com/',
    source: 'https://github.com/testing-library/testing-library-docs',
    tags: ['opensource'],
  },
  {
    title: 'The Diff Podcast',
    description: 'A Podcast from Facebook Open Source',
    preview: require('./showcase/the-diff.png'),
    website: 'https://thediffpodcast.com',
    source: null,
    tags: ['meta'],
  },
  {
    title: '30 Days Of SWA',
    description: 'A 30-Day Developer Guide to Azure Static Web Apps',
    preview: require('./showcase/30-days-swa.png'),
    website: 'https://www.azurestaticwebapps.dev',
    source: 'https://github.com/staticwebdev/30DaysOfSWA/tree/main/www',
    tags: ['opensource', 'product'],
  },
  {
    title: 'TiDB Community Books',
    description: 'A website for co-created books by TiDB Community users.',
    preview: require('./showcase/tidb-community-book.png'),
    website: 'https://tidb.net/book/',
    source: 'https://github.com/pingcap/book.tidb.net/tree/main/website',
    tags: ['opensource'],
  },
  {
    title: 'Tinaël Devresse',
    description:
      "Personal website of Tinaël Devresse, a blog about anything that crosses my mind which I think could interest y'all.",
    preview: require('./showcase/tinaeldevresse.png'),
    website: 'https://tinaeldevresse.eu/',
    source: 'https://github.com/hunteroi/tinaeldevresse.eu',
    tags: ['personal', 'opensource', 'i18n'],
  },
  {
    title: 'ToolJet',
    description:
      'Open-source low-code platform to build & deploy internal tools with minimal engineering effort.',
    preview: require('./showcase/tooljet.png'),
    website: 'https://docs.tooljet.com/docs/',
    source: 'https://github.com/ToolJet/ToolJet/tree/develop/docs',
    tags: ['opensource', 'design', 'large', 'product'],
  },
  {
    title: 'Tremor',
    description: 'Tremor Event Processing Engine',
    preview: require('./showcase/tremor.png'),
    website: 'https://www.tremor.rs/',
    source: 'https://github.com/tremor-rs/tremor-www',
    tags: ['opensource', 'versioning','large'],
  },
  {
    title: 'TRPG Engine',
    description: 'IM Application which build for TRPG, like slack and discord',
    preview: require('./showcase/trpgengine.png'),
    website: 'https://trpgdoc.moonrailgun.com/',
    source: 'https://github.com/TRPGEngine/Server/tree/master/services/Website',
    tags: ['opensource'],
  },
  {
    title: 'uniforms',
    description: 'A set of React libraries for building forms',
    preview: require('./showcase/uniforms.png'),
    website: 'https://uniforms.tools/',
    source: 'https://github.com/vazco/uniforms/tree/master/website',
    tags: ['opensource'],
  },
  {
    title: 'Unleash',
    description: 'A feature management solution.',
    preview: require('./showcase/unleash.png'),
    website: 'https://docs.getunleash.io/',
    source: 'https://github.com/Unleash/unleash/tree/main/website',
    tags: ['opensource', 'product'],
  },
  {
    title: 'Unmand',
    description:
      'A business automation platform that liberates users from repetitive tasks.',
    preview: require('./showcase/unmand.png'),
    website: 'https://unmand.com',
    source: null,
    tags: ['product', 'design'],
  },
  {
    title: 'Verdaccio',
    description: 'A lightweight open source private npm proxy registry',
    preview: require('./showcase/verdaccio.png'),
    website: 'https://verdaccio.org',
    source: 'https://github.com/verdaccio/verdaccio/tree/master/website',
    tags: ['favorite', 'opensource', 'large', 'i18n', 'design'],
  },
  {
    title: 'Verida',
    description: 'A web3 data storage and sharing API',
    preview: require('./showcase/verida-developers.png'),
    website: 'https://developers.verida.io/',
    source: 'https://github.com/verida/documentation',
    tags: ['opensource', 'product'],
  },
  {
    title: 'Virtual Photography Kit',
    description: 'A toolkit for virtual photography in Unreal Engine.',
    preview: require('./showcase/virtual-photography-kit.png'),
    website: 'https://docs.antonpalmqvist.com/',
    source: null,
    tags: ['product'],
  },
  {
    title: 'Vue NodeGui',
    description: 'A cross-platform native desktop app library',
    preview: require('./showcase/vue-nodegui.png'),
    website: 'https://vue.nodegui.org/',
    source: 'https://github.com/nodegui/vue-nodegui/tree/master/website',
    tags: ['opensource'],
  },
  {
    title: 'Warrant',
    description:
      'APIs and devtools for implementing authorization and access control.',
    preview: require('./showcase/warrant.png'),
    website: 'https://docs.warrant.dev/',
    source: null,
    tags: ['product'],
  },
  {
    title: 'Wasp',
    description:
      'A DSL for building full-stack web apps with less boilerplate.',
    preview: require('./showcase/wasp.png'),
    website: 'https://wasp.sh/',
    source: 'https://github.com/wasp-lang/wasp/tree/main/web',
    tags: ['opensource'],
  },
  {
    title: 'WebdriverIO',
    description:
      'Next-gen browser and mobile automation test framework for Node.js',
    preview: require('./showcase/webdriverio.png'),
    website: 'https://webdriver.io/',
    source: 'https://github.com/webdriverio/webdriverio/tree/main/website',
    tags: ['opensource', 'design', 'large', 'favorite'],
  },
  {
    title: 'WoodpeckerCI',
    description: 'A simple CI engine with great extensibility.',
    preview: require('./showcase/woodpecker.png'),
    website: 'https://woodpecker-ci.org/',
    source: 'https://github.com/woodpecker-ci/woodpecker/tree/master/docs',
    tags: ['opensource'],
  },
  {
    title: 'Yeecord',
    description:
      'A fully Chinese Discord bot with epic features that makes Discord more than just chatting platform.',
    website: 'https://yeecord.com/',
    preview: require('./showcase/yeecord.png'),
    tags: ['product', 'personal', 'opensource'],
    source: 'https://github.com/yeecord/docs',
  },
  {
    title: 'Zowe',
    description:
      'Open source framework for leveraging data and applications in z/OS',
    preview: require('./showcase/zowe.png'),
    website: 'https://docs.zowe.org',
    source: 'https://github.com/zowe/docs-site',
    tags: ['opensource', 'product', 'large', 'design', 'versioning'],
  },
  {
    title: '404Lab.Wiki',
    description: 'Docs and blogs about development and study',
    preview: require('./showcase/404lab-wiki.png'),
    website: 'https://wiki.404lab.top',
    source: 'https://github.com/HiChen404/MyWikiSite',
    tags: ['opensource', 'personal'],
  },
  {
    title: 'Discord API Types',
    description: 'Discord API Types',
    preview: null,
    website: 'https://discord-api-types.dev/',
    source: 'https://github.com/discordjs/discord-api-types/tree/main/website',
    tags: ['opensource', 'versioning', 'large'],
  },
  {
    title: 'Hanabi',
    description: 'A list of Hanabi card game strategies',
    preview: null,
    website: 'https://hanabi.github.io/',
    source: 'https://github.com/hanabi/hanabi.github.io',
    tags: ['opensource'],
  },
  {
    title: 'IsaacScript',
    description: 'Write Binding of Isaac: Repentance mods with TypeScript',
    preview: null,
    website: 'https://isaacscript.github.io/',
    source: 'https://github.com/IsaacScript/isaacscript/tree/main/packages/docs',
    tags: ['opensource'],
  },
  {
    title: 'Jest Preview',
    description: 'Debug your Jest tests. Effortlessly.',
    preview: null,
    website: 'https://www.jest-preview.com/',
    source: 'https://github.com/nvh95/jest-preview/tree/main/website',
    tags: ['opensource'],
  },
  {
    title: 'Paweł Kosiec',
    description: 'Personal website and blog of Paweł Kosiec, Full-stack Cloud Developer.',
    preview: null,
    website: 'https://kosiec.dev/',
    source: 'https://github.com/pkosiec/website',
    tags: ['opensource','personal'],
  },
  {
    title: 'Homarr',
    description: 'Homarr is a simple and lightweight homepage for your server.',
    preview: null,
    website: 'https://homarr.dev/',
    source: 'https://github.com/ajnart/homarr-docs',
    tags: ['opensource'],
  },
  {
    title: 'Wings',
    description: 'Wings is a modern website-as-service for progressive campaigns',
    preview: null,
    website: 'https://wings.dev/',
    source: null,
    tags: ['product','i18n'],
  },
  {
    title: 'Kishan Gajera',
    description: 'Personal portfolio and blog of Kishan Gajera',
    preview: null,
    website: 'https://www.kgajera.com/',
    source: 'https://github.com/kgajera/blog',
    tags: ['opensource','personal'],
  },
  {
    title: 'Harvest CLI',
    description: 'A CLI for Harvest\'s time tracking software',
    preview: null,
    website: 'https://kgajera.github.io/hrvst-cli/',
    source: 'https://github.com/kgajera/hrvst-cli/tree/main/website',
    tags: ['opensource'],
  },
  {
    title: 'TSEI.JP',
    description: 'TSEI.JP personal website, articles and docs',
    preview: null,
    website: 'https://tsei.jp/',
    source: null,
    tags: ['personal'],
  },
  {
    title: 'Brobot',
    description: 'Testable state-based GUI automation.',
    preview: null,
    website: 'https://jspinak.github.io/brobot/',
    source: 'https://github.com/jspinak/brobot/tree/main/docs',
    tags: ['opensource'],
  },
  {
    title: 'Fathym Blog',
    description: 'Fathym deploys, hosts and integrates your favorite tech stacks.',
    preview: null,
    website: 'https://www.fathym.com/blog',
    source: 'https://github.com/lowcodeunit/public-web-blog',
    tags: ['opensource'],
  },
  {
    title: 'Tech Interview Handbook',
    description: 'Free curated tech interview preparation materials for busy software engineers.',
    preview: null,
    website: 'https://www.techinterviewhandbook.org/',
    source: 'https://github.com/yangshun/tech-interview-handbook',
    tags: ['opensource','personal'],
  },
  {
    title: 'Front End Interview Handbook',
    description: 'Free curated tech interview preparation materials for busy software engineers',
    preview: null,
    website: 'https://www.frontendinterviewhandbook.com/',
    source: 'https://github.com/yangshun/front-end-interview-handbook',
    tags: ['opensource','personal'],
  },
  {
    title: 'WIZnet',
    description: 'Documentation for various WIZnet products',
    preview: null,
    website: 'https://docs.wiznet.io/',
    source: 'https://github.com/Wiznet/document_framework',
    tags: ['opensource','product'],
  },
  {
    title: 'Xiaohai\'s Mind Palace',
    description: 'A place for organizing notes, writing blogs, and showcasing projects.',
    preview: null,
    website: 'https://xiaohai.wiki/',
    source: 'https://github.com/xiaohai-huang/learning-notes',
    tags: ['opensource','personal'],
  },
  {
    title: 'Extracranial',
    description: 'Sunghyun Cho\'s Second Brain on the Web.',
    preview: null,
    website: 'https://cho.sh/',
    source: 'https://github.com/anaclumos/extracranial',
    tags: ['opensource','personal','i18n'],
  },
  {
    title: 'i18n-tools',
    description: 'CLI to make common operations around i18n files simpler',
    preview: null,
    website: 'https://jy95.github.io/i18n-tools/',
    source: 'https://github.com/jy95/i18n-tools/tree/master/website',
    tags: ['opensource'],
  },
  {
    title: 'Pure.css',
    description: 'A set of small, responsive CSS modules that you can use in every web project.',
    preview: null,
    website: 'https://purecss.io/',
    source: 'https://github.com/pure-css/pure',
    tags: ['opensource','design'],
  },
  {
    title: 'Moodle Developer Resources',
    description: 'Moodle - the world\'s open source learning platform',
    preview: null,
    website: 'https://moodledev.io/',
    source: 'https://github.com/moodle/devdocs',
    tags: ['opensource','product','large'],
  },
  {
    title: 'Toggle',
    description: 'Open Source real-time feature flags deployment without need of a server with SDK',
    preview: null,
    website: 'https://www.togglee.com/',
    source: 'https://github.com/togglee/togglee-web',
    tags: ['opensource','product'],
  },
  {
    title: 'Barklarm',
    description: 'Open Source multiplatform alarm and build status monitoring application',
    preview: null,
    website: 'https://www.barklarm.com/',
    source: 'https://github.com/kanekotic/barklarm-website',
    tags: ['opensource','product'],
  },
  {
    title: 'Neo Blockchain Developer Portal',
    description: 'A collection of tools and resources to help you build outstanding applications on Neo',
    preview: null,
    website: 'https://developers.neo.org/',
    source: 'https://github.com/neo-project/neo-dev-portal',
    tags: ['opensource'], // TODO create crypto/web3 tag?
  },
  {
    title: 'Yew',
    description: 'Documentation of Yew web framework',
    preview: null,
    website: 'https://yew.rs/',
    source: 'https://github.com/yewstack/yew/tree/master/website',
    tags: ['opensource','versioning','i18n','large'],
  },
  {
    title: 'Sensory Percussion help',
    description: 'On-line manual for Sensory Percussion, a music production tool for electronic drums.',
    preview: null,
    website: 'https://help.sunhou.se/',
    source: null,
    tags: ['product'],
  },
  {
    title: 'The Fundraising Lore',
    description: 'A guide to help founders successfully raise early-stage VC financing',
    preview: null,
    website: 'https://www.lore.vc/',
    source: 'https://github.com/dvitanov/lorevc',
    tags: ['opensource','personal'], // TODO find better tag?
  },
  {
    title: 'LifeOmic PHC Documentation',
    description: 'Help and information for LifeOmic PHC',
    preview: null,
    website: 'https://phc.docs.lifeomic.com/',
    source: null,
    tags: ['product'],
  },
  {
    title: 'Kanekotic\'s Page',
    description: 'List of open-source projects and blog',
    preview: null,
    website: 'https://www.kanekotic.com/',
    source: 'https://github.com/kanekotic/kanekotic-page',
    tags: ['opensource','personal'],
  },
  {
    title: 'DevTomek',
    description: 'A Polish blog about programming, electronics and IoT',
    preview: null,
    website: 'https://devtomek.pl/',
    source: null,
    tags: ['personal'],
  },
  {
    title: 'Vantevo Analytics',
    description: 'The most complete and secure Google Analytics alternative.',
    preview: null,
    website: 'https://vantevo.io/docs/',
    source: null,
    tags: ['product','i18n'],
  },
  {
    title: 'lsfusion platform documentation',
    description: 'A declarative open-source language-based platform for information systems development',
    preview: null,
    website: 'https://docs.lsfusion.org/',
    source: 'https://github.com/lsfusion/docusaurus',
    tags: ['opensource','i18n','versioning'],
  },
  {
    title: 'Rokt Docs',
    description: 'Rokt\'s product documentation',
    preview: null,
    website: 'https://docs.rokt.com/',
    source: null,
    tags: ['product'],
  },
  {
    title: 'Harmonoid',
    description: 'A beautiful material-design cross platform music player',
    preview: null,
    website: 'https://harmonoid.com/',
    source: null,
    tags: ['product','design'],
  },
  {
    title: 'Mentorship Guide',
    description: 'Making mentorship accessible to all, for mentors and mentees.',
    preview: null,
    website: 'https://mentorship.guide/',
    source: 'https://github.com/mentorship-sponsorship/mentorship-guide-docs',
    tags: ['opensource','design'],
  },
  {
    title: 'Vishal Gandhi',
    description: 'The Data Column - Blog by Vishal Gandhi',
    preview: null,
    website: 'https://vishalgandhi.in/',
    source: null,
    tags: ['personal'],
  },
  {
    title: 'daily.dev',
    description: 'Official product documentation for daily.dev',
    preview: null,
    website: 'https://docs.daily.dev/',
    source: 'https://github.com/dailydotdev/docs',
    tags: ['opensource','product','design'],
  },
  {
    title: 'Formiz',
    description: 'React forms with ease! Composable, headless & with built-in multi steps',
    preview: null,
    website: 'https://formiz-react.com/',
    source: 'https://github.com/ivan-dalmet/formiz/tree/master/documentation',
    tags: ['opensource'],
  },
  {
    title: 'Wener Live & Life',
    description: 'Notes, Stories, Awesomes',
    preview: null,
    website: 'https://wener.me/',
    source: 'https://github.com/wenerme/wener/tree/master/site',
    tags: ['opensource','personal'],
  },
  {
    title: 'Modrinth Documentation',
    description: 'The documentation for Modrinth, an open source Minecraft modding platform',
    preview: null,
    website: 'https://docs.modrinth.com/',
    source: 'https://github.com/modrinth/docs',
    tags: ['opensource'],
  },
  {
    title: 'Takken.io',
    description: 'Webber\'s personal website',
    preview: null,
    website: 'https://takken.io/',
    source: 'https://github.com/webbertakken/takken.io',
    tags: ['opensource','personal'],
  },
  {
    title: 'GameCI',
    description: 'Open source continuous integration for games',
    preview: null,
    website: 'https://game.ci/',
    source: 'https://github.com/game-ci/documentation',
    tags: ['opensource','product','versioning'],
  },
  {
    title: 'Batect',
    description: 'The fast, consistent way to run your development and testing tasks everywhere.',
    preview: null,
    website: 'https://batect.dev/',
    source: 'https://github.com/batect/batect.dev',
    tags: ['opensource'],
  },
  {
    title: 'YepCode Docs',
    description: 'Docs for the all-in-one platform that connects your services and APIs',
    preview: null,
    website: 'https://docs.yepcode.io/',
    source: null,
    tags: ['product'],
  },
  {
    title: 'YepCode Recipes',
    description: 'Recipes for the all-in-one platform that connects your services and APIs',
    preview: null,
    website: 'https://yepcode.io/recipes/',
    source: null,
    tags: ['product','large'],
  },
  {
    title: 'Appcircle Docs',
    description: 'Appcircle is an easy-to-setup mobile CI/CD platform.',
    preview: null,
    website: 'https://docs.appcircle.io/',
    source: 'https://github.com/appcircleio/appcircle-docusaurus/tree/master/',
    tags: ['opensource','product'],
  },
  {
    title: 'Rowy Docs',
    description: 'Open-source low-code platform for Firebase, Cloud Functions and GCP',
    preview: null,
    website: 'https://docs.rowy.io/',
    source: 'https://github.com/rowyio/docs',
    tags: ['opensource','product','design'],
  },
  {
    title: 'Keebio Documentation',
    description: 'Mechanical keyboard build guides and keyboard reprogramming info',
    preview: null,
    website: 'https://docs.keeb.io/',
    source: 'https://github.com/keebio/keebio-docs',
    tags: ['opensource','product'],
  },
  {
    title: '前端大刘',
    description: 'Record and share to make progress every day!',
    preview: null,
    website: 'https://lzwdot.com/',
    source: 'https://github.com/lzwdot/lzwdot.github.io',
    tags: ['opensource','personal'],
  },
  {
    title: 'DipScope',
    description: 'Open source tools to develop high quality software',
    preview: null,
    website: 'https://dipscope.com/',
    source: null,
    tags: ['versioning'],
  },
  {
    title: 'MutableSecurity',
    description: 'Platform for automating the lifecycle of cybersecurity solutions',
    preview: null,
    website: 'https://www.mutablesecurity.io/',
    source: 'https://github.com/MutableSecurity/website',
    tags: ['opensource','product'],
  },
  {
    title: 'Atlas',
    description: 'Atlas CLI helps developers manage their database schemas by applying DevOps principles.',
    preview: null,
    website: 'https://atlasgo.io/',
    source: 'https://github.com/ariga/atlas',
    tags: ['opensource','product'],
  },
  {
    title: 'Ent',
    description: 'An entity framework for Go',
    preview: null,
    website: 'https://entgo.io/',
    source: 'https://github.com/ent/ent/tree/master/doc/website',
    tags: ['opensource','i18n'],
  },
  {
    title: 'WPShop',
    description: 'Docs site for the ShopWP WordPress plugin',
    preview: null,
    website: 'https://docs.wpshop.io/',
    source: null,
    tags: ['product'],
  },
  {
    title: 'Polkadot Wiki',
    description: 'The central source of truth for Polkadot Network',
    preview: null,
    website: 'https://wiki.polkadot.network/',
    source: 'https://github.com/w3f/polkadot-wiki/tree/master/polkadot-wiki',
    tags: ['opensource'], // TODO add web3 tag?
  },
  {
    title: 'CodingHabits',
    description: 'An interactive learning environment for developers',
    preview: null,
    website: 'https://www.codinghabits.online/',
    source: null,
    tags: ['product'],
  },
  {
    title: 'Crawlee',
    description: 'Scalable web crawling, scraping and automation library for JS/Node.js',
    preview: null,
    website: 'https://crawlee.dev/',
    source: 'https://github.com/apify/crawlee/tree/master/website',
    tags: ['opensource','versioning'],
  },
  {
    title: 'codehooks',
    description: 'Fast Serverless Backend made Easy',
    preview: null,
    website: 'https://codehooks.io/',
    source: null,
    tags: ['product'],
  },
  {
    title: 'Ouch1978',
    description: 'Personal site of @Ouch1978',
    preview: null,
    website: 'https://ouch1978.github.io/',
    source: 'https://github.com/Ouch1978/ouch1978.github.io',
    tags: ['opensource','personal'],
  },
  {
    title: 'Dojo Documentation',
    description: 'Take faster card payments with Dojo.',
    preview: null,
    website: 'https://docs.dojo.tech/',
    source: null,
    tags: ['product'],
  },
  {
    title: 'OKP4',
    description: 'Documentation portal for the OKP4 blockchain',
    preview: null,
    website: 'https://docs.okp4.network/',
    source: 'https://github.com/okp4/docs',
    tags: ['opensource','product','design'], // TODO add web3 tag
  },
  {
    title: 'Konkatsu Strategy Guide',
    description: 'Support konkatsu (marriage hunting) in Japan',
    preview: null,
    website: 'https://hikonkatsu.com/',
    source: null,
    tags: ['personal'],
  },
  {
    title: 'Zondax Documentation',
    description: 'Building back-end tech solutions for the Web3 Space.',
    preview: null,
    website: 'https://docs.zondax.ch/',
    source: null,
    tags: ['product','design'], // TODO add web3 tag
  },
  {
    title: 'ShellHub Documentation',
    description: 'A centralized SSH server for the the edge and cloud computing',
    preview: null,
    website: 'https://docs.shellhub.io/',
    source: 'https://github.com/shellhub-io/docs',
    tags: ['opensource','product'],
  },
  {
    title: 'Dynamoose',
    description: 'A modeling tool for Amazon\'s DynamoDB',
    preview: null,
    website: 'https://dynamoosejs.com/',
    source: 'https://github.com/dynamoose/dynamoose/tree/main/docs',
    tags: ['opensource'],
  },

  /*
  Pro Tip: add your site in alphabetical order.
  Appending your site here (at the end) is more likely to produce Git conflicts.
   */
];

export type User = {
  title: string;
  description: string;
  preview: IdealImageProps['img'] | string | null; // null = use our serverless screenshot service
  website: string;
  source: string | null;
  tags: TagType[];
};

export type Tag = {
  label: string;
  description: string;
  color: string;
};

export const Tags: {[type in TagType]: Tag} = {
  favorite: {
    label: translate({message: 'Favorite'}),
    description: translate({
      message:
        'Our favorite Docusaurus sites that you must absolutely check out!',
      id: 'showcase.tag.favorite.description',
    }),
    color: '#e9669e',
  },

  opensource: {
    label: translate({message: 'Open-Source'}),
    description: translate({
      message: 'Open-Source Docusaurus sites can be useful for inspiration!',
      id: 'showcase.tag.opensource.description',
    }),
    color: '#39ca30',
  },

  product: {
    label: translate({message: 'Product'}),
    description: translate({
      message: 'Docusaurus sites associated to a commercial product!',
      id: 'showcase.tag.product.description',
    }),
    color: '#dfd545',
  },

  design: {
    label: translate({message: 'Design'}),
    description: translate({
      message:
        'Beautiful Docusaurus sites, polished and standing out from the initial template!',
      id: 'showcase.tag.design.description',
    }),
    color: '#a44fb7',
  },

  i18n: {
    label: translate({message: 'I18n'}),
    description: translate({
      message:
        'Translated Docusaurus sites using the internationalization support with more than 1 locale.',
      id: 'showcase.tag.i18n.description',
    }),
    color: '#127f82',
  },

  versioning: {
    label: translate({message: 'Versioning'}),
    description: translate({
      message:
        'Docusaurus sites using the versioning feature of the docs plugin to manage multiple versions.',
      id: 'showcase.tag.versioning.description',
    }),
    color: '#fe6829',
  },

  large: {
    label: translate({message: 'Large'}),
    description: translate({
      message:
        'Very large Docusaurus sites, including many more pages than the average!',
      id: 'showcase.tag.large.description',
    }),
    color: '#8c2f00',
  },

  meta: {
    label: translate({message: 'Meta'}),
    description: translate({
      message: 'Docusaurus sites of Meta (formerly Facebook) projects',
      id: 'showcase.tag.meta.description',
    }),
    color: '#4267b2', // Facebook blue
  },

  personal: {
    label: translate({message: 'Personal'}),
    description: translate({
      message:
        'Personal websites, blogs and digital gardens built with Docusaurus',
      id: 'showcase.tag.personal.description',
    }),
    color: '#14cfc3',
  },

  rtl: {
    label: translate({message: 'RTL Direction'}),
    description: translate({
      message:
        'Docusaurus sites using the right-to-left reading direction support.',
      id: 'showcase.tag.rtl.description',
    }),
    color: '#ffcfc3',
  },
};

export const TagList = Object.keys(Tags) as TagType[];
function sortUsers() {
  let result = Users;
  // Sort by site name
  result = sortBy(result, (user) => user.title.toLowerCase());
  // Sort by favorite tag, favorites first
  result = sortBy(result, (user) => !user.tags.includes('favorite'));
  return result;
}

export const sortedUsers = sortUsers();
