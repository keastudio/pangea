# Pangea

Pangea is a static site generator built with Deno and the React.

Features:

- Exports static files, which can be deployed to Netlify and Vercel
- No JavaScript is shipped to the frontend by default
- Island architecture—only interactive React components are hydrated on the client side
- Built in support for CSS-in-JS, which is statically generated for performance
- Next.js inspired file-system routing

### Getting started

```sh
deno run -A -r https://pangea.sh my-project-name 
cd my-project-name
deno task start
```
