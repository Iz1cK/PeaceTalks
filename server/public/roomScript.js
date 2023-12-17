if (!localStorage.getItem("access_token")) {
  window.location.href = "/";
}

let user1 = document.querySelector("#user1");
let user2 = document.querySelector("#user2");
let socket = io.connect("/");

// navigator.mediaDevices
//   .getUserMedia({ audio: true })
//   .then((stream) => {
//     const mediaRecorder = new MediaRecorder(stream);
//     mediaRecorder.ondataavailable = async (event) => {
//       if (event.data.size > 0) {
//         const audioBlob = new Blob([event.data], {
//           type: "audio/webm; codecs=opus",
//         });
//         console.log("playing audio");

//         const audioElement = new Audio(URL.createObjectURL(audioBlob));
//         audioElement.play();
//         console.log("played audio");

//         const formData = new FormData();
//         formData.append("audio", audioBlob);

//         // mediaRecorder.stop();

//         // await axios.post("/api/transcribe", formData).then((res) => {
//         //   console.log(res);
//         // });
//       }
//     };

//     mediaRecorder.start(5000);
//   })
//   .catch((error) => {
//     console.error("Error accessing user media:", error);
//   });

let audioChunks = [];
let sendTimer = null;

navigator.mediaDevices
  .getUserMedia({ audio: true })
  .then((stream) => {
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
        let result = await axios.post("/api/transcribe", formData, {
          responseType: "arraybuffer",
        });
        console.log(result);
        if (result.data && result.headers["content-type"] === "audio/mp3") {
          const audioURL = URL.createObjectURL(
            new Blob([result.data], { type: "audio/mp3" })
          );
          const audioElement = new Audio(audioURL);
          audioElement.play();
        } else {
          console.log("Unexpected result:", result);
        }
      } catch (error) {
        console.error("Error sending audio data:", error);
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

    socket.on("user-connected", function (data) {
      if (peer) peer.signal(JSON.parse(data));
    });

    peer.on("stream", function (stream) {
      user2.srcObject = stream;
      user2.play();
    });
  })
  .catch((error) => {
    console.error("Error accessing user media:", error);
  });
