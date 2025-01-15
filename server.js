const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const axios = require('axios'); // Menggunakan axios untuk permintaan HTTP
const app = express();
const port = 3000;
// API Key dan Project ID/Number
const apikeynyah = "AIzaSyCfpuve4rPxIrorTgsAd3oYQY9izKQwVSg";
const projectId = "gen-lang-client-0192749327"; // Project ID
const projectNumber = "690071544323"; // Project Number
const genAI = new GoogleGenerativeAI(apikeynyah);
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Fungsi textToSpeech untuk Google Cloud TTS menggunakan Axios
const textToSpeech = async (text) => {
  try {
    const response = await axios.post('https://texttospeech.googleapis.com/v1/text:synthesize', {
      input: { text: text },
      voice: { languageCode: 'id-ID', name: 'id-ID-Wavenet-A' }, // Pilih suara ID dari Google TTS
      audioConfig: { audioEncoding: 'MP3' },
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      params: {
        key: apikeynyah, // Menambahkan API Key pada query string
        projectId: projectId,  // Menambahkan Project ID pada parameter
        projectNumber: projectNumber, // Menambahkan Project Number pada parameter
      }
    });

    const audioContent = response.data.audioContent;

    if (!audioContent) {
      console.error("Failed to get audio content.");
      return;
    }

    // Mengonversi base64 menjadi buffer
    const audioBuffer = Buffer.from(audioContent, 'base64');

    // Menyimpan file suara MP3
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
