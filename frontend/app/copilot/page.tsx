"use client";
import React, { useState, useRef, useEffect } from 'react';
import './Copilot.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  citations?: any[];
}

export default function CopilotPage() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMessage: Message = { role: 'user', content: query };
    setMessages(prev => [...prev, userMessage]);
    setQuery('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/v1/copilot/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: 'default-project', question: userMessage.content }),
      });

      if (!response.body) throw new Error("No response body");
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      // Initialize assistant message
      setMessages(prev => [...prev, { role: 'assistant', content: '', citations: [] }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunkStr = decoder.decode(value);
        const lines = chunkStr.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            
            if (data.event === 'text') {
              setMessages(prev => {
                const newMessages = [...prev];
                const lastIdx = newMessages.length - 1;
                newMessages[lastIdx].content += data.content;
                return newMessages;
              });
            } else if (data.event === 'citations') {
              setMessages(prev => {
                const newMessages = [...prev];
                const lastIdx = newMessages.length - 1;
                newMessages[lastIdx].citations = data.chunks;
                return newMessages;
              });
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'An error occurred while connecting to the Knowledge Copilot.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="copilot-container">
      <header className="copilot-header">
        <h1>Knowledge Copilot</h1>
        <p>Ask questions about your EPC project documents.</p>
      </header>

      <div className="chat-window">
        {messages.length === 0 ? (
          <div className="empty-state">
            <span className="brain-icon">🧠</span>
            <h3>How can I help you today?</h3>
            <p>Try asking about the UPS redundancy requirements or the critical path for commissioning.</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.role}`}>
              <div className="message-content">
                {msg.content}
              </div>
              {msg.citations && msg.citations.length > 0 && (
                <div className="citations-block">
                  <strong>Supporting Evidence:</strong>
                  <ul>
                    {msg.citations.map((c, i) => (
                      <li key={i}>{c.filename} - Score: {c.similarity.toFixed(2)}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={endOfMessagesRef} />
      </div>

      <form className="chat-input-form" onSubmit={handleSubmit}>
        <input 
          type="text" 
          className="chat-input" 
          placeholder="Ask a question..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={loading}
        />
        <button type="submit" className="chat-submit" disabled={loading || !query.trim()}>
          {loading ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );
}
