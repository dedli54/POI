import React, { useContext, useState} from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import Img from "../img/img.png";
import Attach from "../img/attach.png";
import { arrayUnion, doc, serverTimestamp, Timestamp, updateDoc } from "firebase/firestore";
import { db, storage } from "../firebase";
import { v4 as uuid } from "uuid";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

const Input = () => {
    const [ text, setText ] = useState("");
    const [ img, setImg ] = useState(null);
    const [ fileI, setFileI ] = useState("");

    const {currentUser} = useContext(AuthContext)
    const {data} = useContext(ChatContext)

    const handleSend = async () => {

        if (img){
            const storageRef = ref(storage, uuid());

            const uploadTask = uploadBytesResumable(storageRef, img);

            uploadTask.on(
                (error) => {
                    //setErr(true);
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then( async (downloadURL) => {
                    //getDownloadURL(storageRef).then(async (downloadURL) => {
                        await updateDoc(doc(db, "chats", data.chatId), {
                            messages: arrayUnion({
                                id: uuid(),
                                text,
                                senderId: currentUser.uid,
                                date: Timestamp.now(),
                                img: downloadURL,
                            }),
            
                        });
    
                    });
                }
                );

        }
        else if (fileI){
            const storageRef = ref(storage, uuid());

            const uploadTask = uploadBytesResumable(storageRef, fileI);

            uploadTask.on(
                (error) => {
                    //setErr(true);
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then( async (downloadURL) => {
                    //getDownloadURL(storageRef).then(async (downloadURL) => {
                        await updateDoc(doc(db, "chats", data.chatId), {
                            messages: arrayUnion({
                                id: uuid(),
                                text,
                                senderId: currentUser.uid,
                                date: Timestamp.now(),
                                img,
                                file: downloadURL,
                            }),
            
                        });
    
                    });
                }
                );

        }else{
            await updateDoc(doc(db, "chats", data.chatId), {
                messages: arrayUnion({
                    id: uuid(),
                    text,
                    senderId: currentUser.uid,
                    date: Timestamp.now(),
                }),

            });
        }

        await updateDoc(doc(db, "userChats", currentUser.uid), {
            [data.chatId + ".lastMessage"]:{
                text
            },
            [data.chatId + ".date"]: serverTimestamp(),
        });

        await updateDoc(doc(db, "userChats", data.user.uid), {
            [data.chatId + ".lastMessage"]:{
                text
            },
            [data.chatId + ".date"]: serverTimestamp(),
        }); 

        setText("");
        setImg(null);
        setFileI(null);
    };

    return (
        <div className="input">
            <input type="text" placeholder="Escribe un Mensaje..." onChange={e=>setText(e.target.value)} value={text}/>
            <div className="send">
                <input accept="image/*" type="file" style={{display:"none"}} id="img" onChange={e=>setImg(e.target.files[0])}/>
                <label htmlFor="img">
                    <img src={Img} alt="" />
                </label>
                <div className="send1">
                    <input accept="file/*" type="file" style={{display:"none"}} id="file" onChange={e=>setFileI(e.target.files[0])}/>
                    <label htmlFor="file">
                        <img src={Attach} alt="" />
                    </label>
                </div>
            </div>
            <button onClick={handleSend}> Enviar </button>
        </div>
    )
}

export default Input