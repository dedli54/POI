import { doc, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import { db } from "../firebase";

const Chats = () => {
    const [chats, setChats] = useState([]);
    const { currentUser } = useContext(AuthContext);
    const { dispatch } = useContext(ChatContext);

    useEffect(() => {
        if (!currentUser || !currentUser.uid) return;

        const getChats = () => {
            const unsub = onSnapshot(doc(db, "userChats", currentUser.uid), (doc) => {
                setChats(doc.data() || {});
            });

            return () => {
                unsub();
            };
        };

        getChats();
    }, [currentUser]);

    const handleSelect = (chatInfo, isGroup = false) => {
        dispatch({
            type: "CHANGE_USER",
            payload: isGroup ? {
                uid: chatInfo.groupId,
                displayName: chatInfo.groupName,
                photoURL: chatInfo.photoURL || "default-group-photo.png",
                members: chatInfo.members, // Pass the full members array
                isGroup: true
            } : chatInfo
        });
    };

    const processChats = () => {
        return Object.entries(chats)
            ?.sort((a, b) => b[1].date - a[1].date)
            .map((chat) => {
                const chatKey = chat[0];
                const chatData = chat[1];

                // Check if it's a group chat
                if (chatKey.startsWith('group_')) {
                    return {
                        key: chatKey,
                        isGroup: true,
                        info: chatData,
                        lastMessage: chatData.lastMessage,
                        date: chatData.date
                    };
                }

                // Regular chat
                if (!chatData.userInfo) return null;
                return {
                    key: chatKey,
                    isGroup: false,
                    info: chatData.userInfo,
                    lastMessage: chatData.lastMessage,
                    date: chatData.date
                };
            })
            .filter(Boolean); // Remove null entries
    };

    return (
        <div className="chats">
            {processChats().map((chat) => (
                <div
                    className={`userChat ${chat.isGroup ? 'groupChat' : ''}`}
                    key={chat.key}
                    onClick={() => handleSelect(chat.info, chat.isGroup)}
                >
                    <img 
                        src={chat.info.photoURL || "default-avatar.png"} 
                        alt="" 
                    />
                    <div className="userChatInfo">
                        <span>
                            {chat.isGroup ? chat.info.groupName : chat.info.displayName}
                        </span>
                        <p>{chat.lastMessage?.text || ""}</p>
                        {chat.isGroup && (
                            <small className="memberCount">
                                {chat.info.members?.length || 0} miembros
                            </small>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Chats;