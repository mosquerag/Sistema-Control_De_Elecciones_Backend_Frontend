import LoginForm from './LoginForm';
import { loginAdmin } from '@/api/auth';

const LoginAdmin = () => (
  <LoginForm
    userType="admin"
    loginFunction={loginAdmin}
    successRoute="/admin/dashboard"
    showBackButton={true}
    allowGoogleLogin={true}
  />
);

export default LoginAdmin;