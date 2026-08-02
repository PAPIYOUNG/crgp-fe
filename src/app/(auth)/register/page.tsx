import { Metadata } from 'next';
import RegisterForm from '@/components/feature/auth/RegisterForm';

export const metadata: Metadata = {
  title: 'Register',
};

export default function RegisterPage() {
  return <RegisterForm />;
}
