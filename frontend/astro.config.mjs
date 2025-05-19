// @ts-check

// This is for ssr
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";

import react from "@astrojs/react";
import clerk from "@clerk/astro";

// import node from "@astrojs/node";
import netlify from "@astrojs/netlify";

// https://astro.build/config
export default defineConfig({
  vite: {
      plugins: [tailwindcss()],
  },

  integrations: [react(), clerk()],

  adapter: netlify(),
  output: "server",
});

// SSG

// import * as dotenv from "dotenv";
// dotenv.config();
// import { defineConfig } from "astro/config";

// import react from "@astrojs/react";

// import clerk from "@clerk/astro";

// import tailwindcss from "@tailwindcss/vite";

// export default defineConfig({

//   root: "./src",
//   integrations: [react(), clerk()],

//   // No adapter means static site build output

//   vite: {
//     plugins: [tailwindcss()],
//   },

//   outDir: "../dist"
// });