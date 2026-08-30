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
      allowGoogleLogin={false}
    />
  );
};

export default LoginCandidato;