var selectRoom = document.getElementById("selectRoom");
var consultingRoom = document.getElementById("consultingRoom");
var roomNum = document.getElementById("roomnumber");
var btnGo = document.getElementById("BtnGo");
var localVideo = document.getElementById("local-video");
var remoteVideo = document.getElementById("local-video");
var io = require("socket.io");
var roomNumber;
var localStream;
var remoteStream;
var rtcPeerConnection;
var iceServers = {
  iceServers: [
    { url: "stun:stun.services.mozilla.com" },
    { url: "stun:stun.l.google.com.19302" },
  ],
};
var streamConstraints = { audio: true, video: true };
var isCaller;
var socket = io();
btnGo.addEventListener("onclick", () => {
  if (roomNum.value === "") {
    alert("Pleaes Type The Room Number");
  } else {
    roomNumber = roomNum.value;
    socket.emit("create or join ", roomNumber);
    selectRoom.style = "display:none";
    consultingRoom.style = "display:block";
  }
});
socket.on("created", (room) => {
  navigator.mediaDevices
    .getUserMedia(streamConstraints)
    .then((stream) => {
      localStream = stream;
      localVideo.src = URL.createObjectURL(stream);
      isCaller = true;
    })
    .catch((err) => {
      console.log("SomThis Err Occured", err);
    });
});

socket.on("joined", (room) => {
  navigator.mediaDevices
    .getUserMedia(streamConstraints)
    .then((stream) => {
      localStream = stream;
      localVideo.src = URL.createObjectURL(stream);
      socket.emit("ready", roomNum);
    })
    .catch((err) => {
      console.log("Something err occured ", err);
    });
});

socket.on("ready", () => {
  if (isCaller) {
    rtcPeerConnection = new RTCPeerConnection(iceServers);
    rtcPeerConnection.onicecandidate = onicecandidate;
    rtcPeerConnection.onaddstream = onAddStream;
    rtcPeerConnection.addStream(localStream);
    rtcPeerConnection.createOffer(setLocalAndOffer, (e) => {
      console.log(e);
    });
  }
}); ///
socke.on("offer", (event) => {
  if (!isCaller) {
    rtcPeerConnection = new RTCPeerConnection(iceServers);
    rtcPeerConnection.onicecandidate = onicecandidate;
    rtcPeerConnection.onaddstream = onAddStream;
    rtcPeerConnection.addStream(localStream);
    rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event));
    rtcPeerConnection.createAnswer(setLocalAndAnswer, (e) => {
      console.log(e);
    });
  }
});
socket.on("answer", () => {
  rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event));
});
socket.on("candidate", (event) => {
  var candidate = new RTCIceCandidate({
    sdpMLineIndex: event.lable,
    candidate: event.candidate,
  });
  rtcPeerConnection.addiceCandidate(candidate);
});
function onAddStream(event) {
  remoteVideo.src = URL.createObjectURL(event.stream);
  remoteStream = event.stream;
}
function oniceCandidate(event) {
  if (event.candidate) {
    console.log("Senditing the Ice Candidate");
    socket.emit("candidate", {
      type: "candidate",
      lable: event.candidate.sdpMLineIndex,
      id: event.candidate.sdpMid,
      candidate: event.candidate.candidate,
      room: roomNumber,
    });
  }
}
function setLocalAndOffer(sessionDescription) {
  rtcPeerConnection.setLocalDescription(sessionDescription);
  socket.emit("offer", {
    type: "offer",
    sdp: sessionDescription,
    room: roomNumber,
  });
}

function setLocalAndAnswer(sessionDescription) {
  rtcPeerConnection.setLocalDescription(sessionDescription);
  socket.emit("answer", {
    type: "answer",
    sdp: sessionDescription,
    room: roomNumber,
  });
}
