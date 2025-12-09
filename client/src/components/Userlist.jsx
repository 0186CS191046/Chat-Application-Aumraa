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
  const [currUser, setCurrUser] = useState({})
  const [onlineUsers, setOnlineUsers] = useState(new Set())

  const messagesEndRef = useRef(null);
  const loggedInUserPhone = sessionStorage.getItem("phone");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!socket.hasRegistered) {
      socket.emit("register", loggedInUserPhone);
      socket.hasRegistered = true;
    }

    socket.on("online-users", (activePhones) => {
      setOnlineUsers(new Set(activePhones))
    })
    socket.on("user-joined", (phone) => {
      setOnlineUsers((prev) => new Set(prev).add(phone))
    })

    socket.on("user-left", (phone) => {
      setOnlineUsers((prev) => {
        const copy = new Set(prev);
        copy.delete(phone);
        return copy;
      });
    });

    const handleReceiveMessage = ({ senderPhone, receiverPhone, message, createdAt }) => {
      const chatPartnerPhone = selectedUser?.phone;

      const isMessageForCurrentChat =
        chatPartnerPhone &&
        (senderPhone === chatPartnerPhone || receiverPhone === chatPartnerPhone);

      if (senderPhone === loggedInUserPhone) {
        return;
      }

      if (isMessageForCurrentChat) {
        setMessages((prev) => [
          ...prev,
          {
            senderPhone,
            receiverPhone: receiverPhone || loggedInUserPhone,
            message,
            createdAt: createdAt || new Date(),
          },
        ]);
      }
    };

    socket.on("receive-message", handleReceiveMessage);

    return () => {
      socket.off("receive-message", handleReceiveMessage);
      socket.off("online-users");
      socket.off("user-joined");
      socket.off("user-left");
    };
  }, [selectedUser]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${apiurl}/get-all-users`);
        setUsers(res.data.data);
        const curruser = await axios.get(`${apiurl}/get-user-by-phone?phone=${loggedInUserPhone}`)
        console.log("cur", curruser.data.data);
        setCurrUser(curruser.data.data)
      } catch (err) {
        console.error(err);
      }
    };

    fetchUsers();
  }, []);

  const fetchMessages = async (receiverId) => {
    if (!currUser.id) return;
    try {
      const res = await axios.get(
        `${apiurl}/get-received-messages?userId1=${currUser.id}&userId2=${receiverId}`
      );
      setMessages(res.data || []);
    } catch (err) {
      console.log("Error fetching messages:", err);
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    fetchMessages(user.id);
  };

  const sendMessage = async () => {
    if (!messageToBeSend.trim() || !selectedUser) return;

    setMessages((prev) => [
      ...prev,
      {
        senderPhone: loggedInUserPhone,
        receiverPhone: selectedUser.phone,
        senderId: currUser.id,
        message: messageToBeSend,
        createdAt: new Date(),
      },
    ]);

    socket.emit("send-message", {
      senderPhone: loggedInUserPhone,
      receiverPhone: selectedUser.phone,
      message: messageToBeSend,
    });

    try {
      await axios.post(`${apiurl}/send-message`, {
        senderId: currUser.id,
        receiverId: selectedUser.id,
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

  const filteredUsers = users.filter((u) => u.phone !== loggedInUserPhone);

  return (
    <div className="container mt-4">
      <div
        className="row"
        style={{ height: "80vh", border: "1px solid #ddd", borderRadius: "8px" }}
      >

        <div className="col-md-4 border-end bg-light p-3">
          <h5>Chats</h5>
          <ul className="list-group">
            {filteredUsers.map((user) => (
              <li
                key={user.phone}
                className={`list-group-item d-flex justify-content-between align-items-center ${selectedUser?.phone === user.phone ? "active" : ""
                  }`}
                style={{ cursor: "pointer" }}
                onClick={() => handleUserClick(user)}
              >
                <div>
                  <strong>{user.name}</strong>
                </div>

                {onlineUsers.has(user.phone) && (
                  <span className="badge bg-success rounded-pill">Online</span>
                )}
              </li>
            ))}
          </ul>
        </div>

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
                {messages?.map((msg, idx) => {
                  const isSender =
                    msg.senderPhone === loggedInUserPhone ||
                    msg.senderId == currUser.id;

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

                        <small style={{ fontSize: "12px", marginTop: "4px", opacity: 0.7 }}>
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