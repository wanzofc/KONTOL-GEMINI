const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const port = 3000;

// API Key
const apikeynyah = "AIzaSyCfpuve4rPxIrorTgsAd3oYQY9izKQwVSg";
const genAI = new GoogleGenerativeAI(apikeynyah);
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));
const textToSpeech = async (text) => {
  const response = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize?key=AIzaSyCfpuve4rPxIrorTgsAd3oYQY9izKQwVSg', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: { text: text },
      voice: { languageCode: 'id-ID', name: 'id-ID-Wavenet-A' }, // Pilih suara ID dari Google TTS
      audioConfig: { audioEncoding: 'MP3' },
    }),
  });

  const data = await response.json();
  const audioContent = data.audioContent;

  // Menyimpan atau memutar file suara
  const audioBlob = new Blob([new Uint8Array(atob(audioContent).split("").map(c => c.charCodeAt(0)))], { type: 'audio/mp3' });
  const audioURL = URL.createObjectURL(audioBlob);

  // Putar suara
  const audio = new Audio(audioURL);
  audio.play();
};

textToSpeech("Halo, saya adalah bot yang berbicara dalam bahasa Indonesia.");

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/api/chat", async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Text is required!" });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-pro" });
    const result = await model.generateContent(text);
    res.json({ reply: result.response.text() });
  } catch (error) {
    console.error("Error generating response:", error);
    res.status(500).json({ error: "Failed to generate response" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
