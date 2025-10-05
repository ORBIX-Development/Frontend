import React from "react";
import "./Home.css";
import Header from '../../components/Header/header.jsx';

const Home = () => {
  return (
    <body>
      <Header />

      <div className="home-content">
        <h1 className="welcome-title">Bem-vindo à Life+</h1>
        <h2 className="welcome-subtitle">
          Cuidando da sua saúde com dedicação!
        </h2>

        <p className="description-text">
          A Life+ é uma clínica moderna dedicada a oferecer serviços de saúde de
          alta qualidade. Nossa equipe experiente está comprometida em fornecer
          um atendimento personalizado e completo, garantindo o bem-estar de
          todos os nossos pacientes.
        </p>
      </div>
    </body>
  );
};

export default Home;
