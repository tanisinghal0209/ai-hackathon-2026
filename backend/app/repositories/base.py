from abc import ABC, abstractmethod
from typing import Generic, List, Optional, TypeVar


ModelT = TypeVar("ModelT")


class BaseRepository(ABC, Generic[ModelT]):
    """
    Common persistence contract required by SRS Chapter 21.25.
    """

    @abstractmethod
    def create(self, model: ModelT) -> ModelT:
        raise NotImplementedError

    @abstractmethod
    def update(self, model: ModelT) -> ModelT:
        raise NotImplementedError

    @abstractmethod
    def delete(self, model: ModelT) -> None:
        raise NotImplementedError

    @abstractmethod
    def find_by_id(self, model_id: str) -> Optional[ModelT]:
        raise NotImplementedError

    @abstractmethod
    def find_all(self) -> List[ModelT]:
        raise NotImplementedError

