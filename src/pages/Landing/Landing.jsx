import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';
import heroDoctor from '../../assets/hero-doctor.svg';
import heroConnection from '../../assets/hero-connection.svg';
import logoImg from '../../assets/imagemReal.png';

const Landing = () => {
  const navigate = useNavigate();

  const goToLogin = () => navigate('/auth?mode=login');
  const goToRegister = () => navigate('/auth?mode=register');

  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="landing-logo">
          <img src={logoImg} alt="OrbiX Development" className="landing-logo-img" />
        </div>
        <nav className="landing-nav">
          <button className="landing-link" onClick={goToLogin}>Entrar</button>
          <button className="landing-btn-primary" onClick={goToRegister}>Criar conta</button>
        </nav>
      </header>

      <main className="landing-main">
        <section className="landing-hero">
          <div className="landing-hero-panel">
            <h1>Gestão clínica simples, conectada e humana.</h1>
            <p>
              Life+ é uma plataforma completa de gestão clínica desenvolvida para aproximar pacientes e profissionais de saúde de maneira simples, moderna e eficiente.
Com ela, consultas, informações médicas e acompanhamentos passam a ser centrados em um único ambiente digital, reduzindo a necessidade de retornos presenciais e eliminando etapas burocráticas.
            </p>
            <div className="landing-cta">
              <button className="landing-btn-primary" onClick={goToRegister}>Começar agora</button>
              <button className="landing-btn-secondary" onClick={goToLogin}>Já tenho conta</button>
            </div>
            <ul className="landing-highlights">
              <li>Agendamentos organizados em um só lugar</li>
              <li>Acesso rápido ao histórico de consultas e receitas</li>
              <li>Comunicação prática entre pacientes e médicos</li>
            </ul>
          </div>
        </section>

        <section className="landing-illustrations">
          <div className="landing-card">
            <img src={heroDoctor} alt="Profissional de saúde consultando prontuário digital" />
            <p>Profissionais com visão completa do histórico clínico, em poucos cliques.</p>
          </div>
          <div className="landing-card">
            <img src={heroConnection} alt="Paciente e médico conectados online" />
            <p>Pacientes conectados com o cuidado certo, sem depender apenas de retornos presenciais.</p>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <span>© {new Date().getFullYear()} <button className="landing-link"><a href="https://www.instagram.com/orbixdevelopment/#">OrbiX Development.</a></button>  Todos os direitos reservados.</span>
        
      </footer>
    </div>
  );
};

export default Landing;
