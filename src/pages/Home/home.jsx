import React from "react";
import "./Home.css";
import Header from '../../components/Header/header.jsx';
import fotoDoutor from '../../assets/doutor2.png';

const Home = () => {
  return (
    <div className="home-container">
      <Header />

      <main className="home-main">
        <section className="home-content">
          <div className="Texto">
            <h1 className="welcome-title">Centralize sua rotina clínica em um só lugar.</h1>
            <h2 className="welcome-subtitle">
              Agendamentos, consultas, receitas e pacientes conectados de forma simples.
            </h2>
            <p className="description-text">
              Organize o dia a dia da clínica, reduza retrabalho e acompanhe de perto a jornada
              de cada paciente com um sistema pensado para médicos, equipes e pacientes.
            </p>
          </div>

          <div className="home-image-wrapper">
            <img src={fotoDoutor} alt="Médico atendendo paciente" className="doutor" />
          </div>
        </section>

        <section className="home-features">
          <div className="home-feature-card">
            <h3>Visão única da agenda</h3>
            <p>Veja rapidamente consultas do dia, status e horários, sem planilhas ou anotações soltas.</p>
          </div>
          <div className="home-feature-card">
            <h3>Histórico integrado</h3>
            <p>Receitas, atendimentos e dados essenciais centralizados para decisões mais rápidas.</p>
          </div>
          <div className="home-feature-card">
            <h3>Acompanhamento contínuo</h3>
            <p>Reduza retornos presenciais desnecessários e mantenha o cuidado ativo com cada paciente.</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
