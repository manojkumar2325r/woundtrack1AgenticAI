import React, { useState } from "react";
import { MessageSquare, Send, Bot, User, Sparkles, Loader2, BookOpen } from "lucide-react";
import { api } from "../services/api";

export default function AIChatDrawer({ currentAnalysisId }) {
  const [messages, setMessages] = useState([
    {
      sender: "assistant",
      text: "Hello! I am your WoundTrack-RAG1 Assistant. Ask me anything about your wound analysis, spatial measurements, or chronic wound healing literature.",
      citations: []
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const suggestedQuestions = [
    "What does the wound area measurement mean?",
    "What factors are commonly associated with wound healing?",
    "Explain the retrieved medical research simply.",
    "What changed from my previous visit?"
  ];

  const handleSend = async (queryText) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg = { sender: "user", text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput("");
    setLoading(true);

    try {
      const res = await api.sendChatMessage(textToSend, currentAnalysisId);
      const botMsg = {
        sender: "assistant",
        text: res.response || "No response received.",
        citations: res.citations || []
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "assistant",
          text: `Unable to query AI assistant: ${err.message}`,
          isError: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      backgroundColor: "#1c2541",
      border: "1px solid #2a3860",
      borderRadius: "14px",
      display: "flex",
      flexDirection: "column",
      height: "540px",
      overflow: "hidden"
    }}>
      {/* Header */}
      <div style={{
        padding: "16px 20px",
        backgroundColor: "#0b132b",
        borderBottom: "1px solid #2a3860",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            backgroundColor: "rgba(0,180,216,0.2)",
            color: "#00b4d8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Bot size={18} />
          </div>
          <div>
            <h4 style={{ fontSize: "15px", fontWeight: 600, color: "#f8fafc", margin: 0 }}>
              WoundTrack RAG AI Assistant
            </h4>
            <span style={{ fontSize: "11px", color: "#94a3b8" }}>
              Citation-Grounded Medical Knowledge
            </span>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div style={{
        flex: 1,
        padding: "20px",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        backgroundColor: "#0b132b"
      }}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: msg.sender === "user" ? "flex-end" : "flex-start",
              maxWidth: "85%",
              alignSelf: msg.sender === "user" ? "flex-end" : "flex-start"
            }}
          >
            <div style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              flexDirection: msg.sender === "user" ? "row-reverse" : "row"
            }}>
              <div style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                backgroundColor: msg.sender === "user" ? "#00b4d8" : "#2a3860",
                color: msg.sender === "user" ? "#0b132b" : "#00b4d8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}>
                {msg.sender === "user" ? <User size={14} /> : <Bot size={14} />}
              </div>

              <div style={{
                backgroundColor: msg.sender === "user" ? "#00b4d8" : "#1c2541",
                color: msg.sender === "user" ? "#0b132b" : "#f8fafc",
                border: msg.sender === "user" ? "none" : "1px solid #2a3860",
                borderRadius: "12px",
                padding: "12px 16px",
                fontSize: "13px",
                lineHeight: "1.5",
                whiteSpace: "pre-line"
              }}>
                {msg.text}

                {/* Citations Chips */}
                {msg.citations && msg.citations.length > 0 && (
                  <div style={{ marginTop: "10px", paddingTop: "8px", borderTop: "1px solid #2a3860" }}>
                    <div style={{ fontSize: "11px", color: "#00b4d8", fontWeight: 600, marginBottom: "4px" }}>
                      Retrieved References:
                    </div>
                    {msg.citations.map((c, cIdx) => (
                      <a
                        key={cIdx}
                        href={c.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "11px",
                          backgroundColor: "#0b132b",
                          color: "#94a3b8",
                          padding: "3px 8px",
                          borderRadius: "4px",
                          marginRight: "6px",
                          marginTop: "4px",
                          textDecoration: "none"
                        }}
                      >
                        <BookOpen size={10} />
                        <span>PMID: {c.pmid}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#00b4d8", fontSize: "13px" }}>
            <Loader2 size={16} className="animate-spin-slow" />
            <span>Searching PubMed & generating answer...</span>
          </div>
        )}
      </div>

      {/* Suggested Questions */}
      <div style={{ padding: "8px 16px", backgroundColor: "#161e38", borderTop: "1px solid #2a3860", display: "flex", gap: "8px", overflowX: "auto" }}>
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            disabled={loading}
            style={{
              whiteSpace: "nowrap",
              fontSize: "11px",
              backgroundColor: "#1c2541",
              color: "#94a3b8",
              border: "1px solid #2a3860",
              borderRadius: "14px",
              padding: "4px 10px",
              cursor: "pointer"
            }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        style={{
          padding: "12px 16px",
          backgroundColor: "#1c2541",
          borderTop: "1px solid #2a3860",
          display: "flex",
          gap: "8px"
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a medical or measurement question..."
          disabled={loading}
          style={{
            flex: 1,
            backgroundColor: "#0b132b",
            border: "1px solid #2a3860",
            borderRadius: "8px",
            padding: "10px 14px",
            color: "#f8fafc",
            fontSize: "13px",
            outline: "none"
          }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            backgroundColor: loading || !input.trim() ? "#2a3860" : "#00b4d8",
            color: "#0b132b",
            border: "none",
            borderRadius: "8px",
            padding: "0 16px",
            cursor: loading || !input.trim() ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
