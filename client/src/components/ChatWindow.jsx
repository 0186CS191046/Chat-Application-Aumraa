import React, { useEffect, useRef, useState } from "react";
import { IoMdSend } from "react-icons/io";
import { MdEmojiEmotions } from "react-icons/md";
import EmojiPicker from "emoji-picker-react";

const ChatWindow = ({
  selectedUser,
  selectedGroup,
  messages,
  setMessages,
  messageToBeSend,
  setMessageToBeSend,
  sendMessage,
  loggedInUserEmail,
  currUser,
}) => {
  const messagesEndRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const [showEmoji, setShowEmoji] = useState(false);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Close emoji picker on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        setShowEmoji(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onEmojiClick = (emojiData) => {
    setMessageToBeSend((prev) => prev + emojiData.emoji);
  };

  const formatTime = (time) =>
    new Date(time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  if (!selectedUser && !selectedGroup) {
    return (
      <div className="d-flex align-items-center justify-content-center h-100">
        <h5 className="text-muted">Select user or group to start chatting</h5>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="border-bottom p-3">
        <h5 className="mb-0">{selectedGroup ? selectedGroup.name : selectedUser.name}</h5>
      </div>

      {/* Messages */}
      <div
        className="flex-grow-1 p-3"
        style={{
          height: "calc(100vh - 180px)",
          overflowY: "auto",
          backgroundColor: "#f5f5f5",
          scrollbarWidth: "none",
        }}
      >
        {messages?.map((msg, idx) => {
          const isSender =
            msg.senderEmail === loggedInUserEmail ||
            msg.senderId === currUser.id;

          return (
            <div
              key={idx}
              className="my-3 d-flex"
              style={{ justifyContent: isSender ? "flex-end" : "flex-start" }}
            >
             <div style={{ maxWidth: "70%" }}>
  
  {/* Group sender name (only for received messages) */}
  {selectedGroup && !isSender && (
    <small className="text-muted d-block mb-1">
      {msg.senderEmail}
    </small>
  )}

  {/* Message bubble */}
  <div
    className="p-3 rounded-3 text-white shadow-sm"
    style={{
      backgroundColor: isSender ? "#0d6efd" : "#28a745",
      wordBreak: "break-word",
    }}
  >
    {msg.message}
  </div>

  {/* Timestamp */}
  <small className="text-muted d-block text-end mt-1">
    {formatTime(msg.createdAt)}
  </small>

</div>

            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-top position-relative">
        {showEmoji && (
          <div
            ref={emojiPickerRef}
            style={{
              position: "absolute",
              bottom: "70px",
              left: "10px",
              zIndex: 1000,
            }}
          >
            <EmojiPicker onEmojiClick={onEmojiClick} />
          </div>
        )}

        <div className="input-group">
          <button
            className="btn btn-outline-secondary"
            onClick={() => setShowEmoji((prev) => !prev)}
          >
            <MdEmojiEmotions size={24} />
          </button>

          <input
            type="text"
            className="form-control"
            placeholder="Type a message..."
            value={messageToBeSend}
            onChange={(e) => setMessageToBeSend(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && !e.shiftKey && sendMessage()
            }
          />

          <button className="btn btn-primary" onClick={sendMessage}>
            <IoMdSend size={22} />
          </button>
        </div>
      </div>
    </>
  );
};

export default ChatWindow;
