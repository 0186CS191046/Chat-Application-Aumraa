import React, { useEffect, useState, useRef } from "react";
import { IoMdSend } from "react-icons/io";
import axios from "axios";
import { socket } from "../config/socket";
import { apiurl } from "../config/config";

const Userlist = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageToBeSend, setMessageToBeSend] = useState("");

  const messagesEndRef = useRef(null);
  const loggedInUserId =Number(sessionStorage.getItem("id"));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

useEffect(() => {

  if (!socket.hasRegistered) {
    socket.emit("register", loggedInUserId);
    socket.hasRegistered = true;
  }

  const handleReceiveMessage = ({ senderId, receiverId, message, createdAt }) => {
    console.log("Real-time message received:", { senderId, receiverId, message });

    const chatPartnerId = selectedUser?.id;

    const isMessageForCurrentChat =
      chatPartnerId &&
      (senderId === chatPartnerId || receiverId === chatPartnerId);

    if (isMessageForCurrentChat) {
      setMessages((prev) => [
        ...prev,
        {
          senderId,
          receiverId: receiverId || loggedInUserId,
          message,
          createdAt: new Date(),
        },
      ]);
    }
  };

  socket.on("receive-message", handleReceiveMessage);

  return () => {
    socket.off("receive-message", handleReceiveMessage);
  };
}, [selectedUser]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${apiurl}/get-all-users`);
        setUsers(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUsers();
  }, []);

  const fetchMessages = async (receiverId) => {
    try {
      const res = await axios.get(
        `${apiurl}?userId1=${loggedInUserId}&&userId2=${receiverId}`
      );
      setMessages(res.data);
    } catch (err) {
      console.log("Error fetching messages:", err);
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    fetchMessages(user.id);
  };

const sendMessage = async() => {
  if (!messageToBeSend.trim() || !selectedUser) return;

  
    const senderId = loggedInUserId;
    const receiverId = selectedUser.id;

  socket.emit("send-message", {
    senderId: loggedInUserId,
    receiverId: selectedUser.id,
    message: messageToBeSend,
  });

    try {
      await axios.post(`${apiurl}/send-message`, {
        senderId,
        receiverId,
        message: messageToBeSend,
      });
    } catch (err) {
      console.log("Message save error:", err);
    }
  setMessageToBeSend(""); 
};
  const formatTime = (time) => {
    return new Date(time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredUsers = users.filter((u) => u.id !== loggedInUserId);

  return (
    <div className="container mt-4">
      <div
        className="row"
        style={{ height: "80vh", border: "1px solid #ddd", borderRadius: "8px" }}
      >
        {/* LEFT USERS LIST */}
        <div className="col-md-4 border-end bg-light p-3">
          <h5>Chats</h5>
          <ul className="list-group">
            {filteredUsers.map((user) => (
              <li
                key={user.id}
                className={`list-group-item ${
                  selectedUser?.id === user.id ? "active" : ""
                }`}
                style={{ cursor: "pointer" }}
                onClick={() => handleUserClick(user)}
              >
                {user.name}
              </li>
            ))}
          </ul>
        </div>

        {/* RIGHT CHAT AREA */}
        <div className="col-md-8 p-3">
          {selectedUser ? (
            <>
              <h5>Chat with {selectedUser.name}</h5>

              <div
                className="border rounded p-3 mb-3"
                style={{
                  height: "60vh",
                  overflowY: "scroll",
                  backgroundColor: "#f9f9f9",
                }}
              >
                {messages.map((msg, idx) => {
                  const isSender = msg.senderId == loggedInUserId;

                  return (
                    <div
                      key={idx}
                      className="my-2 d-flex"
                      style={{
                        justifyContent: isSender ? "flex-end" : "flex-start",
                      }}
                    >
                      <div
                        className="d-flex flex-column"
                        style={{
                          alignItems: isSender ? "flex-end" : "flex-start",
                        }}
                      >
                        <div
                          style={{
                            maxWidth: "260px",
                            padding: "8px 12px",
                            borderRadius: "10px",
                            backgroundColor: isSender ? "#0d6efd" : "#198754",
                            color: "white",
                            wordBreak: "break-word",
                          }}
                        >
                          {msg.message}
                        </div>

                        <small
                          style={{
                            fontSize: "12px",
                            marginTop: "4px",
                            opacity: 0.7,
                          }}
                        >
                          {formatTime(msg.createdAt)}
                        </small>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef}></div>
              </div>

              <div className="d-flex align-items-center">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Type a message..."
                  value={messageToBeSend}
                  onChange={(e) => setMessageToBeSend(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button className="p-2 m-2 btn-primary" onClick={sendMessage}>
                  <IoMdSend />
                </button>
              </div>
            </>
          ) : (
            <div className="d-flex align-items-center justify-content-center h-100">
              <h5>Select a user to start chat</h5>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Userlist;
