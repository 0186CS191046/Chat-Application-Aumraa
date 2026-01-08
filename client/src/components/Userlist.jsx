import React, { useEffect, useState } from "react";
import axios from "axios";
import { socket } from "../config/socket";
import { apiurl } from "../config/config";
import ChatWindow from "./ChatWindow";

const Userlist = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageToBeSend, setMessageToBeSend] = useState("");
  const [currUser, setCurrUser] = useState({});
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null)

  const loggedInUserEmail = sessionStorage.getItem("email");
  const token = sessionStorage.getItem("token")
  // Socket listeners
  useEffect(() => {
    if (!socket.hasRegistered) {
      socket.emit("register", loggedInUserEmail);
      socket.hasRegistered = true;
    }

    const updateOnline = (activeEmails) =>
      setOnlineUsers(new Set(activeEmails));

    socket.on("online-users", updateOnline);
    socket.on("user-joined", (email) =>
      setOnlineUsers((prev) => new Set(prev).add(email))
    );
    socket.on("user-left", (email) =>
      setOnlineUsers((prev) => {
        const copy = new Set(prev);
        copy.delete(email);
        return copy;
      })
    );

    // const handleReceiveMessage = ({
    //   senderEmail,
    //   receiverEmail,
    //   message,
    //   createdAt,
    // }) => {
    //   if (senderEmail === loggedInUserEmail) return;

    //   if (
    //     selectedUser &&
    //     (senderEmail === selectedUser.email ||
    //       receiverEmail === selectedUser.email)
    //   ) {
    //     setMessages((prev) => [
    //       ...prev,
    //       { senderEmail, receiverEmail, message, createdAt },
    //     ]);
    //   }
    // };

    const handleReceiveMessage = (msg) => {
  if (!selectedUser) return;

  if (
    msg.senderEmail === selectedUser.email ||
    msg.receiverEmail === selectedUser.email
  ) {
    setMessages((prev) => [...prev, msg]);
  }
};

     const handleReceiveGroupMessage = (msg) => {
    if (!selectedGroup) return;
    if (msg.groupId !== selectedGroup.id) return;

    setMessages((prev) => [...prev, msg]);
  };

    socket.on("receive-message", handleReceiveMessage);
socket.on("receive-group-message",handleReceiveGroupMessage)
    return () => {
      socket.off("receive-message", handleReceiveMessage);
      socket.off("receive-group-message",handleReceiveGroupMessage)
      socket.off("online-users", updateOnline);
      socket.off("user-joined");
      socket.off("user-left");
    };
  }, [selectedUser, selectedGroup, loggedInUserEmail]);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      const [usersRes, currRes, group] = await Promise.all([
        axios.get(`${apiurl}/get-all-users`),
        axios.get(`${apiurl}/get-user-by-email?email=${loggedInUserEmail}`),
        axios.get(`${apiurl}/groups`, { headers: { "Authorization": `Bearer ${token}` } })
      ]);
      setUsers(usersRes.data.data);
      setCurrUser(currRes.data.data);
      console.log("____", group.data.data);

      setGroups(group.data.data)
    };
    fetchUsers();
  }, [loggedInUserEmail]);

  const fetchMessages = async (receiverId) => {
    if (!currUser.id) return;
    const res = await axios.get(
      `${apiurl}/get-received-messages?userId1=${currUser.id}&userId2=${receiverId}`
    );
    console.log("res--------", res.data);

    setMessages(res.data || []);
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setSelectedGroup(null)
    fetchMessages(user.id);
  };

  const handleGroupClick = (group) => {
    setSelectedGroup(group);
    setSelectedUser(null); // close 1-to-1 chat
    setMessages([]);
    socket.emit("join-group", { groupId: group.id });
    console.log("++++++",group.id);
    
    fetchGroupMessages(group.id)
  };

  const sendMessage = async () => {
    if (!messageToBeSend.trim() || !selectedUser) return;

    const newMsg = {
      senderEmail: loggedInUserEmail,
      receiverEmail: selectedUser.email,
      senderId: currUser.id,
      message: messageToBeSend,
      createdAt: new Date(),
    };

    socket.emit("send-message", {
      senderEmail: loggedInUserEmail,
      receiverEmail: selectedUser.email,
      message: messageToBeSend,
    });

    await axios.post(`${apiurl}/send-message`, {
      senderId: currUser.id,
      receiverId: selectedUser.id,
      message: messageToBeSend,
    });

    setMessageToBeSend("");
  };

  const sendGroupMessage = async () => {
    if (!messageToBeSend.trim() || !selectedGroup) return;

    const newMsg = {
      senderEmail: loggedInUserEmail,
      groupId: selectedGroup.id,
      senderId: currUser.id,
      message: messageToBeSend,
      createdAt: new Date(),
    };

    // setMessages((prev) => [...prev, newMsg]);

    socket.emit("send-group-message", {
      groupId: selectedGroup.id,
      senderEmail: loggedInUserEmail,
      message: messageToBeSend
    });

    await axios.post(`${apiurl}/send-message`, {
      senderId: currUser.id,
      groupId: selectedGroup.id,
      message: messageToBeSend,
    });

    setMessageToBeSend("");
  };

  const fetchGroupMessages = async (groupId) => {
    console.log("group0d",groupId);
    
    const res = await axios.get(
      `${apiurl}/received-group-messages?groupId=${groupId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setMessages(res.data.data || []);
  };

  const filteredUsers = users.filter(
    (u) => u.email !== loggedInUserEmail
  );

  return (
    <div className="container mt-4">
      <div className="row shadow-sm" style={{ height: "85vh" }}>
        {/* USER LIST */}
        <div className="col-md-4 bg-light border-end p-3">
          <h5>Chats</h5>
          <ul className="list-group">
            {filteredUsers.map((user) => (
              <li
                key={user.email}
                className={`list-group-item ${selectedUser?.email === user.email ? "active" : ""
                  }`}
                onClick={() => handleUserClick(user)}
                style={{ cursor: "pointer" }}
              >
                {user.name}
                {onlineUsers.has(user.email) && (
                  <span className="badge bg-success float-end">
                    Online
                  </span>
                )}
              </li>
            ))}
          </ul>
          <h5>Group Chats</h5>

          <ul className="list-group">
            {groups.map((group) => (
              <li
                key={group.id}
                className={`list-group-item ${selectedGroup?.id === group.id ? "active" : ""
                  }`}
                onClick={() => handleGroupClick(group)}
                style={{ cursor: "pointer" }}
              >
                {group.name}
              </li>
            ))}
          </ul>

        </div>


        {/* CHAT WINDOW */}

        {/* <div className="col-md-8 d-flex flex-column bg-white">
          <ChatWindow
            selectedUser={selectedUser}
            messages={messages}
            setMessages={setMessages}
            messageToBeSend={messageToBeSend}
            setMessageToBeSend={setMessageToBeSend}
            sendMessage={sendMessage}
            loggedInUserEmail={loggedInUserEmail}
            currUser={currUser}
          />

        </div> */}

 <div className="col-md-8 d-flex flex-column bg-white">
        <ChatWindow
          selectedUser={selectedUser}
          selectedGroup={selectedGroup}
          messages={messages}
          setMessages={setMessages}
          messageToBeSend={messageToBeSend}
          setMessageToBeSend={setMessageToBeSend}
          sendMessage={selectedGroup ? sendGroupMessage : sendMessage}
          loggedInUserEmail={loggedInUserEmail}
          currUser={currUser}
        />
        </div>
      </div>
    </div>
  );
};

export default Userlist;
