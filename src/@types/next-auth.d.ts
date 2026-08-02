import { DefaultSession, DefaultUser } from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface User extends DefaultUser {
    id: string;
    firstName: string;
    lastName: string;
    access_token: string;
    avatarUrl: string | null;
    role: string;
    status: string;
    department: string;
  }

  interface Session extends DefaultSession {
    user: {
      id: string;
      firstName: string;
      lastName: string;
      access_token: string;
      avatarUrl: string | null;
      role: string;
      status: string;
      department: string;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    firstName: string;
    lastName: string;
    access_token: string;
    avatarUrl: string | null;
    role: string;
    status: string;
    department: string;
  }
}
