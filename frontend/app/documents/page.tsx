"use client";
import React, { useState, useEffect, useRef } from 'react';

interface DocumentInfo {
  document_id: string;
  filename: string;
  category?: string;
  status: string;
  upload_timestamp?: string;
  page_count?: number;
  file_size?: number;
}

interface UploadProgressStep {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  duration: number; // in seconds
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocumentInfo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // PDF Viewer states
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInDoc, setSearchInDoc] = useState('');
  const [highlightedCitation, setHighlightedCitation] = useState<number | null>(null);

  // Upload Experience States
  const [uploading, setUploading] = useState(false);
  const [uploadSteps, setUploadSteps] = useState<UploadProgressStep[]>([
    { name: 'Upload Complete', status: 'pending', duration: 0 },
    { name: 'Validation', status: 'pending', duration: 0 },
    { name: 'Queued', status: 'pending', duration: 0 },
    { name: 'Parsing', status: 'pending', duration: 0 },
    { name: 'OCR processing', status: 'pending', duration: 0 },
    { name: 'Chunk Generation', status: 'pending', duration: 0 },
    { name: 'Embedding Indexing', status: 'pending', duration: 0 },
    { name: 'Completed', status: 'pending', duration: 0 },
  ]);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const mockCitations = [
    { id: 1, page: 2, clause: 'Clause 4.2.1', text: 'The main electrical feed configuration must utilize N+1 redundancy systems.' },
    { id: 2, page: 5, clause: 'Clause 5.1.2', text: 'Battery runtime holding capacity shall exceed fifteen minutes autonomy at full load conditions.' },
    { id: 3, page: 8, clause: 'Clause 8.4', text: 'Equipment compliance and certification details must map to standard IEC 62040.' }
  ];

  const fetchDocuments = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/ingestion/');
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
        if (data.length > 0 && !selectedDoc) {
          setSelectedDoc(data[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch documents", err);
    }
  };

  useEffect(() => {
    fetchDocuments();
    const interval = setInterval(fetchDocuments, 8000);
    return () => clearInterval(interval);
  }, []);

  // Simulate long running upload stages
  const startUploadSimulation = () => {
    setUploading(true);
    let currentIdx = 0;
    setActiveStepIndex(0);
    
    const stepsCopy = [
      { name: 'Upload Complete', status: 'running', duration: 0 },
      { name: 'Validation', status: 'pending', duration: 0 },
      { name: 'Queued', status: 'pending', duration: 0 },
      { name: 'Parsing', status: 'running', duration: 0 },
      { name: 'OCR processing', status: 'pending', duration: 0 },
      { name: 'Chunk Generation', status: 'pending', duration: 0 },
      { name: 'Embedding Indexing', status: 'pending', duration: 0 },
      { name: 'Completed', status: 'pending', duration: 0 },
    ] as UploadProgressStep[];

    setUploadSteps(stepsCopy);

    const stepIntervals = [1, 2, 1, 3, 2, 2, 2, 1];

    const runStep = () => {
      if (currentIdx >= stepsCopy.length) {
        setUploading(false);
        fetchDocuments();
        return;
      }

      // Mark current completed
      stepsCopy[currentIdx].status = 'completed';
      stepsCopy[currentIdx].duration = stepIntervals[currentIdx];
      
      currentIdx++;
      if (currentIdx < stepsCopy.length) {
        stepsCopy[currentIdx].status = 'running';
        setActiveStepIndex(currentIdx);
        setTimeout(runStep, stepIntervals[currentIdx] * 1000);
      } else {
        setUploading(false);
        fetchDocuments();
      }
      setUploadSteps([...stepsCopy]);
    };

    setTimeout(runStep, stepIntervals[0] * 1000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const formData = new FormData();
    formData.append('file', file);

    startUploadSimulation();

    try {
      await fetch('http://localhost:8000/api/v1/ingestion/upload', {
        method: 'POST',
        body: formData,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.filename.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: 'calc(100vh - 6rem)' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Document Library</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
            Unified project technical documentation and interactive verification workspace.
          </p>
        </div>
        
        {/* Upload Button */}
        <div style={{ position: 'relative' }}>
          <button style={{
            background: 'var(--accent-primary)',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1.25rem',
            borderRadius: '4px',
            fontWeight: 600,
            cursor: 'pointer'
          }}>
            Upload Document ➔
          </button>
          <input 
            type="file" 
            accept=".pdf,.csv"
            onChange={handleFileUpload}
            disabled={uploading}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: 0,
              cursor: 'pointer'
            }} 
          />
        </div>
      </header>

      {/* Main split grid */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '320px 1fr',
        gap: '1rem',
        overflow: 'hidden'
      }}>
        {/* LEFT PANEL: Document list & Upload Simulation */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          overflowY: 'auto'
        }}>
          {/* Upload Progress Tracker */}
          {uploading && (
            <div style={{
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: 'var(--border-radius)',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <h4 style={{ margin: 0, fontSize: '0.85rem', color: '#a5b4fc', display: 'flex', justifyContent: 'space-between' }}>
                <span>Ingestion Pipeline</span>
                <span>Active</span>
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.75rem' }}>
                {uploadSteps.map((step, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', color: step.status === 'completed' ? '#10b981' : step.status === 'running' ? '#f59e0b' : 'var(--text-muted)' }}>
                    <span>{step.status === 'completed' ? '✓' : step.status === 'running' ? '●' : '○'} {step.name}</span>
                    <span>{step.status === 'completed' ? `${step.duration}s` : step.status === 'running' ? 'Active' : ''}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* List Search & Filter */}
          <div style={{
            background: 'var(--bg-surface)',
            border: 'var(--glass-border)',
            borderRadius: 'var(--border-radius)',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <input 
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'rgba(0, 0, 0, 0.2)',
                border: 'var(--glass-border)',
                borderRadius: '4px',
                padding: '0.5rem',
                color: 'var(--text-primary)',
                fontSize: '0.8rem'
              }}
            />
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              {['All', 'Specification', 'Submittal'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  style={{
                    flex: 1,
                    background: categoryFilter === cat ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                    border: 'none',
                    padding: '0.25rem',
                    borderRadius: '4px',
                    color: 'white',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* List Wrapper */}
          <div style={{
            background: 'var(--bg-surface)',
            border: 'var(--glass-border)',
            borderRadius: 'var(--border-radius)',
            flex: 1,
            overflowY: 'auto'
          }}>
            {filteredDocs.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem', fontSize: '0.85rem' }}>
                No documents found.
              </div>
            ) : (
              filteredDocs.map((doc) => {
                const isSelected = selectedDoc?.document_id === doc.document_id;
                return (
                  <div
                    key={doc.document_id}
                    onClick={() => {
                      setSelectedDoc(doc);
                      setCurrentPage(1);
                      setHighlightedCitation(null);
                    }}
                    style={{
                      padding: '1rem',
                      borderBottom: '1px solid var(--border-color)',
                      cursor: 'pointer',
                      background: isSelected ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                      transition: 'background 0.2s ease'
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      📄 {doc.filename}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      <span>{doc.status}</span>
                      <span>Page Count: {doc.page_count || 'Pending'}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Coordinated Document Viewer */}
        {selectedDoc ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 280px',
            gap: '1rem',
            overflow: 'hidden'
          }}>
            {/* Integrated PDF View Area */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: 'var(--glass-border)',
              borderRadius: 'var(--border-radius)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}>
              {/* Toolbar */}
              <div style={{
                padding: '0.5rem 1rem',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(0,0,0,0.1)'
              }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', borderRadius: '4px', padding: '0.2rem 0.5rem', cursor: 'pointer' }}>◀</button>
                  <span style={{ fontSize: '0.85rem' }}>Page {currentPage} of {selectedDoc.page_count || 10}</span>
                  <button onClick={() => setCurrentPage(prev => Math.min(selectedDoc.page_count || 10, prev + 1))} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', borderRadius: '4px', padding: '0.2rem 0.5rem', cursor: 'pointer' }}>▶</button>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button onClick={() => setZoom(prev => Math.max(50, prev - 10))} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', borderRadius: '4px', padding: '0.2rem 0.5rem', cursor: 'pointer' }}>-</button>
                  <span style={{ fontSize: '0.85rem' }}>{zoom}%</span>
                  <button onClick={() => setZoom(prev => Math.min(200, prev + 10))} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', borderRadius: '4px', padding: '0.2rem 0.5rem', cursor: 'pointer' }}>+</button>
                </div>
              </div>

              {/* PDF Mock Page Canvas */}
              <div style={{
                flex: 1,
                background: 'rgba(0, 0, 0, 0.4)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                padding: '2rem',
                overflowY: 'auto'
              }}>
                <div style={{
                  width: `${zoom * 5.5}px`,
                  minHeight: `${zoom * 7}px`,
                  background: 'white',
                  color: '#333333',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.5)',
                  padding: '2rem',
                  fontSize: '0.9rem',
                  lineHeight: '1.5',
                  transition: 'width 0.2s, min-height 0.2s',
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    fontSize: '0.75rem',
                    color: '#999999'
                  }}>
                    Page {currentPage}
                  </div>

                  <h3 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#1e293b' }}>
                    {selectedDoc.filename} (Excerpt)
                  </h3>

                  {currentPage === 2 ? (
                    <div>
                      <p>Section 4.2 - Power Redundancy Systems</p>
                      <p style={{
                        background: highlightedCitation === 1 ? '#fef08a' : 'transparent',
                        padding: '0.2rem',
                        transition: 'background 0.3s ease',
                        borderLeft: highlightedCitation === 1 ? '3px solid #eab308' : 'none'
                      }}>
                        The main electrical feed configuration must utilize N+1 redundancy systems to support continuous failover sequences across the data center utility buses.
                      </p>
                    </div>
                  ) : currentPage === 5 ? (
                    <div>
                      <p>Section 5.1 - Battery backup Capacity</p>
                      <p style={{
                        background: highlightedCitation === 2 ? '#fef08a' : 'transparent',
                        padding: '0.2rem',
                        transition: 'background 0.3s ease',
                        borderLeft: highlightedCitation === 2 ? '3px solid #eab308' : 'none'
                      }}>
                        Battery runtime holding capacity shall exceed fifteen minutes autonomy at full load conditions before battery storage triggers lower power safety configurations.
                      </p>
                    </div>
                  ) : currentPage === 8 ? (
                    <div>
                      <p>Section 8.4 - Standards Certification</p>
                      <p style={{
                        background: highlightedCitation === 3 ? '#fef08a' : 'transparent',
                        padding: '0.2rem',
                        transition: 'background 0.3s ease',
                        borderLeft: highlightedCitation === 3 ? '3px solid #eab308' : 'none'
                      }}>
                        Equipment compliance and certification details must map to standard IEC 62040 and certifications must remain active throughout deployment lifecycle.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p>This is a simulated document view representing page {currentPage} of the active document.</p>
                      <p>All parsed chunks and semantic entities are cataloged in the metadata panel. Clicking citations will navigate the PDF canvas automatically.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Citations & Metadata Panels */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              overflowY: 'auto'
            }}>
              {/* Citations List Panel */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: 'var(--glass-border)',
                borderRadius: 'var(--border-radius)',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                  AI References & Citations
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {mockCitations.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => {
                        setCurrentPage(c.page);
                        setHighlightedCitation(c.id);
                      }}
                      style={{
                        background: highlightedCitation === c.id ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.03)',
                        border: highlightedCitation === c.id ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '4px',
                        padding: '0.5rem',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        transition: 'background 0.2s ease'
                      }}
                    >
                      <div style={{ fontWeight: 600, color: '#a5b4fc' }}>{c.clause} (Page {c.page})</div>
                      <div style={{ color: 'var(--text-secondary)', marginTop: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Document Metadata Panel */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: 'var(--glass-border)',
                borderRadius: 'var(--border-radius)',
                padding: '1rem',
                fontSize: '0.8rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                  Document Metadata
                </h4>
                <div><strong>Filename:</strong> {selectedDoc.filename}</div>
                <div><strong>Category:</strong> {selectedDoc.category || 'Specification'}</div>
                <div><strong>Status:</strong> {selectedDoc.status}</div>
                <div><strong>Uploader:</strong> Uploader 1</div>
                <div><strong>Format:</strong> PDF Document</div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.02)',
            border: 'var(--glass-border)',
            borderRadius: 'var(--border-radius)',
            color: 'var(--text-muted)'
          }}>
            Select a document from the library to load the integrated PDF viewer workspace.
          </div>
        )}
      </div>
    </div>
  );
}
