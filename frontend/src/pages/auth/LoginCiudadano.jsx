import LoginForm from './LoginForm';
import { loginCiudadano } from '@/api/auth';

const LoginCiudadano = () => (
  <LoginForm
    userType="ciudadano"
    loginFunction={loginCiudadano}
    successRoute="/ciudadano/dashboard"
    showBackButton={true}
    allowGoogleLogin={false}
  />
);

export default LoginCiudadano;