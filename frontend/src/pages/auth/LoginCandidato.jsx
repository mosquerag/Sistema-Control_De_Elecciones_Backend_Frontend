/**
 * ARCHIVO: LoginCandidato.jsx
 * UBICACIÓN: /frontend/src/pages/auth/LoginCandidato.jsx
 * DESCRIPCIÓN: Página de login para candidatos
 */

import React from 'react';
import LoginForm from './LoginForm';
import { loginCandidato } from '@/api/auth';

const LoginCandidato = () => {
  return (
    <LoginForm
      userType="candidato"
      loginFunction={loginCandidato}
      successRoute="/candidato/dashboard"
      showBackButton={true}
      allowGoogleLogin={true}
      // allowGoogleLogin={false} // Deshabilitado temporalmente hasta resolver problemas con Google OAuth
    />
  );
};

export default LoginCandidato;