import { resolve, join } from 'https://deno.land/std@0.150.0/path/mod.ts'

const unresolvedDirectory = Deno.args[0]
const resolvedDirectory = resolve(unresolvedDirectory)

try {
  const dir = [...Deno.readDirSync(resolvedDirectory)]
  const isEmpty = dir.length === 0 || dir.length === 1 && dir[0].name === '.git'
  if (
    !isEmpty
  ) {
    console.error('Directory is not empty.')
    Deno.exit(1)
  }
} catch (err) {
  if (!(err instanceof Deno.errors.NotFound)) {
    throw err
  }
}

await Deno.mkdir(join(resolvedDirectory, 'pages'), { recursive: true })
await Deno.mkdir(join(resolvedDirectory, 'islands'), { recursive: true })
await Deno.mkdir(join(resolvedDirectory, 'static'), { recursive: true })

const pangeaUrl = new URL('./', import.meta.url).href

const importMapJson = JSON.stringify(
  {
    'imports': {
      '$pangea/': pangeaUrl === 'https://pangea.sh/'
        ? (await fetch('https://deno.land/x/pangea/init.ts')).url.split('/').slice(0, -1).join('/') + '/'
        : pangeaUrl,
      'react': 'https://esm.sh/react@18.2.0?pin=v92',
      'react-dom/client': 'https://esm.sh/react-dom@18.2.0/client?pin=v92',
      'react-dom/server': 'https://esm.sh/react-dom@18.2.0/server?pin=v92',
      'esbuild': 'https://deno.land/x/esbuild@v0.14.51/mod.js'
    }
  },
  null,
  2
) + '\n'

await Deno.writeTextFile(
  join(resolvedDirectory, 'import_map.json'),
  importMapJson
)

await Deno.writeTextFile(
  join(resolvedDirectory, 'build.ts'),
  `#!/usr/bin/env -S deno run -A

import { build } from '$pangea/build.ts'

build(import.meta.url)
`
)

await Deno.writeTextFile(
  join(resolvedDirectory, 'dev.ts'),
  `#!/usr/bin/env -S deno run -A

import { dev } from '$pangea/dev.ts'
    
dev(import.meta.url)
`
)

const useVSCode = true

if (useVSCode) {
  await Deno.mkdir(join(resolvedDirectory, '.vscode'), { recursive: true })
  await Deno.writeTextFile(
    join(resolvedDirectory, '.vscode', 'settings.json'),
    JSON.stringify(
      {
        'deno.enable': true,
        'deno.lint': true,
        'editor.defaultFormatter': 'denoland.vscode-deno'
      },
      null,
      2
    ) + '\n'    
  )
  await Deno.writeTextFile(
    join(resolvedDirectory, '.vscode', 'extensions.json'),
    JSON.stringify(
      {
        'recommendations': ['denoland.vscode-deno']
      },
      null,
      2
    ) + '\n'    
  )
}

await Deno.writeTextFile(
  join(resolvedDirectory, 'islands', 'Counter.tsx'),
  `import React from 'react'
import { css, combine } from '$pangea/css.ts'

const Counter = ({ initialCount }: { initialCount: number }) => {
  const [count, setCount] = React.useState(initialCount)

  return (
    <>
      <button onClick={() => setCount(count - 1)}>-1</button>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <p
        className={combine(
          css\`
            margin-top: 3rem;
            font-size: 2rem;
          \`,
          [
            count >= 0,
            css\`
              color: green;
            \`,
            css\`
              color: red;
            \`
          ]
        )}
      >
        {count}
      </p>
    </>
  )
}

export { Counter as default }
`
)

await Deno.writeTextFile(
  join(resolvedDirectory, 'pages', 'index.tsx'),
  `import React from 'react'
import { Island } from '$pangea/island.ts'
import Counter from '../islands/Counter.tsx'

const Page = ({ title }: { title: string }) => {
  return (
    <>
      <h1>{title}</h1>
      <Island
        path='islands/Counter.tsx'
        app={Counter}
        data={{ initialCount: 0 }}
      />
    </>
  )
}

const getStaticProps = () => {
  return {
    props: {
      title: 'Hello World!'
    }
  }
}

export { Page as default, getStaticProps }  
`
)

await Deno.writeTextFile(
  join(resolvedDirectory, 'deno.json'),
  JSON.stringify(
    {
      'tasks': {
        'start': 'deno run -A --watch=pages/ dev.ts',
        'build': 'deno run -A build.ts'
      },
      'importMap': './import_map.json'
    },
    null,
    2
  ) + '\n'
)
