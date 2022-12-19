import type { Context } from 'https://edge.netlify.com'

export default async (request: Request, context: Context) => {
  const userAgent = request.headers.get('user-agent')

  const response = await context.next()

  if (userAgent?.includes('Deno')) {    
    const response = await fetch('https://deno.land/x/pangea/init.ts')

    if (!response.ok) {
      console.error(response.status)
    }

    const text = await response.text()

    return context.json(text)
  } else {
    return response
  }
}
