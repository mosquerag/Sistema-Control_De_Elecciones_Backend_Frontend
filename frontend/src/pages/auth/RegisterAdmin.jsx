/**
 * ARCHIVO: RegisterAdmin.jsx
 * UBICACIÓN: /frontend/src/pages/auth/RegisterAdmin.jsx
 */

import RegisterForm from "./RegisterForm.jsx";
import { REGISTER_CONFIG } from "@/utils/registerConfig";
import { registerAdmin } from "@/api/auth";

const RegisterAdmin = () => (
  <RegisterForm
    userType={REGISTER_CONFIG.ADMIN}
    registerFunction={registerAdmin}
    showBackButton={true}
  />
);

export default RegisterAdmin;
