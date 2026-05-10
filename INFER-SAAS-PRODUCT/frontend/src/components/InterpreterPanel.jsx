import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Send, Bot, User, Trash2 } from "lucide-react";

const API_URL = "https://infer-causal-saas-1.onrender.com";

export default function InterpreterPanel({ results, experimentMeta }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [interpreterAvailable, setInterpreterAvailable] = useState(false);
  const [initializing, setInitializing] = useState(true);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await axios.get(`${API_URL}/interpreter/health`);
        if (res.data.groq === "connected") {
          setInterpreterAvailable(true);
          // Get initial suggested questions by sending a dummy request or just set some default
          // The prompt says: suggestedQuestions populated from API response.
          // Wait, the API only returns suggestedQuestions ON a POST to /interpret.
          // Let's seed it with the default from backend logic or an initial hidden call?
          // Actually we can just show a default chip until the first call:
          setSuggestedQuestions([
            "Explain this result to a non-technical PM",
            "What are the main risks of this result?",
            "How confident can we be in this conclusion?"
          ]);
        } else {
          setInterpreterAvailable(false);
        }
      } catch (e) {
        setInterpreterAvailable(false);
      } finally {
        setInitializing(false);
      }
    };
    checkHealth();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const sendMessage = async (question) => {
    if (!question.trim()) return;
    
    const newMsg = { role: "user", content: question, timestamp: new Date() };
    const newMessages = [...messages, newMsg];
    
    setMessages(newMessages);
    setInputValue("");
    setLoading(true);
    
    // Only send the last 6 messages as history
    const historyToPass = newMessages.slice(-7, -1).map(m => ({
      role: m.role,
      content: m.content
    }));

    try {
      const res = await axios.post(`${API_URL}/interpret`, {
        question: question,
        results: results || {},
        experiment_meta: experimentMeta || {},
        history: historyToPass
      });
      
      const answer = res.data.answer;
      const suggested = res.data.suggested_questions || [];
      
      setMessages(prev => [...prev, {
        role: "assistant",
        content: answer,
        timestamp: new Date()
      }]);
      setSuggestedQuestions(suggested);
    } catch (e) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Analysis unavailable — try again in a moment",
        isError: true,
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const handleClear = () => {
    setMessages([]);
    // Reset suggested to defaults since we cleared history and haven't fetched
    setSuggestedQuestions([
      "Explain this result to a non-technical PM",
      "What are the main risks of this result?",
      "How confident can we be in this conclusion?"
    ]);
  };

  if (initializing) return null;

  if (!interpreterAvailable) {
    return (
      <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6 flex flex-col items-center justify-center text-center">
        <Bot className="h-10 w-10 text-slate-300 mb-3" />
        <h3 className="font-semibold text-slate-900">AI Interpreter Unavailable</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-sm">
          GROQ_API_KEY is not configured in the backend environment variables.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm flex flex-col h-[500px]">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          <Bot className="h-5 w-5 text-indigo-600" />
          Ask about this experiment
        </h3>
        {messages.length > 0 && (
          <button 
            onClick={handleClear}
            className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear conversation
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2 mt-auto">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputValue(q);
                  sendMessage(q);
                }}
                className="text-left text-sm px-4 py-2.5 rounded-xl border border-indigo-100 bg-indigo-50/50 text-indigo-700 hover:bg-indigo-100 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col max-w-[85%] ${msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"}`}>
            {msg.role === "assistant" && (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1 ml-1">
                infer
              </span>
            )}
            <div 
              className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user" 
                  ? "bg-slate-900 text-white rounded-br-sm" 
                  : msg.isError 
                    ? "bg-rose-50 text-rose-700 border border-rose-100 rounded-bl-sm"
                    : "bg-slate-100 text-slate-800 rounded-bl-sm"
              }`}
            >
              {msg.content}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 mx-1">
              {msg.timestamp ? "just now" : ""}
            </span>
          </div>
        ))}

        {loading && (
          <div className="flex flex-col max-w-[85%] mr-auto items-start">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1 ml-1">
              infer
            </span>
            <div className="px-5 py-4 rounded-2xl bg-slate-100 rounded-bl-sm flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce"></span>
              <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></span>
              <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: "0.4s"}}></span>
              <span className="text-sm text-slate-500 ml-1 font-medium">Analyzing...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-slate-100 p-4 bg-white">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about this experiment..."
            disabled={loading}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-4 pr-12 py-3.5 text-sm transition focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
          />
          <button
            onClick={() => sendMessage(inputValue)}
            disabled={loading || !inputValue.trim()}
            className="absolute right-2 p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
