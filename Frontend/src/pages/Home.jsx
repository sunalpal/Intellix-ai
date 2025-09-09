import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import ChatMobileBar from '../components/chat/ChatMobileBar.jsx';
import ChatSidebar from '../components/chat/ChatSidebar.jsx';
import ChatMessages from '../components/chat/ChatMessages.jsx';
import ChatComposer from '../components/chat/ChatComposer.jsx';
import   '../components/chat/ChatLayout.css';

import { useDispatch, useSelector } from 'react-redux';
const apiUrl = import.meta.env.VITE_API_URL;

import {
  
  startNewChat,
  selectChat,
  setInput,
  sendingStarted,
  sendingFinished,

 
  setChats
} from '../store/chatSlice.js';

const Home = () => {
  const dispatch = useDispatch();
  const chats = useSelector(state => state.chat.chats);
  const activeChatId = useSelector(state => state.chat.activeChatId);
  const input = useSelector(state => state.chat.input);
  const isSending = useSelector(state => state.chat.isSending);
  const [ sidebarOpen, setSidebarOpen ] = React.useState(false);
  const [ socket, setSocket ] = useState(null);

  // const activeChat = chats.find(c => c.id === activeChatId) || null;

  const [ messages, setMessages ] = useState([
    // {
    //   type: 'user',
    //   content: 'Hello, how can I help you today?'
    // },
    // {
    //   type: 'ai',
    //   content: 'Hi there! I need assistance with my account.'
    // }
  ]);

  const handleNewChat = async () => {
    // Prompt user for title of new chat, fallback to 'New Chat'
    let title = window.prompt('Enter a title for the new chat:', '');
    if (title) title = title.trim();
    if (!title) return

    const response = await axios.post("https://intellix-ai.onrender.com/api/chat", {
      title
    }, {
      withCredentials: true
    })
    getMessages(response.data.chat._id);
    dispatch(startNewChat(response.data.chat));
    setSidebarOpen(false);

  }

  
  // Ensure at least one chat exists initially
  useEffect(() => {
    const token = localStorage.getItem('token'); // or change key to whatever your login stores

    if (token) {
      // Attach token to all axios requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // If backend uses cookie-based auth, also enable credentials:
      axios.defaults.withCredentials = true;
    } else {
      // no token → avoid calls that require auth (or redirect to login)
    }

    // initialize socket client with token auth and explicit transports
    const socket = io(apiUrl || 'https://intellix-ai.onrender.com', {
      auth: { token },            // server can access via socket.handshake.auth.token
      transports: ['websocket'],  // prefer websocket (helps avoid polling race)
      withCredentials: true
    });

    socket.on("ai-response", (messagePayload) => {
      console.log("Received AI response:", messagePayload);

      setMessages((prevMessages) => [ ...prevMessages, {
        type: 'ai',
        content: messagePayload.content
      } ]);

      dispatch(sendingFinished());
    });

    setSocket(socket);

    axios.get("https://intellix-ai.onrender.com/api/chat", { withCredentials: true })
      .then(response => {
        dispatch(setChats(response.data.chats.reverse()));
      })

    return () => {
      socket.disconnect();
    };
  }, []);

  const sendMessage = async () => {

    const trimmed = input.trim();
    console.log("Sending message:", trimmed);
    if (!trimmed || !activeChatId || isSending) return;
    dispatch(sendingStarted());

    const newMessages = [ ...messages, {
      type: 'user',
      content: trimmed
    } ];

    console.log("New messages:", newMessages);

    setMessages(newMessages);
    dispatch(setInput(''));

    socket.emit("ai-message", {
      chat: activeChatId,
      content: trimmed
    })

  
  }

  const getMessages = async (chatId) => {

   const response = await  axios.get(`https://intellix-ai.onrender.com/api/chat/messages/${chatId}`, { withCredentials: true })

   console.log("Fetched messages:", response.data.messages);

   setMessages(response.data.messages.map(m => ({
     type: m.role === 'user' ? 'user' : 'ai',
     content: m.content
   })));

  }


return (
  <div className="chat-layout minimal">
    <ChatMobileBar
      onToggleSidebar={() => setSidebarOpen(o => !o)}
      onNewChat={handleNewChat}
    />
    <ChatSidebar
      chats={chats}
      activeChatId={activeChatId}
      onSelectChat={(id) => {
        dispatch(selectChat(id));
        setSidebarOpen(false);
        getMessages(id);
      }}
      onNewChat={handleNewChat}
      open={sidebarOpen}
    />
    <main className="chat-main" role="main">
      {messages.length === 0 && (
        <div className="chat-welcome" aria-hidden="true">
          <div className="chip">Early Preview</div>
          <h1 >Intellix</h1>
          <p>Curious about something? Paste it here—whether it’s a quick question, a wild idea, or text you want reworked. Every chat stays in your sidebar, ready for you to pick up right where you left off.</p>
        </div>
      )}
      <ChatMessages messages={messages} isSending={isSending} />
      {
        activeChatId &&
        <ChatComposer
          input={input}
          setInput={(v) => dispatch(setInput(v))}
          onSend={sendMessage}
          isSending={isSending}
        />}
    </main>
    {sidebarOpen && (
      <button
        className="sidebar-backdrop"
        aria-label="Close sidebar"
        onClick={() => setSidebarOpen(false)}
      />
    )}
  </div>
);
};

export default Home;
