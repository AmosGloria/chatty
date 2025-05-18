import React, { useState, useRef, useEffect, useContext } from 'react';
import EmojiPicker from 'emoji-picker-react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { UserContext } from '../../UserContext';

const socket = io('http://localhost:5000', { withCredentials: true });

const getUserIdFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload).userId;
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
};

const MessageBox = ({ channelId }) => {
  const { user } = useContext(UserContext);
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [feedback, setFeedback] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userId = getUserIdFromToken();
    if (!userId) {
      setFeedback('User not authenticated.');
      return;
    }

    const data = {
      text: message,
      userId,
      channelId,
      conversationId: null,
    };

    try {
      await axios.post('http://localhost:5000/api/messages', data, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      socket.emit('sendMessage', {
        channelId,
        message: {
          content: message,
          username: user.name,
          profileImage: user.profileImage,
        },
      });

      setMessage('');
      setFeedback('');
    } catch (error) {
      console.error('Error sending message:', error);
      setFeedback('Failed to send message');
    }
  };

  const handleEmojiClick = (emojiData) => {
    const emoji = emojiData.emoji;
    const cursorPos = textareaRef.current.selectionStart;
    const newText = message.slice(0, cursorPos) + emoji + message.slice(cursorPos);
    setMessage(newText);

    setTimeout(() => {
      textareaRef.current.focus();
      textareaRef.current.selectionEnd = cursorPos + emoji.length;
    }, 0);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        position: 'fixed',
        bottom: '20px',
        left: '450px',
        zIndex: 1000,
      }}
    >
      {/* Profile Picture */}
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '8px',
          background: user.profileImage ? 'transparent' : '#FFA78D',
          overflow: 'hidden',
          marginRight: '12px',
          flexShrink: 0,
        }}
      >
        {user.profileImage ? (
          <img
            src={user.profileImage}
            alt={user.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
          >
            {user.name[0]}
          </span>
        )}
      </div>

      {/* Message Box */}
      <div
        style={{
          width: '608px',
          minHeight: '96px',
          borderRadius: '10px',
          border: '1px solid #DDDDDD',
          background: '#FFFFFF',
          padding: '16px',
          boxShadow: '0px 1.02px 2.29px #00000021, 0px 0.19px 0.57px #0000001C',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            style={{
              flex: 1,
              resize: 'none',
              overflow: 'hidden',
              fontSize: '14px',
              border: 'none',
              outline: 'none',
              lineHeight: '1.5',
            }}
            rows={1}
          />

          <button
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            style={{ fontSize: '18px', background: 'none', border: 'none', cursor: 'pointer' }}
            title="Emoji"
          >
            😊
          </button>

          <button
            onClick={handleSendMessage}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            title="Send"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              strokeWidth={1.5} stroke="#000" width="24" height="24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
            </svg>
          </button>
        </div>

        {showEmojiPicker && (
          <div style={{ position: 'absolute', bottom: '110%', right: '10px', zIndex: 999 }}>
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}
      </div>

      {/* Feedback */}
      {feedback && <p style={{ marginTop: '12px', color: '#FF0000' }}>{feedback}</p>}
    </div>
  );
};

export default MessageBox;
