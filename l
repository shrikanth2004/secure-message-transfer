README: SecureTransfer
SecureTransfer is a lightweight, secure message and file sharing system built with Node.js and Express. It allows users to generate short, 3-character transfer codes to share text or files (PDFs, images, documents) that remain accessible for 24 hours.

🚀 Live Demo
Hosted Link: [Insert Link Here]

📂 Project Structure
/secure-message-transfer
├── /backend
│   ├── /data          # Stores metadata.json
│   ├── /messages      # Stores .txt messages
│   ├── /uploads       # Stores uploaded files
│   ├── server.js      # Express server logic
│   └── package.json   
└── /frontend
    ├── index.html     # Landing page
    ├── send.html      # Send interface
    ├── receive.html   # Retrieval interface
    └── style.css      # Responsive styles
🛠️ Installation & Setup
Follow these steps to get the project running locally:

1. Clone the repository

git clone <your-github-repo-url>
cd secure-message-transfer/backend
2. Install dependencies

npm install express multer cors nanoid@3
3. Start the server

node server.js
4. Access the application Open your browser and navigate to: http://localhost:3000

⚙️ How It Works
Sending: Users enter a message or select a file. The system generates a unique, 3-character alphanumeric code (e.g., A7G).

Storage: Text is saved as .txt files in /messages, and files are stored in /uploads.

Receiving: Anyone with the code can enter it on the "Receive" page to view the message or download the file.

Multi-Access: The code stays active for multiple users for 24 hours.

Cleanup: A background task automatically deletes expired files every hour to maintain privacy and storage.

🛡️ Security Features
Case-Insensitive Codes: Input is automatically converted to uppercase for user convenience.

File Type Filtering: Only allows PDFs, images, and standard documents.

Size Limits: Prevents server overload by limiting uploads to 100MB.

Automatic Expiration: Data is wiped after 24 hours to ensure privacy.
