import re
from typing import List, Dict

class CitationValidationService:
    """
    Chapter 17.15 - Citation Validation
    Ensures that every chunk identifier cited by Claude actually exists 
    in the context that was provided for that specific request.
    """
    
    @staticmethod
    def validate_citations(generated_text: str, retrieved_chunks: List[Dict]) -> bool:
        """
        Parses the generated text for [CHUNK_ID: xyz] tags and validates
        them against the retrieved_chunks list.
        
        Returns False if any cited chunk was not part of the retrieved context.
        """
        # Find all cited chunk IDs in the text
        cited_ids = re.findall(r'\[CHUNK_ID:\s*(.*?)\]', generated_text)
        
        if not cited_ids:
            return True # No citations to validate
            
        valid_chunk_ids = {str(chunk.get('chunk_id')) for chunk in retrieved_chunks}
        
        for cited_id in cited_ids:
            if str(cited_id).strip() not in valid_chunk_ids:
                return False
                
        return True
