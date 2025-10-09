import HomeBtn from '../../objects/HomeBtn';
import PerfilBtn from '../../objects/PerfilBtn';
import ConsultasBtn from '../../objects/ConsultasBtn';
import MedConsultas from '../../objects/medConsultas';
import GerenConsulta from '../../objects/GerenConsulta';
import AtendimentosBtn from '../../objects/AtendimentosBtn';
import AgendamentosBtn from '../../objects/AgendamentosBtn';
import GerenciarUserBtn from '../../objects/GerenUserBtn';
import logoSrc from '../../assets/lifeplus.png';
import './header.css';

const Header = ({ role }) => {
  // obter cargo do prop ou localStorage (assumption: chave 'userRole')
  const userRole = (
    role ||
    localStorage.getItem('userRole') ||
    ''
  ).toLowerCase();

  const buttonsByRole = {
    cliente: [
      <HomeBtn key="home" />,
      <ConsultasBtn key="consultas" />,
      <AgendamentosBtn key="agendamentos" />,
      <PerfilBtn key="perfil" />,
    ],
    medico: [
      <HomeBtn key="home" />,
      <MedConsultas key="medconsultas" />,
      <AtendimentosBtn key="atendimentos" />,
      <PerfilBtn key="perfil" />,
    ],
    secretaria: [
      <HomeBtn key="home" />,
      <GerenConsulta key="gerenconsultas" />,
      <AgendamentosBtn key="agendamentos" />,
      <PerfilBtn key="perfil" />,
    ],
    admin: [
      <HomeBtn key="home" />,
      <GerenciarUserBtn key="gerenuser" />,
      <PerfilBtn key="perfil" />,
    ],
  };

  // se não houver cargo (usuário não logado), mostrar apenas Home (evita botões que levam a rotas protegidas)
  const buttons = userRole
    ? buttonsByRole[userRole] || buttonsByRole['cliente']
    : [<HomeBtn key="home" />];

  const rawName = localStorage.getItem('userName') || '';
  const userName = rawName || '';
  const initials = (
    userName
      ? userName
          .split(' ')
          .map((p) => p[0])
          .filter(Boolean)
          .slice(0, 2)
          .join('')
      : 'U'
  ).toUpperCase();

  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-left">
          <img src={logoSrc} alt="ORBIX" className="brand-logo" />
          <div className="brand-text">
            <span className="brand-name">Life+</span>
            <span className="brand-sub">Cuidando da sua saúde</span>
          </div>
        </div>

        <nav className="header-nav">
          {buttons.map((btn, i) => (
            <span className="header-btn" key={i}>
              {btn}
            </span>
          ))}
        </nav>

        <div className="header-right">
          <div className="user-info">
            <div className="user-avatar">{initials}</div>
            <div className="user-meta">
              <div className="user-name">{userName || 'Convidado'}</div>
              <div className="user-role">
                {userRole
                  ? userRole.charAt(0).toUpperCase() + userRole.slice(1)
                  : ''}
              </div>
            </div>
          </div>
          <button
            className="Btn"
            onClick={() => {
              localStorage.clear();
              window.location.href = '/';
            }}
          >
            Logout
          </button>
          {/* <Logout /> */}
        </div>
      </div>
    </header>
  );
};

export default Header;
