# Getting started with Vercel Web Analytics

This guide will help you get started with using Vercel Web Analytics on your project, showing you how to enable it, add the package to your project, deploy your app to Vercel, and view your data in the dashboard.

**Select your framework to view instructions on using the Vercel Web Analytics in your project**.

## Prerequisites

- A Vercel account. If you don't have one, you can [sign up for free](https://vercel.com/signup).
- A Vercel project. If you don't have one, you can [create a new project](https://vercel.com/new).
- The Vercel CLI installed. If you don't have it, you can install it using the following command:

```bash
# Using pnpm
pnpm i vercel

# Using yarn
yarn i vercel

# Using npm
npm i vercel

# Using bun
bun i vercel
```

## Enable Web Analytics in Vercel

On the [Vercel dashboard](/dashboard), select your Project and then click the **Analytics** tab and click **Enable** from the dialog.

> **💡 Note:** Enabling Web Analytics will add new routes (scoped at `/_vercel/insights/*`)
> after your next deployment.

## Add `@vercel/analytics` to your project

Using the package manager of your choice, add the `@vercel/analytics` package to your project:

### For NextJS, NextJS App Router, SvelteKit, Remix, Create React App, Nuxt, Vue, Other, Astro

Add the `@vercel/analytics` package:

```bash
# Using pnpm
pnpm i @vercel/analytics

# Using yarn
yarn i @vercel/analytics

# Using npm
npm i @vercel/analytics

# Using bun
bun i @vercel/analytics
```

## Add the `Analytics` component to your app

### For NextJS (Pages Directory)

The `Analytics` component is a wrapper around the tracking script, offering more seamless integration with Next.js, including route support.

If you are using the `pages` directory, add the following code to your main app file:

```tsx
import type { AppProps } from "next/app";
import { Analytics } from "@vercel/analytics/next";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}

export default MyApp;
```

```jsx
import { Analytics } from "@vercel/analytics/next";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}

export default MyApp;
```

### For NextJS (App Router)

The `Analytics` component is a wrapper around the tracking script, offering more seamless integration with Next.js, including route support.

Add the following code to the root layout:

```tsx
import { Analytics } from "@vercel/analytics/next";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Next.js</title>
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

```jsx
import { Analytics } from "@vercel/analytics/next";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Next.js</title>
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### For Remix

The `Analytics` component is a wrapper around the tracking script, offering a seamless integration with Remix, including route detection.

Add the following code to your root file:

```tsx
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { Analytics } from "@vercel/analytics/remix";

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Analytics />
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
```

```jsx
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { Analytics } from "@vercel/analytics/remix";

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Analytics />
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
```

### For Nuxt

The `Analytics` component is a wrapper around the tracking script, offering more seamless integration with Nuxt, including route support.

Add the following code to your main component.

```tsx
<script setup lang="ts">
import { Analytics } from '@vercel/analytics/nuxt';
</script>

<template>
  <Analytics />
  <NuxtPage />
</template>
```

```jsx
<script setup>
import { Analytics } from '@vercel/analytics/nuxt';
</script>

<template>
  <Analytics />
  <NuxtPage />
</template>
```

### For SvelteKit

The `injectAnalytics` function is a wrapper around the tracking script, offering more seamless integration with SvelteKit.js, including route support.

Add the following code to the main layout:

```ts
import { dev } from "$app/environment";
import { injectAnalytics } from "@vercel/analytics/sveltekit";

injectAnalytics({ mode: dev ? "development" : "production" });
```

```js
import { dev } from "$app/environment";
import { injectAnalytics } from "@vercel/analytics/sveltekit";

injectAnalytics({ mode: dev ? "development" : "production" });
```

### For Astro

The `Analytics` component is a wrapper around the tracking script, offering more seamless integration with Astro, including route support.

Add the following code to your base layout:

```tsx
---
import Analytics from '@vercel/analytics/astro';
{/* ... */}
---

<html lang="en">
	<head>
      <meta charset="utf-8" />
      <!-- ... -->
      <Analytics />
	</head>
	<body>
		<slot />
    </body>
</html>
```

```jsx
---
import Analytics from '@vercel/analytics/astro';
{/* ... */}
---

<html lang="en">
	<head>
      <meta charset="utf-8" />
      <!-- ... -->
      <Analytics />
	</head>
	<body>
		<slot />
    </body>
</html>
```

