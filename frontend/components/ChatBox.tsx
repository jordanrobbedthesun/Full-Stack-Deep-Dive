// ChatBox.tsx
// A tiny, beginner-friendly chat screen in React Native + TypeScript.

import React, { useState, useRef, useEffect } from "react";
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

// *****************************************
// Helper to call backend API
async function fetchGeminiReply(prompt: string): Promise<{ reply: string }> {
  // Use port 3000 (backend default)
    // Use your computer's LAN IP so mobile devices/emulators can reach it
  const url = "http://69.88.184.236:3000/api/chat"; // <-- replace with your actual IP if different
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) {
    throw new Error("Failed to get reply from Gemini backend");
  }
  return await res.json();
}
// *****************************************

// 1) Define what a "message" looks like, so TypeScript can help us.
type Message = {
  text: string;
  from: "user" | "bot";
};

import { supabase } from '../lib/supabase';

type ChatBoxProps = {
  userId: string;
  onSignOut?: () => void;
};

const ChatBox: React.FC<ChatBoxProps> = ({ userId, onSignOut }) => {
  // Online user count state
  const [onlineCount, setOnlineCount] = useState<number>(1);
  const [onlineError, setOnlineError] = useState<string | null>(null);
  // Helper: update this user's online status

  async function updateOnlineStatus() {
    const { error } = await supabase.from('online_users').upsert({
      user_id: userId,
      last_seen: new Date().toISOString(),
    });
    if (error) {
      setOnlineError('Online status error: ' + error.message);
      console.warn('Supabase online_users upsert error:', error);
    } else {
      setOnlineError(null);
    }
  }

  // Helper: remove this user's online status
  async function removeOnlineStatus() {
    const { error } = await supabase.from('online_users').delete().eq('user_id', userId);
    if (error) {
      console.warn('Supabase online_users delete error:', error);
    }
  }

  // Helper: fetch online user count (last_seen within 60s)
  async function fetchOnlineCount() {
    const { count, error } = await supabase
      .from('online_users')
      .select('user_id', { count: 'exact' })
      .gte('last_seen', new Date(Date.now() - 60000).toISOString());
    if (error) {
      setOnlineError('Online count error: ' + error.message);
      console.warn('Supabase online_users count error:', error);
    }
    setOnlineCount(count || 1);
  }

  // On mount: start interval to update online status and fetch count
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (userId) {
      updateOnlineStatus();
      fetchOnlineCount();
      interval = setInterval(() => {
        updateOnlineStatus();
        fetchOnlineCount();
      }, 30000); // every 30s
    }
    return () => {
      clearInterval(interval);
      removeOnlineStatus();
    };
    // eslint-disable-next-line
  }, [userId]);
  // 2) Screen "memory" (state):
  // - input: what's currently typed into the box
  // - messages: the whole chat history we render on screen
  // - loading: are we waiting on a bot reply?
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Load chat history for this user on mount
  useEffect(() => {
    async function loadHistory() {
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });
      if (!error && data) {
        setMessages(data.map((row: any) => ({
          text: row.text,
          from: row.sender,
        })));
      }
    }
    if (userId) loadHistory();
  }, [userId]);

  // Save a message to Supabase
  async function saveMessage(text: string, sender: 'user' | 'bot') {
    await supabase.from('chats').insert([
      { user_id: userId, text, sender }
    ]);
  }

  // 3) When the user presses "Send"
  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    setMessages((prev) => [...prev, { text, from: "user" }]);
    await saveMessage(text, 'user');
    try {
      setLoading(true);
      const res = await fetchGeminiReply(text);
      setMessages((prev) => [...prev, { text: res.reply, from: "bot" }]);
      await saveMessage(res.reply, 'bot');
    } catch (err) {
      let errorMsg = "Sorry, I couldn't get a response.";
      if (err instanceof Error) errorMsg = err.message;
      setMessages((prev) => [...prev, { text: errorMsg, from: "bot" }]);
      await saveMessage(errorMsg, 'bot');
    } finally {
      setLoading(false);
    }
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages, loading]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#e6e9f5' }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 48 : 0}
    >
      <View style={styles.screen}>
        {/* Header with sign out */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>CSSECGPT</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.onlineCount}>
              {onlineCount} online
            </Text>
            {onSignOut && (
              <TouchableOpacity style={styles.signOutBtn} onPress={onSignOut}>
                <Text style={styles.signOutText}>Sign Out</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        {onlineError && (
          <Text style={{ color: 'red', textAlign: 'center', marginTop: 4, fontSize: 13 }}>
            {onlineError}
          </Text>
        )}

        {/* Chat area with card look */}
        <View style={styles.chatCard}>
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.chat}
            keyboardShouldPersistTaps="handled"
          >
            {messages.length === 0 && !loading && (
              <Text style={styles.emptyHint}>Ask me anything!</Text>
            )}
            {messages.map((m, i) => (
              <View
                key={i}
                style={[
                  styles.bubble,
                  m.from === "user" ? styles.user : styles.bot,
                ]}
              >
                <Text
                  style={m.from === "user" ? styles.userText : styles.botText}
                >
                  {m.text}
                </Text>
              </View>
            ))}
            {loading && <Text style={styles.thinking}>Thinking...</Text>}
          </ScrollView>
        </View>

        {/* Input row: a text box + a button */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Type your question..."
            value={input}
            onChangeText={setInput}
            editable={!loading}
            onSubmitEditing={() => input.trim() && handleSend()}
            returnKeyType="send"
            blurOnSubmit={false}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (loading || !input.trim()) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={loading || !input.trim()}
            activeOpacity={0.7}
          >
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatBox;

/* 7) Styles: kept tiny and readable. */
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#e6e9f5",
    paddingTop: 0,
    paddingHorizontal: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#4b3bbd',
    paddingTop: 44,
    paddingBottom: 16,
    paddingHorizontal: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  onlineCount: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginRight: 16,
    backgroundColor: '#6f5cff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  signOutBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#4b3bbd',
  },
  signOutText: {
    color: '#4b3bbd',
    fontWeight: 'bold',
    fontSize: 15,
  },
  chatCard: {
    flex: 1,
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 22,
    paddingVertical: 8,
    paddingHorizontal: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
    minHeight: 200,
    maxHeight: '80%',
  },
  title: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  chatWrap: {
    flex: 1,
    minHeight: 0,
    paddingBottom: 4,
  },
  chat: {
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 16,
  },
  emptyHint: {
    color: '#aaa',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 32,
  },
  bubble: {
    maxWidth: '80%',
    padding: 14,
    borderRadius: 20,
    marginVertical: 7,
    marginBottom: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  user: {
    alignSelf: 'flex-end',
    backgroundColor: '#4b3bbd',
    borderBottomRightRadius: 8,
    borderTopRightRadius: 8,
  },
  bot: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f7',
    borderBottomLeftRadius: 8,
    borderTopLeftRadius: 8,
  },
  userText: { color: 'white', fontSize: 16 },
  botText: { color: '#2a2a2a', fontSize: 16 },
  thinking: {
    color: "#666",
    fontStyle: "italic",
    marginTop: 4,
    alignSelf: "flex-start",
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    backgroundColor: "white",
  },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#bbb",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 4,
  },
  sendBtn: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: "#6f5cff",
    borderRadius: 20,
    marginLeft: 2,
  },
  sendBtnDisabled: {
    backgroundColor: "#bdb7f7",
  },
  sendText: { color: "white", fontWeight: "600", fontSize: 16 },
});