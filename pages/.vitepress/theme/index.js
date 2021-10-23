// .vitepress/theme/index.js
import Layout from "./Layout.vue";

import ElementPlus from "element-plus";
import "element-plus/dist/index.css";

export default {
  Layout,
  NotFound: () => "custom 404", // <- this is a Vue 3 functional component
  enhanceApp({ app, router, siteData }) {
    app.use(ElementPlus);
    // app is the Vue 3 app instance from `createApp()`. router is VitePress'
    // custom router. `siteData`` is a `ref`` of current site-level metadata.
  },
};
