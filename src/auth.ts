import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [Google],
    session: { strategy: 'jwt' },
    callbacks: {
        async signIn({ account, profile }) {
            if (account?.provider !== 'google' || !profile?.sub || profile.email_verified !== true) return false
            const { sql } = await import('@/lib/db')
            await sql`insert into traveller (id, name, email) values (${profile.sub}, ${profile.name ?? ''}, ${profile.email ?? ''})
                on conflict (id) do update set name=excluded.name, email=excluded.email`
            return true
        },
        jwt({ token, account }) {
            if (account?.provider === 'google') token.sub = account.providerAccountId
            return token
        },
        session({ session, token }) {
            if (session.user && token.sub) session.user.id = token.sub
            return session
        },
    },
})
