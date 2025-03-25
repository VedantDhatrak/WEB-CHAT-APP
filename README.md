How It Works


Server (server.js)
Runs on port 5000 and uses WebSocket (ws) to handle real-time connections.
Listens for incoming messages from clients.
Broadcasts received messages to all other connected clients (not sending back to the sender to prevent duplicates).
Messages are exchanged in JSON format ({ text: "Hello", sender: "You" }).


Client (App.js in React)
Establishes a WebSocket connection with the server at ws://localhost:5000.
Sends user input as a JSON message to the server.
Listens for incoming messages and updates the chat window dynamically.
Displays sent messages on the right and received messages on the left (like a modern chat app).
Uses CSS for styling to make it visually appealing.
