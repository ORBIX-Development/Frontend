import React from "react";

const Logout = () => {
    const handleLogout = () => {
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        window.location.href = '/Login';
    };

    return (
        <button onClick={handleLogout}>Logout</button>
    );
};

export default Logout;
