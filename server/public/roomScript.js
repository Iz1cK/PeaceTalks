if (!localStorage.getItem("access_token")) {
  window.location.href = "/";
}

let user1 = document.querySelector("#user1");
let user2 = document.querySelector("#user2");
let socket = io.connect("/");
let myUserId = localStorage.getItem("userid");

const muteButton = document.querySelector("#muteButton");
const cameraButton = document.querySelector("#cameraButton");

let isMicActive = true;
let isCameraActive = true;
let localStream = null;

let chat = document.querySelector("#chat");
let chatBox = document.querySelector(".chat");
let messages = document.querySelector(".messages");
let chatboxdiv = document.querySelector("chating");
chat.onclick = () => {
  chatBox.classList.toggle("active");
  bodypad.classList.toggle("active");
};

muteButton.addEventListener("click", () => {
  if (!localStream) return;
  isMicActive = !isMicActive;
  localStream.getAudioTracks().forEach((track) => {
    track.enabled = isMicActive;
  });

  muteButton.querySelector("ion-icon").name = isMicActive
    ? "mic-outline"
    : "mic-off-outline";
});

cameraButton.addEventListener("click", () => {
  if (!localStream) return;
  isCameraActive = !isCameraActive;
  localStream.getVideoTracks().forEach((track) => {
    track.enabled = isCameraActive;
  });
  console.log(
    `My socket ID (userId) is: ${myUserId} and I toggled camera: ${isCameraActive}`
  );
  socket.emit("camera-toggled", {
    userId: myUserId,
    cameraActive: isCameraActive,
  });

  cameraButton.querySelector("ion-icon").name = isCameraActive
    ? "videocam-outline"
    : "videocam-off-outline";

  const user1CamPlaceholder = document.querySelector("#user1CamPlaceholder");
  const user1Video = document.querySelector("#user1");
  if (isCameraActive) {
    user1Video.style.display = "block";
    user1CamPlaceholder.style.display = "none";
  } else {
    user1Video.style.display = "none";
    user1CamPlaceholder.style.display = "block";
  }
});

let audioChunks = [];
let sendTimer = null;

navigator.mediaDevices
  .getUserMedia({ audio: true })
  .then((stream) => {
    localStream = stream;
    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, {
        type: "audio/webm; codecs=opus",
      });
      const formData = new FormData();
      formData.append("audio", audioBlob);

      try {
        let result = await axios.post("/api/transcribe", formData);
        console.log(result.data);
        if (result.data) {
          const jsonResponse = result.data;
          const audioBase64 = jsonResponse.audioContent;
          const translation = jsonResponse.translation;
          const transcription = jsonResponse.transcription;

          console.log("Transcription: " + transcription);
          socket.emit("translation", {
            userId: myUserId,
            translation: translation,
          });
          const audioBlob = new Blob(
            [Uint8Array.from(atob(audioBase64), (c) => c.charCodeAt(0))],
            { type: "audio/mp3" }
          );
          const audioURL = URL.createObjectURL(audioBlob);
          const audioElement = new Audio(audioURL);
          audioElement.play();
        } else {
          console.log("Unexpected result:", result);
        }
      } catch (error) {
        // console.error("Error sending audio data:", error);
      }

      // Clear the audioChunks for next recording
      audioChunks = [];
      mediaRecorder.start(5000);
    };

    // Start the MediaRecorder
    mediaRecorder.start(5000);

    // Send data every 30 seconds
    sendTimer = setInterval(() => {
      if (mediaRecorder.state === "recording") {
        mediaRecorder.stop();
      }
    }, 8000);
  })
  .catch((error) => {
    console.error("Error accessing user media:", error);
  });

navigator.mediaDevices
  .getUserMedia({ video: true })
  .then((stream) => {
    user1.srcObject = stream;

    let peer = new SimplePeer({
      initiator: true,
      trickle: true,
      stream: stream,
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          { urls: "stun:stun2.l.google.com:19302" },
          { urls: "stun:stun3.l.google.com:19302" },
          { urls: "stun:stun4.l.google.com:19302" },
        ],
      },
    });
    peer.on("signal", function (data) {
      socket.emit("join-room", ROOM_ID, JSON.stringify(data));
    });

    socket.on("connect", () => {
      console.log(`My socket ID (userId) is: ${myUserId}`);
    });

    socket.on("user-connected", function (data) {
      if (peer) peer.signal(JSON.parse(data));
    });

    socket.on("camera-toggled", (data) => {
      const { userId, cameraActive } = data;
      console.log(`user ${userId} toggled camera: ${cameraActive}`);

      if (userId === myUserId) {
        // This is me, I already know my camera state
        return;
      }
      const camPlaceholder = document.querySelector("#user2CamPlaceholder");
      const otherUserVideo = document.querySelector("#user2");
      if (cameraActive) {
        otherUserVideo.style.display = "block";
        camPlaceholder.style.display = "none";
        console.log(`User ${userId} turned on their camera.`);
      } else {
        otherUserVideo.style.display = "none";
        camPlaceholder.style.display = "block";
        console.log(`User ${userId} turned off their camera.`);
      }
    });

    socket.on("translation", (data) => {
      const { userId, translation } = data;
      console.log(`user ${userId} translated: ${translation}`);

      if (userId === myUserId) {
        // This is me, I dont need the translation
        return;
      }

      console.log("Translation: " + translation);

      // var $messageDiv = $("<div>", { class: "messages" });
      // $("<img>", { src: "/img/user1.png" }).appendTo($messageDiv);
      // var $innerDiv = $("<div>").appendTo($messageDiv);
      // $("<h5>").text("User1").appendTo($innerDiv);
      // $("<p>").text(translation).appendTo($innerDiv);
      // $("chating").append($messageDiv);
    });

    peer.on("stream", function (stream) {
      user2.srcObject = stream;
      user2.play();
    });
  })
  .catch((error) => {
    console.error("Error accessing user media:", error);
  });
