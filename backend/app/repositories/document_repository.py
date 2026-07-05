from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.core import Document
from app.repositories.base import BaseRepository


class DocumentRepository(BaseRepository[Document]):
    """Persistence abstraction for project documents."""

    def __init__(self, db: Session):
        self.db = db

    def create(self, document: Document) -> Document:
        self.db.add(document)
        self.db.commit()
        self.db.refresh(document)
        return document

    def update(self, document: Document) -> Document:
        self.db.add(document)
        self.db.commit()
        self.db.refresh(document)
        return document

    def delete(self, document: Document) -> None:
        self.db.delete(document)
        self.db.commit()

    def find_by_id(self, document_id: str) -> Optional[Document]:
        return self.db.query(Document).filter(Document.id == document_id).first()

    def get_by_id(self, document_id: str) -> Optional[Document]:
        return self.find_by_id(document_id)

    def find_all(self) -> List[Document]:
        return self.db.query(Document).all()
