import LoginForm from '@/components/feature/auth/LoginForm';
import { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Login',
};

export default function LoginPage() {
  return <LoginForm />;
}
