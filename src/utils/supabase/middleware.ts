import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          supabaseResponse.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          supabaseResponse.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Get the current user session
  const { data: { user } } = await supabase.auth.getUser()

  // Define protected routes
  const isProtectedAdminRoute = request.nextUrl.pathname.startsWith('/kick-bot') || request.nextUrl.pathname === '/'
  const isProtectedApiRoute = request.nextUrl.pathname.startsWith('/api/kick-bot')
  const isAuthCallback = request.nextUrl.pathname.startsWith('/auth/callback')
  const isLoginPage = request.nextUrl.pathname.startsWith('/login')

  // Whitelist logic
  const allowedDiscordIds = (process.env.ALLOWED_DISCORD_IDS || '').split(',').map(id => id.trim())
  
  let isWhitelisted = false;
  if (user && user.app_metadata.provider === 'discord') {
    // Discord ID is typically stored in user.user_metadata.provider_id or user.identities
    const discordIdentity = user.identities?.find(i => i.provider === 'discord');
    const discordId = discordIdentity?.id || user.user_metadata?.provider_id || user.user_metadata?.sub;
    if (discordId && allowedDiscordIds.includes(discordId)) {
      isWhitelisted = true;
    }
  }

  // Redirect to login if unauthenticated on protected UI route
  if (isProtectedAdminRoute && (!user || !isWhitelisted)) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    
    // If they were logged in but not whitelisted, add an error parameter
    if (user && !isWhitelisted) {
      loginUrl.searchParams.set('error', 'not_whitelisted')
      // Optional: Sign them out server-side by deleting auth cookies, 
      // but usually the client side handles sign out if they hit the page.
    }
    
    return NextResponse.redirect(loginUrl)
  }

  // Block API requests if unauthorized
  if (isProtectedApiRoute && (!user || !isWhitelisted)) {
    return NextResponse.json({ error: 'Unauthorized: Not on whitelist.' }, { status: 401 })
  }

  // If on login page and already authenticated/whitelisted, redirect to dashboard
  if (isLoginPage && user && isWhitelisted) {
    const dashboardUrl = request.nextUrl.clone()
    dashboardUrl.pathname = '/kick-bot/overview' // Or '/'
    return NextResponse.redirect(dashboardUrl)
  }

  return supabaseResponse
}
