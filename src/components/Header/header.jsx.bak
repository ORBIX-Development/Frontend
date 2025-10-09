import HomeBtn from '../../objects/HomeBtn';
import PerfilBtn from '../../objects/PerfilBtn';
import ConsultasBtn from '../../objects/ConsultasBtn';
import MedConsultas from '../../objects/medConsultas';
import GerenConsulta from '../../objects/GerenConsulta';
import './header.css';
import GerenciarUserBtn from '../../objects/GerenUserBtn';

const Header = ({ role }) => {
    // obter cargo do prop ou localStorage (assumption: chave 'userRole')
    const userRole = (role || localStorage.getItem('userRole') || '').toLowerCase();

    const buttonsByRole = {
        cliente: [ <HomeBtn key="home" />,<ConsultasBtn key="consultas" />, <PerfilBtn key="perfil" />],
        medico: [<HomeBtn key="home" />, <MedConsultas key="medconsultas" />, <PerfilBtn key="perfil" />],
        secretaria: [<HomeBtn key="home" />, <GerenConsulta key="gerenconsultas" />, <PerfilBtn key="perfil" />],
        admin: [<HomeBtn key="home" />, <GerenciarUserBtn key="gerenuser" />, <PerfilBtn key="perfil" />],
    };

    const buttons = buttonsByRole[userRole] || buttonsByRole['cliente'];

    return (
        <header className="header">
            <nav className="header-nav">
                {buttons.map((btn, i) => (
                    <span className="header-btn" key={i}>{btn}</span>
                ))}
            </nav>
        </header>
    );
};

export default Header;