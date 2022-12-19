import type { Context } from 'https://edge.netlify.com'

export default async (request: Request, context: Context) => {
  const userAgent = request.headers.get('user-agent')

  if (userAgent?.includes('Deno')) {    
    const response = await fetch('https://deno.land/x/pangea/init.ts')

    if (!response.ok) {
      console.error(response.status)
    }

    return response
  } else {
    const response = await context.next()

    return response
  }
}
