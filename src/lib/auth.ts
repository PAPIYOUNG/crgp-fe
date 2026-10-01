import { AuthApi } from '@/lib/api/auth.api';
import { LoginSchema } from '@/lib/schema/login.schema';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
  session: { strategy: 'jwt', maxAge: 86370 },
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      async authorize(input) {
        //console.log('authorize input:', input);
        //ไม่เอา remember me
        const parsed = LoginSchema.pick({
          email: true,
          password: true,
        }).safeParse({
          email: input.email,
          password: input.password,
        });
        if (!parsed.success) {
          console.log('authorize validation error:', parsed.error);
          return null;
        }
        try {
          const { access_token, user } = await AuthApi.login(parsed.data);

          return {
            ...user,
            access_token,
          };
        } catch (error) {
          console.log('AuthApi.login error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.sub = user.id;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.access_token = user.access_token;
        token.avatarUrl = user.avatarUrl;
        token.role = user.role;
        token.status = user.status;
        token.department = user.department;
      }
      //console.log('token', token);

      //update cookie ตอนเปลี่ยน avatar
      if (trigger === 'update') {
        if (session?.user?.avatarUrl) {
          token.avatarUrl = session.user.avatarUrl;
        }

        if (session?.user?.firstName) {
          token.firstName = session.user.firstName;
        }

        if (session?.user?.lastName) {
          token.lastName = session.user.lastName;
        }

        if (session?.user?.department) {
          token.department = session.user.department;
        }
      }
      return token;
    },
    session({ token, session }) {
      if (!token.sub) {
        throw new Error('Token subject is missing');
      }
      session.user.id = token.sub;
      session.user.firstName = token.firstName;
      session.user.lastName = token.lastName;
      session.user.avatarUrl = token.avatarUrl;
      session.user.access_token = token.access_token;
      session.user.role = token.role;
      session.user.status = token.status;
      session.user.department = token.department;

      //console.log('session', session);
      return session;
    },
  },
});
