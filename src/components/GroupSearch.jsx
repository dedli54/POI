import { collection, query, where, getDocs, getDoc, doc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { db } from "../firebase";

const GroupSearch = () => {
    const [groupName, setGroupName] = useState("");
    const [searchUsername, setSearchUsername] = useState("");
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [err, setErr] = useState(false);
    
    const { currentUser } = useContext(AuthContext);

    const handleSearch = async () => {
        const q = query(
            collection(db, "users"),
            where("displayName", "==", searchUsername)
        );
        
        try {
            const querySnapshot = await getDocs(q);
            const results = [];
            querySnapshot.forEach((doc) => {
                // No incluir al usuario actual en los resultados
                if (doc.data().uid !== currentUser.uid) {
                    results.push(doc.data());
                }
            });
            setSearchResults(results);
            setErr(false);
        } catch (err) {
            setErr(true);
        }
    };

    const handleSelectUser = (user) => {
        if (!selectedUsers.find(u => u.uid === user.uid)) {
            setSelectedUsers([...selectedUsers, user]);
        }
        setSearchResults([]);
        setSearchUsername("");
    };

    const removeSelectedUser = (userId) => {
        setSelectedUsers(selectedUsers.filter(user => user.uid !== userId));
    };

    const createGroupChat = async () => {
        if (groupName.trim() === "" || selectedUsers.length === 0) return;

        try {
            const groupId = `group_${Date.now()}`;
            
            // Crear el documento del chat grupal
            await setDoc(doc(db, "groupChats", groupId), {
                groupName,
                createdBy: currentUser.uid,
                createdAt: serverTimestamp(),
                members: [
                    {
                        uid: currentUser.uid,
                        displayName: currentUser.displayName,
                        photoURL: currentUser.photoURL
                    },
                    ...selectedUsers
                ],
                messages: []
            });

            // Actualizar userChats para cada miembro del grupo
            const groupInfo = {
                groupId,
                groupName,
                members: [
                    {
                        uid: currentUser.uid,
                        displayName: currentUser.displayName,
                        photoURL: currentUser.photoURL
                    },
                    ...selectedUsers
                ],
                lastMessage: {
                    text: "Grupo creado"
                },
                date: serverTimestamp()
            };

            // Actualizar para el creador del grupo
            await updateDoc(doc(db, "userChats", currentUser.uid), {
                [`group_${groupId}`]: groupInfo
            });

            // Actualizar para cada miembro seleccionado
            for (const user of selectedUsers) {
                await updateDoc(doc(db, "userChats", user.uid), {
                    [`group_${groupId}`]: groupInfo
                });
            }

            // Limpiar el formulario
            setGroupName("");
            setSelectedUsers([]);
            
        } catch (err) {
            console.error("Error creating group chat:", err);
            setErr(true);
        }
    };

    return (
        <div className="groupSearch">
            <div className="createGroup">
                <input
                    type="text"
                    placeholder="Nombre del grupo"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                />
                <div className="searchMembers">
                    <input
                        type="text"
                        placeholder="Buscar usuarios"
                        value={searchUsername}
                        onChange={(e) => setSearchUsername(e.target.value)}
                        onKeyDown={(e) => e.code === "Enter" && handleSearch()}
                    />
                </div>
                
                {/* Mostrar usuarios seleccionados */}
                <div className="selectedUsers">
                    {selectedUsers.map((user) => (
                        <div key={user.uid} className="selectedUser">
                            <img src={user.photoURL} alt="" />
                            <span>{user.displayName}</span>
                            <button onClick={() => removeSelectedUser(user.uid)}>X</button>
                        </div>
                    ))}
                </div>

                {/* Resultados de búsqueda */}
                {searchResults.map((user) => (
                    <div
                        key={user.uid}
                        className="userSearchResult"
                        onClick={() => handleSelectUser(user)}
                    >
                        <img src={user.photoURL} alt="" />
                        <span>{user.displayName}</span>
                    </div>
                ))}

                <button onClick={createGroupChat}>Crear Grupo</button>
            </div>
        </div>
    );
};

export default GroupSearch;