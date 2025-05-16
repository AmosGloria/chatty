import React, { useState } from 'react';

const emojiList = ['👍', '❤️', '😂', '😮', '😢', '👏'];

const MessagesResponse = ({
  messages,
  user,
  onDelete,
  onReply,
  onReact,
  onCopy,
  onInfo,
  onSelect,
  onForward,
}) => {
  const [openMenuId, setOpenMenuId] = useState(null);
  const [emojiPickerId, setEmojiPickerId] = useState(null);
  const [selectedMessages, setSelectedMessages] = useState(new Set());

  const toggleMenu = (id) => {
    if (openMenuId === id) {
      setOpenMenuId(null);
      setEmojiPickerId(null);
    } else {
      setOpenMenuId(id);
      setEmojiPickerId(null);
    }
  };

  const toggleEmojiPicker = (id) => {
    setEmojiPickerId(emojiPickerId === id ? null : id);
  };

  const handleEmojiClick = (msgId, emoji) => {
    onReact && onReact(msgId, emoji);
    setEmojiPickerId(null);
    setOpenMenuId(null);
  };

  const handleCopyClick = (text) => {
    navigator.clipboard.writeText(text).then(() => alert('Copied to clipboard!'));
    setOpenMenuId(null);
  };

  const toggleSelectMessage = (msgId) => {
    const newSet = new Set(selectedMessages);
    if (newSet.has(msgId)) newSet.delete(msgId);
    else newSet.add(msgId);
    setSelectedMessages(newSet);
    setOpenMenuId(null);
  };

  return (
    <div>
      {messages.length === 0 && (
        <p style={{ color: '#888', textAlign: 'center' }}>No messages yet</p>
      )}

      {messages.map((msg, index) => {
        // Ensure unique key by prefixing id or falling back to index
        const key = msg.id !== undefined && msg.id !== null 
          ? `msg-${msg.id}` 
          : `index-${index}`;

        const isOwn = msg.user_id === user.id;
        const isSelected = selectedMessages.has(key);
        return (
          <div
            key={key}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              alignSelf: isOwn ? 'flex-end' : 'flex-start',
              flexDirection: isOwn ? 'row-reverse' : 'row',
              maxWidth: '90%',
              marginBottom: 16,
              border: isSelected ? '2px solid #4f46e5' : 'none',
              padding: isSelected ? 4 : 0,
              borderRadius: 8,
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                overflow: 'hidden',
                background: '#EEE',
                flexShrink: 0,
              }}
            >
              {msg.user_profile_image ? (
                <img
                  src={msg.user_profile_image}
                  alt={msg.user_name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : null }
            </div>

            {/* Message bubble */}
            <div
              style={{
                backgroundColor: isOwn ? '#DFF7E0' : '#F1F1F1',
                borderRadius: 8,
                padding: '10px 12px',
                boxShadow: '0 1px 5px rgba(0,0,0,0.1)',
                maxWidth: '100%',
                position: 'relative',
              }}
            >
              <strong>{msg.user_name}</strong>
              <p style={{ marginTop: 4, whiteSpace: 'pre-wrap' }}>{msg.text}</p>
            </div>

            {/* Select button */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <button
                onClick={() => toggleMenu(key)}
                aria-label="Open message options"
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: 18,
                  padding: 6,
                  userSelect: 'none',
                }}
              >
                ⋮
              </button>

              {/* Dropdown menu */}
              {openMenuId === key && (
                <div
                  style={{
                    position: 'absolute',
                    top: '110%',
                    right: 0,
                    background: 'white',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    borderRadius: 6,
                    zIndex: 1000,
                    width: 180,
                    fontSize: 14,
                    color: '#222',
                  }}
                >
                  <button
                    style={menuBtnStyle}
                    onClick={() => onDelete && onDelete(msg.id)}
                  >
                    Delete Message
                  </button>
                  <button
                    style={menuBtnStyle}
                    onClick={() => onReply && onReply(msg)}
                  >
                    Reply Message
                  </button>
                  <button
                    style={menuBtnStyle}
                    onClick={() => toggleEmojiPicker(key)}
                  >
                    React with Emojis
                  </button>
                  <button
                    style={menuBtnStyle}
                    onClick={() => handleCopyClick(msg.text)}
                  >
                    Copy Message
                  </button>
                  <button
                    style={menuBtnStyle}
                    onClick={() => onInfo && onInfo(msg)}
                  >
                    Info
                  </button>
                  <button
                    style={menuBtnStyle}
                    onClick={() => toggleSelectMessage(key)}
                  >
                    {isSelected ? 'Unselect' : 'Select'}
                  </button>
                  <button
                    style={menuBtnStyle}
                    onClick={() => onForward && onForward(msg)}
                  >
                    Forward
                  </button>

                  {/* Emoji picker */}
                  {emojiPickerId === key && (
                    <div
                      style={{
                        marginTop: 8,
                        padding: 8,
                        borderTop: '1px solid #ddd',
                        display: 'flex',
                        gap: 6,
                        flexWrap: 'wrap',
                        background: '#f9f9f9',
                        borderRadius: '0 0 6px 6px',
                      }}
                    >
                      {emojiList.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleEmojiClick(msg.id, emoji)}
                          style={{
                            fontSize: 20,
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            userSelect: 'none',
                          }}
                          aria-label={`React with ${emoji}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const menuBtnStyle = {
  width: '100%',
  padding: '8px 12px',
  textAlign: 'left',
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  userSelect: 'none',
  outline: 'none',
};

export default MessagesResponse;
