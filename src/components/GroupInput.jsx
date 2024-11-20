import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import { arrayUnion, doc, serverTimestamp, Timestamp, updateDoc } from "firebase/firestore";
import { db, storage } from "../firebase";
import { v4 as uuid } from "uuid";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import Img from "../img/img.png";

const GroupInput = () => {
    const [text, setText] = useState("");
    const [img, setImg] = useState(null);
    const [fileI, setFileI] = useState("");

    const { currentUser } = useContext(AuthContext);
    const { data } = useContext(ChatContext);

    const handleSend = async () => {
        if (!text.trim() && !img && !fileI) return;

        const messageData = {
            id: uuid(),
            text,
            senderId: currentUser.uid,
            senderName: currentUser.displayName, // Añadimos el nombre del remitente
            date: Timestamp.now(),
        };

        try {
            if (img) {
                const storageRef = ref(storage, uuid());
                const uploadTask = uploadBytesResumable(storageRef, img);

                uploadTask.on(
                    "state_changed",
                    null,
                    (error) => {
                        console.error("Error uploading image:", error);
                    },
                    () => {
                        getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
                            messageData.img = downloadURL;
                            await updateGroupChat(messageData);
                        });
                    }
                );
            } else if (fileI) {
                const storageRef = ref(storage, uuid());
                const uploadTask = uploadBytesResumable(storageRef, fileI);

                uploadTask.on(
                    "state_changed",
                    null,
                    (error) => {
                        console.error("Error uploading file:", error);
                    },
                    () => {
                        getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
                            messageData.file = downloadURL;
                            await updateGroupChat(messageData);
                        });
                    }
                );
            } else {
                await updateGroupChat(messageData);
            }

            // Limpiar los campos después de enviar
            setText("");
            setImg(null);
            setFileI(null);
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const updateGroupChat = async (messageData) => {
        const groupRef = doc(db, "groupChats", data.chatId);
        const groupDoc = await groupRef.get();
        const groupData = groupDoc.data();

        // Actualizar el mensaje en el chat grupal
        await updateDoc(groupRef, {
            messages: arrayUnion(messageData),
        });

        // Actualizar el último mensaje para todos los miembros
        for (const member of groupData.members) {
            await updateDoc(doc(db, "userChats", member.uid), {
                [`group_${data.chatId}.lastMessage`]: {
                    text: messageData.text,
                },
                [`group_${data.chatId}.date`]: serverTimestamp(),
            });
        }
    };

    return (
        <div className="input">
            <input
                type="text"
                placeholder="Escribe un mensaje..."
                onChange={(e) => setText(e.target.value)}
                value={text}
            />
            <div className="send">
                <input
                    type="file"
                    style={{ display: "none" }}
                    id="file"
                    onChange={(e) => setImg(e.target.files[0])}
                />
                <label htmlFor="file">
                    <img src={Img} alt="" />
                </label>
                <button onClick={handleSend}>Enviar</button>
            </div>
        </div>
    );
};

export default GroupInput;