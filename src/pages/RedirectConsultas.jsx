import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ConsultasRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("userRole");

    if (!role) {
      navigate("/"); // volta pro login se não tiver token
      return;
    }

    switch (role.toLowerCase()) {
      case "cliente":
        navigate("/consultas");
        break;
      case "medico":
        navigate("/medconsultas");
        break;
      case "secretaria":
        navigate("/gerenconsultas");
        break;
      case "admin":
        navigate("/gerenuser");
        break;
      default:
        navigate("/home");
        break;
    }
  }, [navigate]);

  return <p>Carregando...</p>;
}
