import React, { useState } from "react";
import "./LoginRegister.css";

function LoginRegister() {
  const [isSignIn, setIsSignIn] = useState(false); // false = mostra registro por padrão
  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [errorLoginEmail, setErrorLoginEmail] = useState("");
  const [errorLoginPassword, setErrorLoginPassword] = useState("");
  const [loadingLogin, setLoadingLogin] = useState(false);

  // Register state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [errorRegName, setErrorRegName] = useState("");
  const [errorRegEmail, setErrorRegEmail] = useState("");
  const [errorRegPassword, setErrorRegPassword] = useState("");
  const [loadingReg, setLoadingReg] = useState(false);

  const handleSignIn = () => setIsSignIn(true);
  const handleSignUp = () => setIsSignIn(false);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setErrorLoginEmail("");
    setErrorLoginPassword("");
    let valid = true;
    if (!loginEmail.trim()) {
      setErrorLoginEmail("Email é obrigatório");
      valid = false;
    }
    if (!loginPassword) {
      setErrorLoginPassword("Senha é obrigatória");
      valid = false;
    }
    if (!valid) return;
    setLoadingLogin(true);
    // Simulação de request
    setTimeout(() => {
      setLoadingLogin(false);
      console.log("Login simulated:", { loginEmail, loginPassword });
    }, 1000);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setErrorRegName("");
    setErrorRegEmail("");
    setErrorRegPassword("");
    let valid = true;
    if (!regName.trim()) {
      setErrorRegName("Nome é obrigatório");
      valid = false;
    }
    if (!regEmail.trim()) {
      setErrorRegEmail("Email é obrigatório");
      valid = false;
    }
    if (!regPassword) {
      setErrorRegPassword("Senha é obrigatória");
      valid = false;
    }
    if (!valid) return;
    setLoadingReg(true);
    setTimeout(() => {
      setLoadingReg(false);
      console.log("Register simulated:", { regName, regEmail, regPassword });
      // opcional: limpar campos
      setRegName("");
      setRegEmail("");
      setRegPassword("");
      // ir para tela de login automaticamente:
      setIsSignIn(true);
    }, 1200);
  };

  return (
    <div className="lr-page">
      <div className="lr-card">
        {/* LATERAL VERDE -- contém CTA e botão para alternar */}
        <div className="lr-left">
          {!isSignIn ? (
            <div className="lr-left-inner">
              <h2 className="lr-left-title">Bem-vindo de volta!</h2>
              <p className="lr-left-text">Para se manter conectado, faça login com suas informações pessoais.</p>
              <button type="button" className="btn btn-outline" onClick={handleSignIn}>
                Fazer Login
              </button>
            </div>
          ) : (
            <div className="lr-left-inner">
              <h2 className="lr-left-title">Seja bem-vindo!</h2>
              <p className="lr-left-text">Insira suas informações para criar sua conta e iniciar sua jornada conosco.</p>
              <button type="button" className="btn btn-outline" onClick={handleSignUp}>
                Criar Conta
              </button>
            </div>
          )}
        </div>

        {/* ÁREA DO FORM (direita) */}
        <div className="lr-right">
          {!isSignIn ? (
            // FORM DE REGISTRO
            <div className="form-wrap">
              <h2 className="form-title">Crie sua conta</h2>
              <ul className="social-list" aria-hidden>
                <li><a className="social" href="#" onClick={(e)=>e.preventDefault()}><i className="fab fa-facebook-f" /></a></li>
                <li><a className="social" href="#" onClick={(e)=>e.preventDefault()}><i className="fab fa-google-plus-g" /></a></li>
                <li><a className="social" href="#" onClick={(e)=>e.preventDefault()}><i className="fab fa-linkedin-in" /></a></li>
              </ul>
              <p className="small-muted">ou use seu email para se registrar:</p>

              <form className="form" onSubmit={handleRegisterSubmit} noValidate>
                <label className="label-input">
                  <i className="far fa-user icon" />
                  <input
                    type="text"
                    placeholder=" "
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    aria-label="Nome"
                  />
                  <span>Nome</span>
                </label>
                {errorRegName && <div className="error-message">{errorRegName}</div>}

                <label className="label-input">
                  <i className="far fa-envelope icon" />
                  <input
                    type="email"
                    placeholder=" "
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    aria-label="Email"
                  />
                  <span>Email</span>
                </label>
                {errorRegEmail && <div className="error-message">{errorRegEmail}</div>}

                <label className="label-input">
                  <i className="fas fa-lock icon" />
                  <input
                    type="password"
                    placeholder=" "
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    aria-label="Senha"
                  />
                  <span>Senha</span>
                </label>
                {errorRegPassword && <div className="error-message">{errorRegPassword}</div>}

                <button type="submit" className="btn btn-primary">
                  {loadingReg ? "Registrando..." : "Registre-se"}
                </button>
              </form>
            </div>
          ) : (
            // FORM DE LOGIN
            <div className="form-wrap">
              <h2 className="form-title">Faça login na sua conta</h2>
              <ul className="social-list" aria-hidden>
                <li><a className="social" href="#" onClick={(e)=>e.preventDefault()}><i className="fab fa-facebook-f" /></a></li>
                <li><a className="social" href="#" onClick={(e)=>e.preventDefault()}><i className="fab fa-google-plus-g" /></a></li>
                <li><a className="social" href="#" onClick={(e)=>e.preventDefault()}><i className="fab fa-linkedin-in" /></a></li>
              </ul>
              <p className="small-muted">Ou use o seu email cadastrado:</p>

              <form className="form" onSubmit={handleLoginSubmit} noValidate>
                <label className="label-input">
                  <i className="far fa-envelope icon" />
                  <input
                    type="email"
                    placeholder=" "
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    aria-label="Email"
                  />
                  <span>Email</span>
                </label>
                {errorLoginEmail && <div className="error-message">{errorLoginEmail}</div>}

                <label className="label-input">
                  <i className="fas fa-lock icon" />
                  <input
                    type="password"
                    placeholder=" "
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    aria-label="Senha"
                  />
                  <span>Senha</span>
                </label>
                {errorLoginPassword && <div className="error-message">{errorLoginPassword}</div>}

                <a className="password-link" href="#" onClick={(e)=>e.preventDefault()}>esqueceu sua senha?</a>

                <button type="submit" className="btn btn-primary">
                  {loadingLogin ? "Entrando..." : "Login"}
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
