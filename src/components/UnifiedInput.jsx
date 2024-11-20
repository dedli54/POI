import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import { arrayUnion, doc, serverTimestamp, Timestamp, updateDoc, getDoc } from "firebase/firestore";
import { db, storage } from "../firebase";
import { v4 as uuid } from "uuid";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import Img from "../img/img.png";
import Attach from "../img/attach.png";
import Loc from "../img/location.png"; // Add location icon import
import LocationPreview from './LocationPreview';

const UnifiedInput = () => {
    const [text, setText] = useState("");
    const [img, setImg] = useState(null);
    const [fileI, setFileI] = useState("");
    const [location, setLocation] = useState(null); // Add location state
    const [locationPreview, setLocationPreview] = useState(null);

    const { currentUser } = useContext(AuthContext);
    const { data } = useContext(ChatContext);

    const handleSend = async () => {
        if (!text.trim() && !img && !fileI) return;

        try {
            const messageData = {
                id: uuid(),
                text,
                senderId: currentUser.uid,
                senderName: currentUser.displayName,
                date: Timestamp.now(),
            };

            if (data.isGroup) {
                await handleGroupMessage(messageData);
            } else {
                await handleDirectMessage(messageData);
            }

            // Clear inputs
            setText("");
            setImg(null);
            setFileI(null);
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const handleGroupMessage = async (messageData) => {
        const groupRef = doc(db, "groupChats", data.chatId);
        const groupDoc = await getDoc(groupRef);

        if (!groupDoc.exists()) {
            throw new Error("Group chat document doesn't exist");
        }

        const groupData = groupDoc.data();

        if (img || fileI) {
            const file = img || fileI;
            const storageRef = ref(storage, uuid());
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on(
                "state_changed",
                null,
                (error) => console.error("Error uploading file:", error),
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
                        if (img) messageData.img = downloadURL;
                        if (fileI) messageData.file = downloadURL;

                        await updateGroupMessage(groupRef, messageData, groupData);
                    });
                }
            );
        } else {
            await updateGroupMessage(groupRef, messageData, groupData);
        }
    };

    const updateGroupMessage = async (groupRef, messageData, groupData) => {
        await updateDoc(groupRef, {
            messages: arrayUnion(messageData),
        });

        // Update last message for all members
        for (const member of groupData.members) {
            await updateDoc(doc(db, "userChats", member.uid), {
                [`group_${data.chatId}.lastMessage`]: {
                    text: messageData.text,
                },
                [`group_${data.chatId}.date`]: serverTimestamp(),
            });
        }
    };

    const handleDirectMessage = async (messageData) => {
        if (img || fileI) {
            const file = img || fileI;
            const storageRef = ref(storage, uuid());
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on(
                "state_changed",
                null,
                (error) => console.error("Error uploading file:", error),
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
                        if (img) messageData.img = downloadURL;
                        if (fileI) messageData.file = downloadURL;

                        await updateDirectMessage(messageData);
                    });
                }
            );
        } else {
            await updateDirectMessage(messageData);
        }
    };

    const updateDirectMessage = async (messageData) => {
        await updateDoc(doc(db, "chats", data.chatId), {
            messages: arrayUnion(messageData),
        });

        // Update last message for both users
        await updateDoc(doc(db, "userChats", currentUser.uid), {
            [data.chatId + ".lastMessage"]: { text: messageData.text },
            [data.chatId + ".date"]: serverTimestamp(),
        });

        await updateDoc(doc(db, "userChats", data.user.uid), {
            [data.chatId + ".lastMessage"]: { text: messageData.text },
            [data.chatId + ".date"]: serverTimestamp(),
        });
    };

    const handleLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                const messageText = `📍 Mi ubicación: https://www.google.com/maps?q=${latitude},${longitude}`;
                const messageData = {
                    id: uuid(),
                    text: messageText,
                    senderId: currentUser.uid,
                    senderName: currentUser.displayName,
                    date: Timestamp.now(),
                    location: { latitude, longitude } // Add location data
                };

                if (data.isGroup) {
                    handleGroupMessage(messageData);
                } else {
                    handleDirectMessage(messageData);
                }
                setLocationPreview(null);
            });
        }
    };

    return (
        <div className="input">
            {locationPreview && (
                <div className="locationPreviewContainer">
                    <LocationPreview 
                        latitude={locationPreview.latitude} 
                        longitude={locationPreview.longitude} 
                        onClose={() => {
                            setLocationPreview(null);
                            setText("");
                        }}
                    />
                </div>
            )}
            <input
                type="text"
                placeholder="Escribe un mensaje..."
                onChange={(e) => setText(e.target.value)}
                value={text}
            />
            <div className="send">
                {/* Existing file inputs */}
                <input
                    type="file"
                    style={{ display: "none" }}
                    id="file"
                    onChange={(e) => setImg(e.target.files[0])}
                />
                <label htmlFor="file">
                    <img src={Img} alt="" />
                </label>
                <div className="send1">
                    <input
                        type="file"
                        style={{ display: "none" }}
                        id="attach"
                        onChange={(e) => setFileI(e.target.files[0])}
                    />
                    <label htmlFor="attach">
                        <img src={Attach} alt="" />
                    </label>
                </div>
                {/* Add location button */}
                <img 
                    src={Loc} 
                    alt="Location" 
                    onClick={handleLocation}
                    style={{
                        height: "24px",
                        cursor: "pointer",
                        marginRight: "10px"
                    }}
                />
                <button onClick={handleSend}>Enviar</button>
            </div>
        </div>
    );
};

export default UnifiedInput;