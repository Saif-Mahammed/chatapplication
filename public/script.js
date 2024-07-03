const userColors = [
  "#FF5733",
  "#33FF57",
  "#3357FF",
  "#FF33A1",
  "#A133FF",
  "#FF8333",
  "#33FFF5",
  "#FF3333",
  "#33FF99",
  "#FF9933",
  "#9933FF",
  "#33FFCC",
];
const chatBox = document.getElementById("chat-box");
const userMessageInput = document.getElementById("user-message");
const sendButton = document.getElementById("send-button");
const socket = io();

function getRandomColor() {
  return userColors[Math.floor(Math.random() * userColors.length)];
}

function addMessageToChat(user, message, color) {
  const messageElement = document.createElement("div");
  messageElement.classList.add("message");
  if (user === "User") {
    messageElement.classList.add("user");
  } else {
    messageElement.classList.add("bot");
  }
  messageElement.style.backgroundColor = color;
  messageElement.innerHTML = `<strong>${user}:</strong> ${message}`;
  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight;
}

socket.on("load messages", (messages) => {
  chatBox.innerHTML = "";
  messages.forEach(({ user, message, color }) => {
    addMessageToChat(user, message, color);
  });
});

socket.on("receive message", ({ user, message, color }) => {
  addMessageToChat(user, message, color);
});

sendButton.addEventListener("click", () => {
  if (userMessageInput.value.trim() !== "") {
    const user = "User";
    const message = userMessageInput.value.trim();
    const color = getRandomColor();
    socket.emit("send message", { user, message, color });
    userMessageInput.value = "";
  }
});

userMessageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && userMessageInput.value.trim() !== "") {
    sendButton.click();
  }
});
