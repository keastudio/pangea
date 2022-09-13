import type { Context } from 'https://edge.netlify.com'

export default async (request: Request, context: Context) => {
  const userAgent = request.headers.get('user-agent')

  const response = await context.next()

  if (userAgent?.includes('Deno')) {
    return Response.redirect('https://deno.land/x/pangea/init.ts')
  } else {
    return response
  }
}
