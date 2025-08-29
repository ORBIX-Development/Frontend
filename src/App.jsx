import React, { useState } from 'react';
import './App.css';

function App() {
  const [isSignIn, setIsSignIn] = useState(false);

  const handleSignIn = () => {
    setIsSignIn(true);
  };

  const handleSignUp = () => {
    setIsSignIn(false);
  };

  return (
    <div className={`container ${isSignIn ? 'sign-in-js' : 'sign-up-js'}`}>
      <div className="content first-content">
        <div className="first-column">
          <h2 className="title title-primary">Bem vindo de volta!</h2>
          <p className="description description-primary">Para se manter conectado</p>
          <p className="description description-primary">faça login com suas informações pessoais</p>
          <button id="signin" className="btn btn-primary" onClick={handleSignIn}>
            Login
          </button>
        </div>
        <div className="second-column">
          <h2 className="title title-second">crie sua conta</h2>
          <div className="social-media">
            <ul className="list-social-media">
              <a className="link-social-media" href="#">
                <li className="item-social-media">
                  <i className="fab fa-facebook-f"></i>
                </li>
              </a>
              <a className="link-social-media" href="#">
                <li className="item-social-media">
                  <i className="fab fa-google-plus-g"></i>
                </li>
              </a>
              <a className="link-social-media" href="#">
                <li className="item-social-media">
                  <i className="fab fa-linkedin-in"></i>
                </li>
              </a>
            </ul>
          </div>
          <p className="description description-second">ou use seu email para se registrar:</p>
          <form className="form">
    <label className="label-input">
        <i className="far fa-user icon-modify"></i>
        <input type="text" placeholder=" " />
        <span>Nome</span>
    </label>

    <label className="label-input">
        <i className="far fa-envelope icon-modify"></i>
        <input type="email" placeholder=" " />
        <span>Email</span>
    </label>

    <label className="label-input">
        <i className="fas fa-lock icon-modify"></i>
        <input type="password" placeholder=" " />
        <span>Senha</span>
    </label>

    <button className="btn btn-second">Registre-se</button>
</form>
        </div>
      </div>
      <div className="content second-content">
        <div className="first-column">
          <h2 className="title title-primary">seja bem vindo!</h2>
          <p className="description description-primary">insira suas informações de cadastro</p>
          <p className="description description-primary">e inicie sua jornada com a gente</p>
          <button id="signup" className="btn btn-primary" onClick={handleSignUp}>
            Registre-se
          </button>
        </div>
        <div className="second-column">
          <h2 className="title title-second">Faça login na sua conta</h2>
          <div className="social-media">
            <ul className="list-social-media">
              <a className="link-social-media" href="#">
                <li className="item-social-media">
                  <i className="fab fa-facebook-f"></i>
                </li>
              </a>
              <a className="link-social-media" href="#">
                <li className="item-social-media">
                  <i className="fab fa-google-plus-g"></i>
                </li>
              </a>
              <a className="link-social-media" href="#">
                <li className="item-social-media">
                  <i className="fab fa-linkedin-in"></i>
                </li>
              </a>
            </ul>
          </div>
          <p className="description description-second">Ou use o seu email cadastrado:</p>
          <form className="form">
    <label className="label-input">
        <i className="far fa-envelope icon-modify"></i>
        <input type="email" placeholder=" " />
        <span>Email</span>
    </label>

    <label className="label-input">
        <i className="fas fa-lock icon-modify"></i>
        <input type="password" placeholder=" " />
        <span>Senha</span>
    </label>

    <a className="password" href="#">
        esqueceu sua senha?
    </a>
    <button className="btn btn-second">Login</button>
</form>
        </div>
      </div>
    </div>
  );
}

export default App;