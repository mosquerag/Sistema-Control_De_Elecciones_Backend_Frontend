/**
 * ARCHIVO: LoginAdmin.jsx
 * UBICACIÓN: /frontend/src/pages/auth/LoginAdmin.jsx
 */

import LoginForm from './LoginForm';
import { loginAdmin } from '@/api/auth';

const LoginAdmin = () => (
  <LoginForm
    userType="admin"
    loginFunction={loginAdmin}
    successRoute="/admin/dashboard"
    showBackButton={true}
    allowGoogleLogin={false}
  />
);

export default LoginAdmin;