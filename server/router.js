const usersController = require("./controllers/users.controller.js");
const router = require("express").Router();
const translate = require("translate-google");
const catchAsync = require("./utils/catchAsync");
const speech = require("@google-cloud/speech");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { v4: uuidV4 } = require("uuid");
const exec = require("child_process").exec;
const textToSpeech = require("@google-cloud/text-to-speech");
const textToSpeechClient = new textToSpeech.TextToSpeechClient();

const googleLanguageCodes = {
  ["Arabic"]: "ar-JO",
  ["English"]: "en-US",
  ["Hebrew"]: "iw-IL",
};

const TextToSpeechLanguageCodes = {
  ["Arabic"]: "ar-XA",
  ["English"]: "en-US",
  ["Hebrew"]: "he-IL",
};

const otherLanguageCodes = {
  ["Arabic"]: "ar",
  ["English"]: "en",
  ["Hebrew"]: "he",
};

// Define storage strategy
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
// Create a client
const client = new speech.SpeechClient();

router.get(
  "/hello",
  catchAsync(async (req, res) => {
    let result = await translate("שלום!", { to: "ar" });
    console.log(result);
    res.send(result);
  })
);

router.post("/login", usersController.login);
router.post("/register", usersController.register);

router.post(
  "/transcribe",
  upload.single("audio"),
  catchAsync((req, res) => {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }
    //GET LANGUAGE FROM REQ.DATA
    const myLanguage = req.body.myLanguage;
    const otherLanguage = req.body.otherLanguage;
    console.log(myLanguage, otherLanguage);
    const uniqueFilename = uuidV4();
    const audioFilePath = `temp_audio_files/${uniqueFilename}.webm`;
    const convertedFilePath = `temp_audio_files/${uniqueFilename}.wav`;

    fs.writeFileSync(audioFilePath, req.file.buffer);
    try {
      exec(
        `ffmpeg -i ${audioFilePath} -vn -ar 16000 ${convertedFilePath}`,
        async (error) => {
          if (error) {
            console.error("Error during conversion:", error);
            return res.status(500).send("Error during audio conversion.");
          }

          const audioData = fs.readFileSync(convertedFilePath);
          const base64Audio = audioData.toString("base64");

          const request = {
            config: {
              encoding: "LINEAR16",
              sampleRateHertz: 16000,
              languageCode: googleLanguageCodes[myLanguage],
            },
            audio: { content: base64Audio },
          };

          client
            .recognize(request)
            .then(async (data) => {
              const response = data[0];
              const transcription = response.results
                .map((result) => result.alternatives[0].transcript)
                .join("\n");

              fs.unlinkSync(audioFilePath);
              fs.unlinkSync(convertedFilePath);
              if (!transcription) {
                return res.status(500).send("No transcription found.");
              }
              let result = await translate(transcription, {
                to: otherLanguageCodes[otherLanguage],
              });
              console.log(result);
              const request = {
                input: { text: result },
                voice: {
                  languageCode: TextToSpeechLanguageCodes[otherLanguage],
                  ssmlGender: "NEUTRAL",
                },
                // Select the type of audio encoding
                audioConfig: { audioEncoding: "MP3" },
              };
              if (!result) {
                return res.status(500).send("No translation found.");
              }
              try {
                const [response] = await textToSpeechClient.synthesizeSpeech(
                  request
                );
                const audioContent = response.audioContent;
                const base64Audio = audioContent.toString("base64"); // Encoding the audio content to base64

                const requestResult = {
                  audioContent: base64Audio,
                  translation: result,
                  transcription: transcription,
                };

                // res.set("Content-Type", "audio/mp3");
                res.json(requestResult);
              } catch (error) {
                console.error("ERROR:", error);
                res.sendStatus(500);
              }

              // res.send(result);
            })
            .catch((err) => {
              console.error("ERROR:", err);

              if (fs.existsSync(audioFilePath)) {
                fs.unlinkSync(audioFilePath);
              }
              if (fs.existsSync(convertedFilePath)) {
                fs.unlinkSync(convertedFilePath);
              }

              res.sendStatus(500);
            });
        }
      );
    } catch (e) {
      console.log(e);
      if (fs.existsSync(audioFilePath)) {
        fs.unlinkSync(audioFilePath);
      }
      if (fs.existsSync(convertedFilePath)) {
        fs.unlinkSync(convertedFilePath);
      }
    }
  })
);

router.post(
  "/speak",
  catchAsync(async (req, res) => {
    const text = req.body.text;

    if (!text) {
      return res.status(400).send("No text provided.");
    }

    const request = {
      input: { text: text },
      // Select the language and SSML voice gender (optional)
      // voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" },
      voice: { languageCode: "ar-XA", ssmlGender: "NEUTRAL" },
      // voice: { languageCode: "he-IL", ssmlGender: "NEUTRAL" },
      // Select the type of audio encoding
      audioConfig: { audioEncoding: "MP3" },
    };

    try {
      const [response] = await textToSpeechClient.synthesizeSpeech(request);
      const audioContent = response.audioContent;

      res.set("Content-Type", "audio/mp3");
      res.send(audioContent);
    } catch (error) {
      console.error("ERROR:", error);
      res.sendStatus(500);
    }
  })
);

module.exports = router;
