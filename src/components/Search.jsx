import { collection, query, where, getDocs, getDoc, doc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import React, { useState } from "react";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import {db} from "../firebase";

const Search = () => {
    const [username, setUsername] = useState("");
    const [user, setUser] = useState(null);
    const [group, setGroup] = useState(null);
    const [err, setErr] = useState(false);

    const {currentUser} = useContext(AuthContext)
    const {dispatch} = useContext(ChatContext);

    const handleSearch = async () => {
        // Reset states
        setUser(null);
        setGroup(null);
        setErr(false);

        try {
            // Search for users
            const userQuery = query(
                collection(db, "users"),
                where("displayName", "==", username)
            );
            const userSnapshot = await getDocs(userQuery);
            
            // Search for groups
            const groupQuery = query(
                collection(db, "groupChats"),
                where("groupName", "==", username)
            );
            const groupSnapshot = await getDocs(groupQuery);

            userSnapshot.forEach((doc) => {
                setUser(doc.data());
            });

            groupSnapshot.forEach((doc) => {
                const groupData = doc.data();
                // Only show groups where the current user is a member
                if (groupData.members.some(member => member.uid === currentUser.uid)) {
                    setGroup({ ...groupData, id: doc.id });
                }
            });

            if (userSnapshot.empty && groupSnapshot.empty) {
                setErr(true);
            }
        } catch(err) {
            setErr(true);
        }
    };

    const handleKey = (e) => {
        e.code === "Enter" && handleSearch();
    };

    const handleSelectUser = async () => {
        const combineId = 
            currentUser.uid > user.uid 
            ? currentUser.uid + user.uid 
            : user.uid + currentUser.uid;
        try {
            const res = await getDoc(doc(db, "chats", combineId));

            if(!res.exists()){
                await setDoc(doc(db, "chats", combineId), { messages: [] });

                await updateDoc(doc(db, "userChats", currentUser.uid),{
                    [combineId+".userInfo"]:{
                        uid: user.uid,
                        displayName: user.displayName,
                        photoURL: user.photoURL,
                    },
                    [combineId+".date"]: serverTimestamp()
                });
                
                await updateDoc(doc(db, "userChats", user.uid),{
                    [combineId+".userInfo"]:{
                        uid: currentUser.uid,
                        displayName: currentUser.displayName,
                        photoURL: currentUser.photoURL,
                    },
                    [combineId+".date"]: serverTimestamp()
                });
            }
        } catch(err){}
        
        dispatch({ type: "CHANGE_USER", payload: user });
        setUser(null);
        setUsername("");
    };

    const handleSelectGroup = () => {
        dispatch({ 
            type: "CHANGE_USER", 
            payload: { 
                uid: group.id,
                displayName: group.groupName,
                photoURL: group.photoURL || "default-group-photo.png",
                isGroup: true
            } 
        });
        setGroup(null);
        setUsername("");
    };

    return (
        <div className="search">
            <div className="searchForm">
                <input 
                    type="text"  
                    placeholder="Buscar..." 
                    onKeyDown={handleKey} 
                    onChange={(e)=>setUsername(e.target.value)}
                    value={username}
                />
            </div>
            {err && <span>¡No se encontraron resultados!</span>}
            
            {user && (
                <div className="userChat" onClick={handleSelectUser}>
                    <img src={user.photoURL} alt="" />
                    <div className="userChatInfo">
                        <span>{user.displayName}</span>
                        <p>Usuario</p>
                    </div>
                </div>
            )}

            {group && (
                <div className="userChat groupChat" onClick={handleSelectGroup}>
                    <img src={group.photoURL || "default-group-photo.png"} alt="" />
                    <div className="userChatInfo">
                        <span>{group.groupName}</span>
                        <p>Grupo • {group.members.length} miembros</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Search;