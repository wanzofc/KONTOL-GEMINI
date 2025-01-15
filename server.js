const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const axios = require('axios');
const app = express();
const port = 3000;
const apikeynyah = "AIzaSyCfpuve4rPxIrorTgsAd3oYQY9izKQwVSg";
const genAI = new GoogleGenerativeAI(apikeynyah);
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));
const textToSpeech = async (text) => {
  try {
    const response = await axios.post('https://texttospeech.googleapis.com/v1/text:synthesize', {
      input: { text: text },
      voice: { languageCode: 'id-ID', name: 'id-ID-Wavenet-A' },
      audioConfig: { audioEncoding: 'MP3' },
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      params: {
        key: apikeynyah 
      }
    });
    const audioContent = response.data.audioContent;

    if (!audioContent) {
      console.error("Failed to get audio content.");
      return;
    }
    const audioBuffer = Buffer.from(audioContent, 'base64');
    fs.writeFileSync('output.mp3', audioBuffer);
    console.log("Audio has been saved as 'output.mp3'");

    // Anda bisa menambahkan logika untuk memutar audio menggunakan library atau server lain sesuai kebutuhan
  } catch (error) {
    console.error("Error generating speech:", error);
  }
};

// Contoh penggunaan
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
