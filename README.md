# Pangea

Pangea is a static site generator built with Deno and the React.

Features:

- Exports static files, which can be deployed to Netlify and Vercel
- No JavaScript is shipped to the frontend by default
- Island architecture—only interactive React components are hydrated on the client side
- Built in support for CSS-in-JS, which is server-side rendered for performance 
- Next.js inspired file-system routing

### Getting started

```sh
deno run -A -r https://deno.land/x/pangea/init.ts project-name 
cd project-name
deno task serve
```
