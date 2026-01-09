import { Child, FC, ReactNode } from "hono/jsx";

const RootLayout: FC<{
  children: Child;
  title?: string;
}> = (props) => {
  return (
    <html>
      <head>
        {/* tailwindcss output */}
        <title>{props.title || "WA Gateway"}</title>

        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="/assets/style.css" />
      </head>
      <body>{props.children}</body>
    </html>
  );
};

export default RootLayout;
