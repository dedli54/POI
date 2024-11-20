import React, { useContext, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import add from "../img/attach.png";

const Message = ({ message }) => {
    const { currentUser } = useContext(AuthContext);
    const { data } = useContext(ChatContext);
    const ref = useRef();

    const isLocationMessage = message.text?.includes("Mi ubicación: https://www.google.com/maps");
    const API_KEY = 'AIzaSyDF7DCgvnT9TyS-eWpm46d1wejbNCKdEyE';

    useEffect(() => {
        ref.current?.scrollIntoView({ behavior: "smooth" });
    }, [message]);

    const renderContent = () => {
        if (message.location) {
            const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${message.location.latitude},${message.location.longitude}&zoom=15&size=300x200&markers=color:red%7C${message.location.latitude},${message.location.longitude}&key=${API_KEY}`;
            return (
                <>
                    <p>{message.text}</p>
                    <img 
                        src={mapUrl} 
                        alt="Location Map"
                        style={{
                            width: '100%',
                            maxWidth: '300px',
                            borderRadius: '8px',
                            marginTop: '8px'
                        }}
                    />
                </>
            );
        }

        return (
            <p>{message.text 
                ? message.text 
                : message.img 
                    ? <img src={message.img} alt="" /> 
                    : message.file 
                        ? <a href={message.file} target="_blank" rel="noopener noreferrer">
                            <img src={add} alt="file" />
                          </a> 
                        : null
            }</p>
        );
    };

    return (
        <div ref={ref} className={`message ${message.senderId === currentUser.uid && "owner"}`}>
            <div className="messageInfo">
                <img 
                    src={
                        message.senderId === currentUser.uid
                            ? currentUser.photoURL
                            : data.isGroup 
                                ? data.user.members?.find(m => m.uid === message.senderId)?.photoURL || "default-avatar.png"
                                : data.user?.photoURL || "default-avatar.png"
                    } 
                    alt="" 
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "default-avatar.png";
                    }}
                />
                {data.isGroup && message.senderId !== currentUser.uid && (
                    <span className="senderName">{message.senderName}</span>
                )}
            </div>
            <div className="messageContent">
                {renderContent()}
            </div>
        </div>
    );
};

export default Message;