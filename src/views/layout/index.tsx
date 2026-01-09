import { Child, FC, ReactNode } from "hono/jsx";

const RootLayout: FC<{
  children: Child;
  title?: string;
}> = (props) => {
  return (
    <html>
      <head>
        {/* tailwindcss output */}
        <link rel="stylesheet" href="/assets/style.css" />
        <title>{props.title || "WA Gateway"}</title>
      </head>
      <body>{props.children}</body>
    </html>
  );
};

export default RootLayout;
