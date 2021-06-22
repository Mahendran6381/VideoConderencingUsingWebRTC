var selectRoom = document.getElementById("selectRoom");
var consultingRoom = document.getElementById("consultingRoom");
var roomNum = document.getElementById("roomnumber");
var btnGo = document.getElementById("BtnGo");
var localVideo = document.getElementById("local-video");
var remoteVideo = document.getElementById("local-video");

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
btnGo.onclick(() => {
  if (roomNum.value === "") {
    alert("Pleaes Type The Room Number");
  } else {
    roomNumber = roomNum.value;
    socket.emit("create or join ", roomNumber);
    selectRoom.style = "display:none";
    consultingRoom.style = "display:block";
  }
});
