import fitz  # PyMuPDF
import csv
from typing import List, Dict, Any

class DocumentParser:
    @staticmethod
    def parse_pdf(file_path: str) -> List[Dict[str, Any]]:
        """
        Parses a PDF file and extracts text page by page.
        Returns a list of dictionaries containing page_number and text.
        """
        doc = fitz.open(file_path)
        pages = []
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            text = page.get_text("text")
            pages.append({
                "page_number": page_num + 1,
                "text": text,
            })
        doc.close()
        return pages

    @staticmethod
    def chunk_text(pages: List[Dict[str, Any]], chunk_size: int = 512, overlap: int = 50) -> List[Dict[str, Any]]:
        """
        Chunks the extracted text into overlapping semantic chunks.
        Tokens are approximated by words for this basic implementation.
        """
        chunks = []
        for page in pages:
            words = page["text"].split()
            for i in range(0, len(words), chunk_size - overlap):
                chunk_words = words[i:i + chunk_size]
                if not chunk_words:
                    break
                chunk_text = " ".join(chunk_words)
                chunks.append({
                    "page_number": page["page_number"],
                    "text": chunk_text
                })
        return chunks
