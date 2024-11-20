import React, { useContext } from "react";
//import add from "../img/a5.jpg";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
    const {currentUser} = useContext(AuthContext)

    return (
        <div className="navbar">
            <span className="logo">Chisme Express</span>
            <div className="user">
                <img src={currentUser.photoURL} alt="" />
                <span>{currentUser.displayName}</span>
                <button onClick={()=>signOut(auth)}>Cerrar sesión</button>
            </div>
        </div>
    )
}

export default Navbar