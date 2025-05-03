import React, { useState, useRef, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react';


const MessageBox = ({ onSend, user = { name: 'John Doe', profileImage: '' } }) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef(null);

  // Auto-expand logic
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage('');
    }
  };

  const handleEmojiClick = (emojiData) => {
    const emoji = emojiData.emoji;
    const cursorPos = textareaRef.current.selectionStart;
    const newText =
      message.slice(0, cursorPos) + emoji + message.slice(cursorPos);
    setMessage(newText);
    setTimeout(() => {
      textareaRef.current.focus();
      textareaRef.current.selectionEnd = cursorPos + emoji.length;
    }, 0);
  };

  return (
    <div
      style={{
        width: '608px',
        height: '96px',
        top: '400px',
        left: '450px',
        borderRadius: '10px',
        border: '1px solid #DDDDDD',
        position:'absolute',
        background: '#FFFFFF',
        padding: '16px',
        boxShadow:'0px 1.02px 2.29px 0px #00000021, 0px 0.19px 0.57px 0px #0000001C',
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

      {/* Message Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Textarea */}
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

          {/* Paperclip icon */}
          <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} title="Attach">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="#000"
              width="24"
              height="24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13"
              />
            </svg>
          </button>

          {/* Emoji toggle */}
          <button
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            style={{
              fontSize: '18px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
            title="Emoji"
          >
            😊
          </button>

          {/* Send button */}
          <button
            onClick={handleSend}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
            title="Send"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="#000"
              width="24"
              height="24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
              />
            </svg>
          </button>
        </div>

        {showEmojiPicker && (
          <div style={{ position: 'absolute', bottom: '110%', right: '10px', zIndex: 999 }}>
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBox;
