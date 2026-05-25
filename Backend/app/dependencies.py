from fastapi import Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.repositories.claim_repository import ClaimRepository
from app.repositories.item_repository import ItemRepository
from app.repositories.message_repository import MessageRepository
from app.repositories.user_repository import UserRepository
from app.repositories.verification_repository import VerificationReportRepository
from app.services.admin_service import AdminService
from app.services.auth_service import AuthService
from app.services.contact_service import ContactService
from app.services.item_service import ItemService
from app.services.password_service import PasswordService


def get_user_repository(db: Session = Depends(get_db)) -> UserRepository:
    return UserRepository(db)


def get_item_repository(db: Session = Depends(get_db)) -> ItemRepository:
    return ItemRepository(db)


def get_verification_repository(db: Session = Depends(get_db)) -> VerificationReportRepository:
    return VerificationReportRepository(db)


def get_claim_repository(db: Session = Depends(get_db)) -> ClaimRepository:
    return ClaimRepository(db)


def get_message_repository(db: Session = Depends(get_db)) -> MessageRepository:
    return MessageRepository(db)


def get_password_service() -> PasswordService:
    return PasswordService()


def get_auth_service(
    user_repository: UserRepository = Depends(get_user_repository),
    password_service: PasswordService = Depends(get_password_service),
) -> AuthService:
    return AuthService(user_repository, password_service)


def get_item_service(
    item_repository: ItemRepository = Depends(get_item_repository),
    verification_repository: VerificationReportRepository = Depends(get_verification_repository),
    user_repository: UserRepository = Depends(get_user_repository),
) -> ItemService:
    return ItemService(item_repository, verification_repository, user_repository)


def get_admin_service(
    verification_repository: VerificationReportRepository = Depends(get_verification_repository),
    claim_repository: ClaimRepository = Depends(get_claim_repository),
    item_repository: ItemRepository = Depends(get_item_repository),
) -> AdminService:
    return AdminService(verification_repository, claim_repository, item_repository)


def get_contact_service(
    message_repository: MessageRepository = Depends(get_message_repository),
    item_repository: ItemRepository = Depends(get_item_repository),
) -> ContactService:
    return ContactService(message_repository, item_repository)
