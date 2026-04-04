import type { FC, PropsWithChildren } from "hono/jsx";
import type { User } from "../types";
import { readdir } from "node:fs/promises";

const gifs = (await readdir(new URL("../../public", import.meta.url)))
  .filter((f) => f.endsWith(".gif"))
  .map((f) => `/${f}`);

export const Layout: FC<PropsWithChildren<{ user?: User }>> = ({ user, children }) => (
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      <title>Booster Payback</title>
      <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      <link rel="apple-touch-icon" href="/icon-180.png" />
      <link rel="manifest" href="/manifest.json" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-title" content="Payback" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <link rel="stylesheet" href="/styles.css" />
      {gifs.map((gif) => <link rel="prefetch" href={gif} as="image" />)}
    </head>
    <body>
      <div class="container">{children}</div>
      {user && (
        <div class="user-bubble">
          <img src={user.avatar} alt="" class="avatar" />
          <span>{user.name}</span>
          <span class="user-bubble-divider" />
          <a href="/auth/logout" class="user-bubble-signout">Sign out</a>
        </div>
      )}
      <script src="/script.js" defer />
      <script type="module" src="https://esm.sh/@khmyznikov/pwa-install@0.6.2" />
      <pwa-install
        manifest-url="/manifest.json"
        disable-screenshots
        styles='{"--tint-color": "#6B8A80"}'
        use-local-storage
      />
    </body>
  </html>
);
