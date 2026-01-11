const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { customAlphabet } = require('nanoid');

const app = express();
const PORT = 3000;

const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const generateShortId = customAlphabet(alphabet, 3);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

const dirs = [
    path.join(__dirname, 'messages'),
    path.join(__dirname, 'uploads'),
    path.join(__dirname, 'data')
];
dirs.forEach(dir => { if (!fs.existsSync(dir)) fs.mkdirSync(dir); });

const METADATA_PATH = path.join(__dirname, 'data', 'metadata.json');
if (!fs.existsSync(METADATA_PATH)) fs.writeFileSync(METADATA_PATH, JSON.stringify({}));

const getMetadata = () => JSON.parse(fs.readFileSync(METADATA_PATH));
const saveMetadata = (data) => fs.writeFileSync(METADATA_PATH, JSON.stringify(data, null, 2));

const storage = multer.diskStorage({
    destination: path.join(__dirname, 'uploads'),
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 }
});

app.post('/api/send', upload.single('file'), (req, res) => {
    try {
        const { message } = req.body;
        const file = req.file;

        if (!message && !file) return res.status(400).json({ error: "No content" });

        const metadata = getMetadata();
        let transferCode;
        do {
            transferCode = generateShortId();
        } while (metadata[transferCode]);

        let messageFilePath = null;
        if (message && message.trim() !== "") {
            messageFilePath = path.join(__dirname, 'messages', `${transferCode}.txt`);
            fs.writeFileSync(messageFilePath, message);
        }

        metadata[transferCode] = {
            messageFile: messageFilePath,
            uploadFile: file ? file.path : null,
            originalName: file ? file.originalname : null,
            fileSize: file ? (file.size / (1024 * 1024)).toFixed(2) + " MB" : null,
            expiresAt: Date.now() + (24 * 60 * 60 * 1000)
        };
        
        saveMetadata(metadata);
        res.status(200).json({ transferCode });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/receive/:code', (req, res) => {
    try {
        const code = req.params.code.toUpperCase();
        const metadata = getMetadata();
        const entry = metadata[code];

        if (!entry) return res.status(404).json({ error: "Invalid code" });

        if (Date.now() > entry.expiresAt) {
            return res.status(410).json({ error: "Code expired" });
        }

        let messageContent = "";
        if (entry.messageFile && fs.existsSync(entry.messageFile)) {
            messageContent = fs.readFileSync(entry.messageFile, 'utf8');
        }

        res.json({
            message: messageContent,
            fileName: entry.originalName,
            fileSize: entry.fileSize,
            hasFile: !!entry.uploadFile,
            downloadUrl: entry.uploadFile ? `/api/download/${code}` : null
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/download/:code', (req, res) => {
    const code = req.params.code.toUpperCase();
    const metadata = getMetadata();
    const entry = metadata[code];

    if (!entry || !entry.uploadFile || !fs.existsSync(entry.uploadFile)) {
        return res.status(404).send("File not found");
    }

    res.download(entry.uploadFile, entry.originalName);
});

app.listen(PORT, () => console.log(`✅ Server: http://localhost:${PORT}`));