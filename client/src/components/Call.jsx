import React, { useEffect, useRef, useState } from "react";
import { socket } from "../config/socket";

const Call = ({ roomId, userId, callTo }) => {
  const peers = useRef({});
  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);

  const [incomingOffer, setIncomingOffer] = useState(null);
  const incomingFrom = useRef(null);

  // This will hold the person we're currently in call with (incoming or outgoing)
  const [activeCaller, setActiveCaller] = useState(null);

  const [callStatus, setCallStatus] = useState(""); // "connecting", "connected", etc.

  const iceCandidateQueue = useRef({});

  useEffect(() => {
    socket.emit("join-room", { roomId, userId });

    socket.on("offer", handleIncomingOffer);
    socket.on("answer", handleAnswer);
    socket.on("ice-candidate", handleIceCandidate);
    socket.on("call-rejected", ({ from }) => {
      if (from === callTo || from === activeCaller) {
        setCallStatus("rejected");
        setActiveCaller(null);
      }
    });

    return () => {
      socket.off("offer", handleIncomingOffer);
      socket.off("answer", handleAnswer);
      socket.off("ice-candidate", handleIceCandidate);
      socket.off("call-rejected");
    };
  }, [roomId, userId]);

  // Outgoing call
  useEffect(() => {
    if (callTo && callTo !== userId) {
      setActiveCaller(callTo); // Set who we're calling
      initiateCall(callTo);
    }
  }, [callTo, userId]);

  const getLocalStream = async () => {
    if (!localStreamRef.current) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
    }
    return localStreamRef.current;
  };

  const createPeer = (targetUserId) => {
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          from: userId,
          to: targetUserId,
          candidate: event.candidate,
        });
      }
    };

    peer.ontrack = (event) => {
      console.log("Remote stream received from", targetUserId);
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = event.streams[0];
      }
      setCallStatus("connected");
    };

    peer.onconnectionstatechange = () => {
      if (peer.connectionState === "failed" || peer.connectionState === "closed") {
        setCallStatus("disconnected");
        setActiveCaller(null);
      }
    };

    return peer;
  };

  const initiateCall = async (to) => {
    setCallStatus("connecting");

    const peer = createPeer(to);
    peers.current[to] = peer;

    const stream = await getLocalStream();
    stream.getTracks().forEach((track) => peer.addTrack(track, stream));

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    socket.emit("offer", { from: userId, to, offer });
  };

  const handleIncomingOffer = async ({ from, offer }) => {
    if (from === userId) return;

    console.log("Incoming call from:", from);
    incomingFrom.current = from;
    setIncomingOffer(offer);
    setCallStatus("incoming");
  };

  const acceptCall = async () => {
    const from = incomingFrom.current;
    if (!from || !incomingOffer) return;

    // IMPORTANT: Set active caller to the person who called us
    setActiveCaller(from);

    let peer = peers.current[from];
    if (!peer) {
      peer = createPeer(from);
      peers.current[from] = peer;

      const stream = await getLocalStream();
      stream.getTracks().forEach((track) => peer.addTrack(track, stream));
    }

    await peer.setRemoteDescription(new RTCSessionDescription(incomingOffer));
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);

    socket.emit("answer", { from: userId, to: from, answer });

    setIncomingOffer(null);
    incomingFrom.current = null;
    setCallStatus("connected");
  };

  const rejectCall = () => {
    const from = incomingFrom.current;
    if (from) {
      socket.emit("call-rejected", { from: userId, to: from });
    }
    setIncomingOffer(null);
    incomingFrom.current = null;
    setCallStatus("");
    setActiveCaller(null);
  };

  const handleAnswer = async ({ from, answer }) => {
    const peer = peers.current[from];
    if (!peer || peer.signalingState !== "have-local-offer") return;

    await peer.setRemoteDescription(new RTCSessionDescription(answer));

    if (iceCandidateQueue.current[from]) {
      for (const candidate of iceCandidateQueue.current[from]) {
        await peer.addIceCandidate(new RTCIceCandidate(candidate));
      }
      delete iceCandidateQueue.current[from];
    }
  };

  const handleIceCandidate = async ({ from, candidate }) => {
    const peer = peers.current[from];
    if (peer && peer.remoteDescription) {
      await peer.addIceCandidate(new RTCIceCandidate(candidate));
    } else {
      if (!iceCandidateQueue.current[from]) iceCandidateQueue.current[from] = [];
      iceCandidateQueue.current[from].push(candidate);
    }
  };

  const endCall = () => {
    Object.values(peers.current).forEach((peer) => peer.close());
    peers.current = {};
    setCallStatus("");
    setActiveCaller(null);
  };

  // Determine who we're talking to
  const currentPeer = callTo || activeCaller;

  return (
    <div className="call-container position-relative">
      <audio ref={remoteAudioRef} autoPlay playsInline />

      {/* Incoming Call Screen */}
      {callStatus === "incoming" && incomingOffer && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            color: "white",
          }}
        >
          <h2>Incoming Call</h2>
          <h4>From: {incomingFrom.current}</h4>
          <div className="mt-4">
            <button className="btn btn-success btn-lg me-4" onClick={acceptCall}>
              Accept
            </button>
            <button className="btn btn-danger btn-lg" onClick={rejectCall}>
              Reject
            </button>
          </div>
        </div>
      )}

      {/* Active Call Bar */}
      {(callTo || activeCaller) && (
        <div className="p-3 bg-dark text-white text-center fixed-bottom">
          <h5>
            {callStatus === "connecting" && "Calling..."}
            {callStatus === "connected" && `In call with ${currentPeer}`}
            {callStatus === "rejected" && "Call Rejected"}
          </h5>
          <button className="btn btn-danger btn-sm mt-2" onClick={endCall}>
            End Call
          </button>
        </div>
      )}
    </div>
  );
};

export default Call;