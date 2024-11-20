import React, { useContext, useRef, useState } from "react";
import Cam from "../img/cam.png";
import Add from "../img/add.png";
import More from "../img/more.png";
import Messages from "./Messages";
import Input from "./Input";
import GroupInput from "./GroupInput";
import GroupSearch from "./GroupSearch";
import UnifiedInput from "./UnifiedInput";
import { ChatContext } from "../context/ChatContext";

const Chat = () => {
    const { data } = useContext(ChatContext);
    const videoCallWindowRef = useRef(null);
    const [isButtonActive, setIsButtonActive] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showGroupModal, setShowGroupModal] = useState(false);

    // Función para abrir la videollamada en una nueva ventana
    const handleVideoCallClick = () => {
        videoCallWindowRef.current = window.open('/videocall', '_blank', 'width=800,height=600');
    };

    // Función para cerrar la ventana de videollamada
    const closeVideoCallWindow = () => {
        if (videoCallWindowRef.current) {
            videoCallWindowRef.current.close();
            videoCallWindowRef.current = null;
        }
    };

    // Función para alternar el estado del botón
    const toggleButtonState = () => {
        setIsLoading(true);
        const randomDelay = Math.floor(Math.random() * (3500 - 1000 + 1)) + 1000;
        setTimeout(() => {
            setIsButtonActive(prevState => !prevState);
            setIsLoading(false);
            window.location.reload();
        }, randomDelay);
    };

    // Función para manejar el click en Add
    const handleAddClick = () => {
        setShowGroupModal(true);
    };

    return (
        <div className="chat">
            <div className="chatInfo">
                <span>{data.user?.displayName}</span>
                <div className="chatIcons">
                    <button onClick={toggleButtonState} disabled={isLoading}>
                        {isLoading ? "Cargando..." : isButtonActive ? "Datos encriptados" : "Datos no encriptados"}
                    </button>
                    <img src={Cam} alt="Video Call" onClick={handleVideoCallClick} />
                    <img src={Add} alt="Add" onClick={handleAddClick} />
                    <img src={More} alt="More Options" />
                </div>
            </div>
            <Messages />
            <UnifiedInput />

            {/* Modal para crear grupo */}
            {showGroupModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Crear Nuevo Grupo</h3>
                            <button 
                                className="close-button"
                                onClick={() => setShowGroupModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <GroupSearch onGroupCreated={() => setShowGroupModal(false)} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chat;