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
        <link rel="stylesheet" href="/assets/styles.css" />
        <title>Proofmarked · Secure Auth</title>
        <Head />
      </head>
      <body class="min-h-screen antialiased bg-grid">
        <Component />
      </body>
    </html>
  );
});
