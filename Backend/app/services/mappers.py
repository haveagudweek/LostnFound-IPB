from app.models import Claim, ContactMessage, Item, User, VerificationReport
from app.schemas import ClaimResponse, ContactMessageResponse, ItemResponse, UserResponse, VerificationReportResponse


class ResponseMapper:
    @staticmethod
    def user(user: User) -> UserResponse:
        return UserResponse(id=user.id, name=user.name, email=user.email, nim=user.nim, role=user.role)

    @staticmethod
    def item(item: Item) -> ItemResponse:
        return ItemResponse(
            id=item.id,
            name=item.name,
            image=item.image,
            location=item.location,
            time=item.time,
            category=item.category,
            status=item.status,
            description=item.description,
            reporterId=item.reporter_id,
        )

    @staticmethod
    def verification_report(report: VerificationReport) -> VerificationReportResponse:
        return VerificationReportResponse(
            id=report.id,
            itemId=report.item_id,
            name=report.name,
            reporterName=report.reporter_name,
            image=report.image,
            location=report.location,
            detailLocation=report.detail_location,
            time=report.time,
            reportTime=report.report_time,
            category=report.category,
            tag=report.tag,
            reportType=report.report_type,
            status=report.status,
            description=report.description,
            reporterId=report.reporter_id,
        )

    @staticmethod
    def claim(claim: Claim) -> ClaimResponse:
        return ClaimResponse(
            id=claim.id,
            itemId=claim.item_id,
            reportId=claim.report_id,
            itemName=claim.item_name,
            image=claim.image,
            ownerName=claim.owner_name,
            nim=claim.nim,
            faculty=claim.faculty,
            contact=claim.contact,
            location=claim.location,
            foundDate=claim.found_date,
            foundTime=claim.found_time,
            claimDate=claim.claim_date,
            status=claim.status,
            evidenceAttached=claim.evidence_attached,
            description=claim.description,
            adminNote=claim.admin_note,
            history=claim.history,
        )

    @staticmethod
    def message(message: ContactMessage) -> ContactMessageResponse:
        return ContactMessageResponse(
            id=message.id,
            itemId=message.item_id,
            message=message.message,
            status="sent",
        )
