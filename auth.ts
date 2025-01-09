import { prisma } from '@/db/prisma'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { compareSync } from 'bcrypt-ts-edge'
import type { NextAuthConfig } from 'next-auth'
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const config = {
  pages: {
    signIn: '/sign-in',
    error: '/sign-in',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' },
      },
      async authorize(credentials) {
        if (credentials === null) {
          return null
        }

        // Find user in the database
        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email as string,
          },
        })

        // Check if the user exists and if the password matches
        if (user && user.password) {
          const isMatch = compareSync(
            credentials.password as string,
            user.password
          )

          // If password is correct, return user
          if (isMatch) {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
            }
          }
        }

        // if user does not exist or password is incorrect return null
        return null
      },
    }),
  ],
  callbacks: {
    async session({ session, user, trigger, token }: any) {
      // Set the userID from the token
      session.user.id = token.sub

      // If there is an update, set the user name
      if (trigger === 'update') {
        session.user.name = user.name
      }

      return session
    },
  },
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(config)
