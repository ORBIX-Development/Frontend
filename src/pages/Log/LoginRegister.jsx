import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import './LoginRegister.css';
// import 'dotenv';

function LoginRegister() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialMode = params.get('mode') === 'login';

  const [isSignIn, setIsSignIn] = useState(initialMode);

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [errorLoginEmail, setErrorLoginEmail] = useState('');
  const [errorLoginPassword, setErrorLoginPassword] = useState('');
  const [loadingLogin, setLoadingLogin] = useState(false);

  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCodDoc, setRegCodDoc] = useState('');

  const [errorRegName, setErrorRegName] = useState('');
  const [errorRegEmail, setErrorRegEmail] = useState('');
  const [errorRegPassword, setErrorRegPassword] = useState('');
  const [errorRegCodDoc, setErrorRegCodDoc] = useState('');

  const [loadingReg, setLoadingReg] = useState(false);

  const handleSignIn = () => setIsSignIn(true);
  const handleSignUp = () => setIsSignIn(false);

  const API_URL = 'http://localhost:3000';

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorLoginEmail('');
    setErrorLoginPassword('');

    if (!loginEmail.trim()) return setErrorLoginEmail('Email é obrigatório');
    if (!loginPassword) return setErrorLoginPassword('Senha é obrigatória');

    setLoadingLogin(true);
    try {
      const res = await fetch(`${API_URL}/usuarios/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, senha: loginPassword }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Credenciais inválidas');
      }

      const data = await res.json();
      localStorage.setItem('token', data.token);
      // armazenar dados do usuário para controle de rotas/menus
      if (data.user) {
        localStorage.setItem(
          'userRole',
          String(data.user.cargo || '').toLowerCase(),
        );
        localStorage.setItem('userId', String(data.user.id || ''));
        localStorage.setItem('userName', String(data.user.nome || ''));
      }
      alert('Login realizado com sucesso!');
      // redirecionar para home — header exibirá botões conforme cargo
      window.location.href = '/home';
    } catch (err) {
      alert(err.message);
    } finally {
      setLoadingLogin(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorRegName('');
    setErrorRegEmail('');
    setErrorRegPassword('');
    setErrorRegCodDoc('');

    let valid = true;
    if (!regName.trim()) {
      setErrorRegName('Nome é obrigatório');
      valid = false;
    }
    if (!regEmail.trim()) {
      setErrorRegEmail('Email é obrigatório');
      valid = false;
    }
    if (!regPassword) {
      setErrorRegPassword('Senha é obrigatória');
      valid = false;
    }
    if (!regCodDoc.trim()) {
      setErrorRegCodDoc('Código do documento é obrigatório');
      valid = false;
    }

    if (!valid) return;

    setLoadingReg(true);
    try {
      const res = await fetch(`${API_URL}/usuarios/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: regName,
          email: regEmail,
          senha: regPassword,
          cod_doc: regCodDoc,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Erro ao registrar');
      }

      const data = await res.json();
      alert('Registro realizado com sucesso!');
      console.log('Usuário registrado:', data);
      setIsSignIn(true);
      setRegName('');
      setRegEmail('');
      setRegPassword('');
      setRegCodDoc('');
    } catch (err) {
      alert(err.message);
    } finally {
      setLoadingReg(false);
    }
  };

  return (
    <div className="lr-page">
      <div className="lr-card">
        {/* LATERAL VERDE */}
        <div className="lr-left">
          {!isSignIn ? (
            <div className="lr-left-inner">
              <h2 className="lr-left-title">Bem-vindo de volta!</h2>
              <p className="lr-left-text">
                Para se manter conectado, faça login com suas informações
                pessoais.
              </p>
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleSignIn}
              >
                Fazer Login
              </button>
            </div>
          ) : (
            <div className="lr-left-inner">
              <h2 className="lr-left-title">Seja bem-vindo!</h2>
              <p className="lr-left-text">
                Insira suas informações para criar sua conta e iniciar sua
                jornada conosco.
              </p>
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleSignUp}
              >
                Criar Conta
              </button>
            </div>
          )}
        </div>

        {/* FORMULÁRIO */}
        <div className="lr-right">
          {!isSignIn ? (
            // FORM DE REGISTRO
            <div className="form-wrap">
              <h2 className="form-title">Crie sua conta</h2>
              <p className="small-muted">Ou use o seu email cadastrado:</p>

              <form className="form" onSubmit={handleRegisterSubmit} noValidate>
                <label className="label-input">
                  <i className="far fa-user icon" />
                  <input
                    type="text"
                    placeholder=" "
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                  />
                  <span>Nome</span>
                </label>
                {errorRegName && (
                  <div className="error-message">{errorRegName}</div>
                )}

                <label className="label-input">
                  <i className="far fa-envelope icon" />
                  <input
                    type="email"
                    placeholder=" "
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                  />
                  <span>Email</span>
                </label>
                {errorRegEmail && (
                  <div className="error-message">{errorRegEmail}</div>
                )}

                <label className="label-input">
                  <i className="fas fa-lock icon" />
                  <input
                    type="password"
                    placeholder=" "
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                  />
                  <span>Senha</span>
                </label>
                {errorRegPassword && (
                  <div className="error-message">{errorRegPassword}</div>
                )}

                <label className="label-input">
                  <i className="fas fa-id-card icon" />
                  <input
                    type="text"
                    placeholder=" "
                    value={regCodDoc}
                    onChange={(e) => setRegCodDoc(e.target.value)}
                  />
                  <span>CPF, CNPJ ou CRM</span>
                </label>
                {errorRegCodDoc && (
                  <div className="error-message">{errorRegCodDoc}</div>
                )}

                <button type="submit" className="btn btn-primary">
                  {loadingReg ? 'Registrando...' : 'Registre-se'}
                </button>
              </form>
            </div>
          ) : (
            // FORM DE LOGIN
            <div className="form-wrap">
              <h2 className="form-title">Faça login na sua conta</h2>
              <p className="small-muted">Ou use o seu email cadastrado:</p>

              <form className="form" onSubmit={handleLoginSubmit} noValidate>
                <label className="label-input">
                  <i className="far fa-envelope icon" />
                  <input
                    type="email"
                    placeholder=" "
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                  <span>Email</span>
                </label>
                {errorLoginEmail && (
                  <div className="error-message">{errorLoginEmail}</div>
                )}

                <label className="label-input">
                  <i className="fas fa-lock icon" />
                  <input
                    type="password"
                    placeholder=" "
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                  <span>Senha</span>
                </label>
                {errorLoginPassword && (
                  <div className="error-message">{errorLoginPassword}</div>
                )}

                <a
                  className="password-link"
                  href="#"
                  onClick={(e) => e.preventDefault()}
                >
                  Esqueceu sua senha?
                </a>

                <button type="submit" className="btn btn-primary">
                  {loadingLogin ? 'Entrando...' : 'Login'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginRegister;
