// ChatBox.tsx
// Beginner-friendly chat UI in React Native + TypeScript.
// Goal: very simple + clean layout, with spacing so nothing
// feels squished at the top or bottom.

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

// ********************************************
import { sendMessage } from "../config/api";     // subject to change to real api
// ********************************************

// Define the shape of a chat message
type Message = {
  text: string;
  from: "user" | "bot"; // "user" = you, "bot" = assistant
};

const ChatBox: React.FC = () => {
  // State = the "memory" of this screen
  const [input, setInput] = useState<string>(""); // what you're typing now
  const [messages, setMessages] = useState<Message[]>([]); // chat history
  const [loading, setLoading] = useState<boolean>(false); // waiting on bot?

  // Handle "Send" button
  const handleSend = async () => {
    const text = input.trim();
    if (!text) return; // don't send empty text

    setInput(""); // clear the box fast
    setMessages((prev) => [...prev, { text, from: "user" }]); // show user msg

    try {
      setLoading(true);
      const res = await sendMessage(text); // pretend API call
      setMessages((prev) => [...prev, { text: res.reply, from: "bot" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    // KeyboardAvoidingView keeps input visible when keyboard is open
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Screen title */}
      <Text style={styles.title}>BOB THE GUIDE</Text>

      {/* Scrollable chat area */}
      <ScrollView
        style={styles.chatArea}
        contentContainerStyle={styles.chatContent}
      >
        {messages.map((m, i) => (
          <View
            key={i}
            style={[
              styles.bubble,
              m.from === "user" ? styles.user : styles.bot,
            ]}
          >
            <Text style={m.from === "user" ? styles.userText : styles.botText}>
              {m.text}
            </Text>
          </View>
        ))}
        {loading && <Text style={styles.thinking}>Thinking...</Text>}
      </ScrollView>

      {/* Input row (floats above bottom with extra margin) */}
      <View style={styles.inputWrapper}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Ask me anything..."
            value={input}
            onChangeText={setInput}
            editable={!loading}
            onSubmitEditing={() => input.trim() && handleSend()}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={styles.sendBtn}
            onPress={handleSend}
            disabled={loading || !input.trim()}
          >
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatBox;

/* Styles: very simple + spaced nicely */
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f7f7f7",
    paddingTop: 70, // more breathing room from top
  },
  title: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20, // push chat list further down
  },

  // Chat area in the middle
  chatArea: { flex: 1 },
  chatContent: {
    padding: 20,
    paddingBottom: 100, // leave space above the input row
  },

  // Message bubbles
  bubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
    marginVertical: 8,
  },
  user: { alignSelf: "flex-end", backgroundColor: "#6f5cff" },
  bot: { alignSelf: "flex-start", backgroundColor: "#ececec" },
  userText: { color: "white" },
  botText: { color: "#222" },
  thinking: {
    color: "#666",
    fontStyle: "italic",
    marginTop: 6,
    alignSelf: "flex-start",
  },

  // Input wrapper gives extra bottom margin so it "floats"
  inputWrapper: {
    padding: 20,
    paddingBottom: 30, // more distance from bottom edge
    backgroundColor: "transparent",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2, // Android shadow
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  sendBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#6f5cff",
    borderRadius: 20,
    marginLeft: 8,
  },
  sendText: { color: "white", fontWeight: "600" },
});
