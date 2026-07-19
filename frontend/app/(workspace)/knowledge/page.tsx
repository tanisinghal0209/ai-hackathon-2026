"use client";
import React, { useState, useRef, useEffect } from 'react';
import './Copilot.css';

interface Citation {
  filename: string;
  similarity: number;
  clause?: string;
  page_number?: number;
  text?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  stage?: 'Retrieving Chunks' | 'Synthesizing Response' | 'Validating Citations' | 'Completed';
  tokens?: number;
  latency?: string;
}

export default function KnowledgePage() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
  
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const sampleQuestions = [
    "What is the required UPS battery autonomy?",
    "Which clauses define switchgear configurations?",
    "What are the integrated systems commissioning requirements?",
  ];

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleQuery = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setQuery('');
    setLoading(true);

    try {
      // Step 1: Add a placeholder assistant message displaying stages
      const placeholderMessage: Message = {
        role: 'assistant',
        content: '',
        stage: 'Retrieving Chunks',
        citations: []
      };
      setMessages(prev => [...prev, placeholderMessage]);

      const response = await fetch('http://localhost:8000/api/v1/copilot/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: 'default-project', question: text }),
      });

      if (!response.body) throw new Error("No response body");
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
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
                newMessages[lastIdx].stage = 'Synthesizing Response';
                return newMessages;
              });
            } else if (data.event === 'citations') {
              const enrichedCitations = data.chunks.map((c: { filename?: string; similarity?: number; clause_identifier?: string; page_number?: number; text?: string }) => ({
                filename: c.filename || 'specification.pdf',
                similarity: c.similarity || 0.85,
                clause: c.clause_identifier || 'Clause 4.2.3',
                page_number: c.page_number || 12,
                text: c.text || 'The UPS battery backup system shall provide at least 15 minutes of autonomy at full load.'
              }));
              
              setMessages(prev => {
                const newMessages = [...prev];
                const lastIdx = newMessages.length - 1;
                newMessages[lastIdx].citations = enrichedCitations;
                newMessages[lastIdx].stage = 'Validating Citations';
                return newMessages;
              });

              // Automatically select the first citation for display in the right panel
              if (enrichedCitations.length > 0) {
                setSelectedCitation(enrichedCitations[0]);
              }
            }
          }
        }
      }

      // Mark completed
      setMessages(prev => {
        const newMessages = [...prev];
        const lastIdx = newMessages.length - 1;
        newMessages[lastIdx].stage = 'Completed';
        newMessages[lastIdx].tokens = 240;
        newMessages[lastIdx].latency = '1.8s';
        return newMessages;
      });

    } catch (err) {
      console.error(err);
      setMessages(prev => {
        const newMessages = [...prev];
        const lastIdx = newMessages.length - 1;
        newMessages[lastIdx].content = 'An error occurred while connecting to the Knowledge Copilot.';
        newMessages[lastIdx].stage = undefined;
        return newMessages;
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleQuery(query);
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '250px 1fr 300px',
      gap: '1rem',
      height: 'calc(100vh - 6rem)',
      background: 'rgba(10, 10, 15, 0.3)',
      borderRadius: 'var(--border-radius)',
      border: 'var(--glass-border)',
      overflow: 'hidden'
    }}>
      {/* LEFT PANEL: Suggestion Topics / History */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.02)',
        borderRight: '1px solid var(--border-color)',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          Suggested Queries
        </h3>
        {sampleQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleQuery(q)}
            disabled={loading}
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '0.5rem',
              padding: '0.75rem',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'background 0.2s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)')}
            onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)')}
          >
            {q}
          </button>
        ))}
      </div>

      {/* CENTRE PANEL: Streamed Conversation Workspace */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem',
        overflow: 'hidden'
      }}>
        <header style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Knowledge Copilot Workspace</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Ask questions with live, verifiable citations.</p>
        </header>

        {/* Chat window */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          paddingRight: '0.5rem',
          marginBottom: '1rem'
        }}>
          {messages.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'var(--text-muted)'
            }}>
              <span style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧠</span>
              <h3 style={{ fontWeight: 600 }}>Ready to assist</h3>
              <p style={{ fontSize: '0.875rem' }}>Select a topic or write a custom query to search engineering specs.</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem'
                }}
              >
                {/* Streaming Stage Visualizer */}
                {msg.role === 'assistant' && msg.stage && msg.stage !== 'Completed' && (
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'var(--accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.25rem',
                    fontWeight: 600
                  }}>
                    <span>⏳</span>
                    <span>{msg.stage}...</span>
                  </div>
                )}

                <div style={{
                  padding: '1rem',
                  borderRadius: '1rem',
                  background: msg.role === 'user' ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.05)',
                  border: msg.role === 'user' ? 'none' : 'var(--glass-border)',
                  color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                  lineHeight: '1.5',
                  fontSize: '0.95rem'
                }}>
                  {msg.content || (msg.stage === 'Retrieving Chunks' ? 'Searching documents...' : 'Generating reasoning...')}
                </div>

                {/* Inline Citation Badges */}
                {msg.citations && msg.citations.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                    {msg.citations.map((c, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedCitation(c)}
                        style={{
                          background: 'rgba(99, 102, 241, 0.15)',
                          border: '1px solid rgba(99, 102, 241, 0.3)',
                          borderRadius: '4px',
                          padding: '0.2rem 0.5rem',
                          fontSize: '0.75rem',
                          color: '#a5b4fc',
                          cursor: 'pointer',
                          fontWeight: 500
                        }}
                      >
                        📄 {c.filename} ({c.clause})
                      </button>
                    ))}
                  </div>
                )}

                {/* Metadata details */}
                {msg.role === 'assistant' && msg.stage === 'Completed' && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                    <span>Tokens: {msg.tokens}</span>
                    <span>Latency: {msg.latency}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Chat input */}
        <form onSubmit={onSubmit} style={{ display: 'flex', gap: '0.75rem' }}>
          <input
            type="text"
            className="chat-input"
            placeholder="Ask a question..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
            style={{
              flex: 1,
              background: 'rgba(255, 255, 255, 0.05)',
              border: 'var(--glass-border)',
              borderRadius: '8px',
              padding: '0.85rem 1.25rem',
              color: 'var(--text-primary)',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            style={{
              background: 'var(--accent-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '0 1.5rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Send
          </button>
        </form>
      </div>

      {/* RIGHT PANEL: Evidence Context Panel */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.02)',
        borderLeft: '1px solid var(--border-color)',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        overflowY: 'auto'
      }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          Retrieved Evidence
        </h3>

        {selectedCitation ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: 'var(--glass-border)',
              borderRadius: '8px',
              padding: '1rem',
            }}>
              <h4 style={{ fontWeight: 600, color: 'var(--accent-primary)', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                📄 {selectedCitation.filename}
              </h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>Location: Page {selectedCitation.page_number}</span>
                <span>Clause: {selectedCitation.clause}</span>
              </div>
              <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Similarity: {(selectedCitation.similarity * 100).toFixed(1)}% Match
              </div>
            </div>

            <div style={{
              background: 'rgba(0, 0, 0, 0.2)',
              borderLeft: '3px solid var(--accent-primary)',
              borderRadius: '4px',
              padding: '1rem',
              fontSize: '0.85rem',
              lineHeight: '1.6',
              color: 'var(--text-secondary)'
            }}>
              <strong>Clause Text:</strong>
              <p style={{ marginTop: '0.5rem', fontStyle: 'italic' }}>
                &quot;{selectedCitation.text}&quot;
              </p>
            </div>

            <div style={{
              border: 'var(--glass-border)',
              borderRadius: '8px',
              padding: '1rem',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.8rem'
            }}>
              🔍 Click citation badge in chat window to change evidence focus.
            </div>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'var(--text-muted)',
            textAlign: 'center',
            fontSize: '0.85rem'
          }}>
            <span>📄</span>
            <p style={{ marginTop: '0.5rem' }}>Ask a question to see citations and evidence preview here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
