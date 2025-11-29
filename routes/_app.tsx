import { Head } from "fresh/runtime";
import { define } from "../utils.ts";

export default define.page(function App({ Component }) {
  return (
    <html lang="en" class="bg-surface text-foreground">
      <head>
        <meta charset="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/assets/styles.css" />
        <title>Proofmarked · Secure Auth</title>
        <Head />
      </head>
      <body class="min-h-screen">
        <Component />
      </body>
    </html>
  );
});
