
import RegisterForm from './RegisterForm.jsx';
import { REGISTER_CONFIG } from '@/utils/registerConfig';
import { registerCiudadano } from '@/api/auth';

const RegisterCiudadano = () => (
  <RegisterForm
    userType={REGISTER_CONFIG.CIUDADANO}
    registerFunction={registerCiudadano}
    showBackButton={true}
  />
);

export default RegisterCiudadano;