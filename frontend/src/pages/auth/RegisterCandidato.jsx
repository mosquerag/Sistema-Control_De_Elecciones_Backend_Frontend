
import RegisterForm from "./RegisterForm.jsx";
import { REGISTER_CONFIG } from "@/utils/registerConfig";
import { registerCandidato } from "@/api/auth";

const RegisterCandidato = () => (
  <RegisterForm
    userType={REGISTER_CONFIG.CANDIDATO}
    registerFunction={registerCandidato}
    showBackButton={true}
  />
);

export default RegisterCandidato;