import { doc, onSnapshot } from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import { ChatContext } from "../context/ChatContext";
import { db } from "../firebase";
import Message from "./Message";

const Messages = () => {
    const [messages, setMessages] = useState([]);
    const { data } = useContext(ChatContext);

    useEffect(() => {
        if (!data.chatId) return;

        // Determine if it's a group chat based on the chatId format
        const isGroupChat = data.user?.isGroup;
        const collectionName = isGroupChat ? "groupChats" : "chats";

        const unSub = onSnapshot(doc(db, collectionName, data.chatId), (doc) => {
            if (doc.exists()) {
                setMessages(doc.data().messages || []);
            }
        });

        return () => {
            unSub();
        };
    }, [data.chatId, data.user]);

    return (
        <div className="messages">
            {messages.map((m) => (
                <Message message={m} key={m.id} />
            ))}
        </div>
    );
};

export default Messages;