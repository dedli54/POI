import DailyIframe from '@daily-co/daily-js';
import React, { useEffect, useRef, useState } from 'react';
import { db } from './firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import EndCall from './img/EndCall.png'; // Fixed case sensitivity in import

const VideoCall = () => {
    const videoCallRef = useRef(null);
    const [roomUrl, setRoomUrl] = useState(null);

    // Función para crear una sala y guardar la URL en Firestore
    const createRoom = async () => {
        const response = await fetch('https://api.daily.co/v1/rooms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer API_KEY`, // Reemplazar API_KEY con tu API Key de Daily.co
            },
            body: JSON.stringify({
                properties: {
                    enable_screenshare: false,
                    enable_chat: false,
                    max_participants: 2,
                    start_video_off: false,
                    start_audio_off: false,
                },
            }),
        });

        const room = await response.json();
        const roomUrl = room.url;
        setRoomUrl(roomUrl);

        // Guardar la URL en Firestore
        const roomRef = doc(db, 'videoCalls', 'currentRoom');
        await setDoc(roomRef, { roomUrl });
    };

    // Escuchar la URL de la sala en Firestore para unirse a la misma sala
    useEffect(() => {
        const roomRef = doc(db, 'videoCalls', 'currentRoom');
        const unsubscribe = onSnapshot(roomRef, (doc) => {
            setRoomUrl(doc.data()?.roomUrl);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (roomUrl) {
            const callFrame = DailyIframe.createFrame(videoCallRef.current, {
                showLeaveButton: true,
            });
            callFrame.join({ url: roomUrl });

            return () => callFrame.leave();
        }
    }, [roomUrl]);

    // Función para terminar la llamada y cerrar la ventana
    const endCall = () => {
        window.close();
    };

    return (
        <div>
            <div ref={videoCallRef} style={{ width: '100%', height: '500px' }} />
            <img 
                src={EndCall} 
                alt="End Call"
                onClick={endCall}
                style={{
                    cursor: 'pointer',
                    width: '40px',
                    height: '40px',
                    padding: '8px',
                    margin: '10px',
                    borderRadius: '50%',
                    backgroundColor: '#f2f2f2',
                    transition: 'all 0.3s ease'
                }}
                onMouseOver={e => e.target.style.backgroundColor = '#e0e0e0'}
                onMouseOut={e => e.target.style.backgroundColor = '#f2f2f2'}
            />
        </div>
    );
};

export default VideoCall;
