import fitz  # PyMuPDF
import re
from typing import List, Dict, Any

class DocumentParser:
    @staticmethod
    def classify_semantic_role(text: str) -> str:
        """
        EDR 20-H: Semantic role classification based on engineering keywords.
        """
        text_lower = text.lower()
        if any(word in text_lower for word in ["shall", "must", "required", "mandatory"]):
            return "Mandatory Requirement"
        if any(word in text_lower for word in ["should", "recommended", "advised"]):
            return "Recommendation"
        if any(word in text_lower for word in ["note:", "for example", "e.g."]):
            return "Explanatory Note"
        if any(word in text_lower for word in ["warning", "caution", "danger"]):
            return "Warning"
        return "Informational Content"

    @staticmethod
    def parse_pdf(file_path: str) -> List[Dict[str, Any]]:
        """
        EDR 20-E & 20-G: Parses PDF into a structured intermediate representation.
        Uses font sizes to detect headings and preserves structural boundaries.
        """
        doc = fitz.open(file_path)
        blocks_data = []
        
        # Heuristic: Find the median font size to distinguish body text from headings
        all_sizes = []
        for page_num in range(min(5, len(doc))): # Sample first 5 pages
            page = doc.load_page(page_num)
            page_dict = page.get_text("dict")
            for block in page_dict.get("blocks", []):
                if block.get("type") == 0:
                    for line in block.get("lines", []):
                        for span in line.get("spans", []):
                            all_sizes.append(span.get("size", 10))
        
        if all_sizes:
            all_sizes.sort()
            median_size = all_sizes[len(all_sizes) // 2]
        else:
            median_size = 11.0 # fallback

        current_heading = "Document Root"
        
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            page_dict = page.get_text("dict")
            
            for block in page_dict.get("blocks", []):
                if block.get("type") == 0:  # text block
                    block_text = ""
                    max_size = 0
                    
                    for line in block.get("lines", []):
                        for span in line.get("spans", []):
                            block_text += span.get("text", "") + " "
                            if span.get("size", 0) > max_size:
                                max_size = span.get("size", 0)
                                
                    block_text = block_text.strip()
                    if not block_text:
                        continue
                        
                    # Heading detection heuristic: larger font or looks like a clause "4.2.1 Title"
                    is_clause = re.match(r'^\d+(\.\d+)*\s+[A-Z]', block_text)
                    is_heading = (max_size > median_size + 1.5) or is_clause
                    
                    if is_heading and len(block_text.split()) < 15:
                        current_heading = block_text
                        blocks_data.append({
                            "type": "heading",
                            "page_number": page_num + 1,
                            "text": block_text,
                            "hierarchy": current_heading,
                            "semantic_role": "Heading"
                        })
                    else:
                        semantic_role = DocumentParser.classify_semantic_role(block_text)
                        blocks_data.append({
                            "type": "paragraph",
                            "page_number": page_num + 1,
                            "text": block_text,
                            "hierarchy": current_heading,
                            "semantic_role": semantic_role
                        })
        doc.close()
        return blocks_data

    @staticmethod
    def chunk_text(structured_blocks: List[Dict[str, Any]], chunk_size: int = 512, overlap: int = 50) -> List[Dict[str, Any]]:
        """
        Chunks the intermediate structured representation while preserving context.
        Injects the heading hierarchy and semantic role directly into the chunk text.
        """
        chunks = []
        current_chunk_words = []
        current_chunk_length = 0
        current_page = 1
        current_hierarchy = ""
        current_role = ""
        
        for block in structured_blocks:
            if block["type"] == "heading":
                continue # We don't chunk headings alone, we inject them into paragraphs
                
            block_words = block["text"].split()
            current_hierarchy = block["hierarchy"]
            current_role = block["semantic_role"]
            current_page = block["page_number"]
            
            # Format the text with structural context
            formatted_block = f"[{current_hierarchy}] ({current_role}): {block['text']}"
            formatted_words = formatted_block.split()
            
            if current_chunk_length + len(formatted_words) > chunk_size and current_chunk_words:
                # Save chunk
                chunks.append({
                    "page_number": current_page,
                    "text": " ".join(current_chunk_words)
                })
                # Keep overlap (simplified logic for overlap spanning block boundaries)
                overlap_words = current_chunk_words[-overlap:] if overlap < len(current_chunk_words) else []
                current_chunk_words = overlap_words + formatted_words
                current_chunk_length = len(current_chunk_words)
            else:
                current_chunk_words.extend(formatted_words)
                current_chunk_length += len(formatted_words)
                
        # Append final chunk
        if current_chunk_words:
            chunks.append({
                "page_number": current_page,
                "text": " ".join(current_chunk_words)
            })
            
        return chunks