> **💡 Note:** The `Analytics` component is available in version `@vercel/analytics@1.4.0` and later.
> If you are using an earlier version, you must configure the `webAnalytics` property of the Vercel adapter in your `astro.config.mjs` file as shown in the code below.
> For further information, see the [Astro adapter documentation](https://docs.astro.build/en/guides/integrations-guide/vercel/#webanalytics).

```ts
import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel/serverless";

export default defineConfig({
  output: "server",
  adapter: vercel({
    webAnalytics: {
      enabled: true, // set to false when using @vercel/analytics@1.4.0
    },
  }),
});
```

```js
import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel/serverless";

export default defineConfig({
  output: "server",
  adapter: vercel({
    webAnalytics: {
      enabled: true, // set to false when using @vercel/analytics@1.4.0
    },
  }),
});
```

### For Plain HTML

For plain HTML sites, you can add the following script to your `.html` files:

```ts
<script>
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
</script>
<script defer src="/_vercel/insights/script.js"></script>
```

```js
<script>
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
</script>
<script defer src="/_vercel/insights/script.js"></script>
```

> **💡 Note:** When using the HTML implementation, there is no need to install the
> `@vercel/analytics` package. However, there is no route support.

### For Other Frameworks

Import the `inject` function from the package, which will add the tracking script to your app. **This should only be called once in your app, and must run in the client**.

> **💡 Note:** There is no route support with the `inject` function.

Add the following code to your main app file:

```ts
import { inject } from "@vercel/analytics";

inject();
```

```js
import { inject } from "@vercel/analytics";

inject();
```

### For Create React App

The `Analytics` component is a wrapper around the tracking script, offering more seamless integration with React.

> **💡 Note:** When using the plain React implementation, there is no route support.

Add the following code to the main app file:

```tsx
import { Analytics } from "@vercel/analytics/react";

export default function App() {
  return (
    <div>
      {/* ... */}
      <Analytics />
    </div>
  );
}
```

```jsx
import { Analytics } from "@vercel/analytics/react";

export default function App() {
  return (
    <div>
      {/* ... */}
      <Analytics />
    </div>
  );
}
```

### For Vue

The `Analytics` component is a wrapper around the tracking script, offering more seamless integration with Vue.

> **💡 Note:** Route support is automatically enabled if you're using `vue-router`.

Add the following code to your main component:

```tsx
<script setup lang="ts">
import { Analytics } from '@vercel/analytics/vue';
</script>

<template>
  <Analytics />
  <!-- your content -->
</template>
```

```jsx
<script setup>
import { Analytics } from '@vercel/analytics/vue';
</script>

<template>
  <Analytics />
  <!-- your content -->
</template>
```

## Deploy your app to Vercel

Deploy your app using the following command:

```bash
vercel deploy
```

If you haven't already, we also recommend [connecting your project's Git repository](/docs/git#deploying-a-git-repository),
which will enable Vercel to deploy your latest commits to main without terminal commands.

Once your app is deployed, it will start tracking visitors and page views.

> **💡 Note:** If everything is set up properly, you should be able to see a Fetch/XHR
> request in your browser's Network tab from `/_vercel/insights/view` when you
> visit any page.

## View your data in the dashboard

Once your app is deployed, and users have visited your site, you can view your data in the dashboard.

To do so, go to your [dashboard](/dashboard), select your project, and click the **Analytics** tab.

After a few days of visitors, you'll be able to start exploring your data by viewing and [filtering](/docs/analytics/filtering) the panels.

Users on Pro and Enterprise plans can also add [custom events](/docs/analytics/custom-events) to their data to track user interactions such as button clicks, form submissions, or purchases.

Learn more about how Vercel supports [privacy and data compliance standards](/docs/analytics/privacy-policy) with Vercel Web Analytics.

## Next steps

Now that you have Vercel Web Analytics set up, you can explore the following topics to learn more:

- [Learn how to use the `@vercel/analytics` package](/docs/analytics/package)
- [Learn how to set update custom events](/docs/analytics/custom-events)
- [Learn about filtering data](/docs/analytics/filtering)
- [Read about privacy and compliance](/docs/analytics/privacy-policy)
- [Explore pricing](/docs/analytics/limits-and-pricing)
- [Troubleshooting](/docs/analytics/troubleshooting)

## Implementation for vnu.com (Vite + React)

For this specific project, which uses Vite with React, follow these steps:

### Step 1: Install the package

```bash
pnpm i @vercel/analytics
```

### Step 2: Add Analytics to your app

Modify `src/App.tsx` to include the Analytics component. Add the import at the top:

```tsx
import { Analytics } from "@vercel/analytics/react";
```

Then update the return statement to include the Analytics component after the BrowserRouter closes but within the TooltipProvider:

```tsx
const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/services" element={<Services />} />
            <Route path="/ai-consulting" element={<AIConsulting />} />
            <Route path="/talent-solutions" element={<TalentSolutions />} />
            <Route path="/nowrise-institute" element={<NowRiseInstitute />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/f/:formId" element={<FormPage />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Analytics />
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
```

### Step 3: Deploy to Vercel

Deploy using the Vercel CLI or connect your Git repository to Vercel for automatic deployments.

### Step 4: Monitor your analytics

After deployment and once users start visiting your site, you can view your analytics data in the Vercel dashboard under the Analytics tab for your project.
