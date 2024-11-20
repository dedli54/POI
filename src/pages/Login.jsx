import React, {useState} from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
//import add from "../img/a4.png";

const Login = () => {
    const [err, setErr] = useState(false);
    const navigate = useNavigate();


    const handleSubmit = async (e) => {
        e.preventDefault();
        const email = e.target[0].value;
        const password = e.target[1].value;

        //const auth = getAuth();
        try{
            await signInWithEmailAndPassword(auth, email, password);
            navigate("/");
        }catch(err){
            setErr(true);
        }
    };

    return (
        <div className="formContainer">
            <div className="formWrapper">
                <span className="logo">Chisme Express</span>
                <form onSubmit={handleSubmit}>
                    <input type="email" placeholder="Correo Electronico"/>
                    <input type="password" placeholder="Contraseña"/>
                    <button>Iniciar Sesión</button>
                    {err && <span>Favor de volver a intentar</span>}
                </form>
                <p>¿Aún no tienes una Cuenta? <Link to="/register"> Registrarse </Link></p>
            </div>
        </div>
    );
};

export default Login;
