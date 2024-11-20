import { createContext, useContext, useReducer } from "react";
import { AuthContext } from "./AuthContext";

export const ChatContext = createContext();

export const ChatContextProvider = ({children}) => {
    const {currentUser} = useContext(AuthContext);
    const INITIAL_STATE = {
        chatId: "null",
        user: {},
        isGroup: false
    };

    const chatReducer = (state, action) => {
        switch (action.type) {
            case "CHANGE_USER":
                return {
                    user: {
                        ...action.payload,
                        // For groups, include the full members array
                        members: action.payload.isGroup ? action.payload.members : []
                    },
                    chatId: action.payload.isGroup 
                        ? action.payload.uid 
                        : currentUser.uid > action.payload.uid 
                            ? currentUser.uid + action.payload.uid 
                            : action.payload.uid + currentUser.uid,
                    isGroup: action.payload.isGroup || false
                };

            case "RESET":
                return INITIAL_STATE;

            default:
                return state;
        }
    };

    const [state, dispatch] = useReducer(chatReducer, INITIAL_STATE);

    return (
        <ChatContext.Provider value={{data:state, dispatch}}>
            {children}
        </ChatContext.Provider>
    );
};
/*
import { createContext, useContext, useReducer } from "react";
import { AuthContext } from "./AuthContext";

export const ChatContext = createContext();

export const ChatContextProvider = ({children}) => {
    const {currentUser} = useContext(AuthContext);
    const INITIAL_STATE = {
        chatId: "null",
        users: [],
    };

    const chatReducer = (state, action) => {
        switch (action.type) {
            case "ADD_USER":
                const newUsers = [...state.users, action.payload];
                const newChatId = newUsers.map(user => user.uid).sort().join("-");
                return {
                    ...state,
                    users: newUsers,
                    chatId: newChatId,
                };
            case "REMOVE_USER":
                const filteredUsers = state.users.filter(user => user.uid !== action.payload.uid);
                const updatedChatId = filteredUsers.map(user => user.uid).sort().join("-");
                return {
                    ...state,
                    users: filteredUsers,
                    chatId: updatedChatId,
                };
            default:
                return state;
        }
    };

    const [state, dispatch] = useReducer(chatReducer, INITIAL_STATE);

    return (
        <ChatContext.Provider value={{data: state, dispatch}}>
            {children}
        </ChatContext.Provider>
    );
}; */