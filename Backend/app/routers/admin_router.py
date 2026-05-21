from fastapi import APIRouter, Depends

from app.dependencies import get_admin_service
from app.schemas import ClaimCreateRequest, ClaimResponse, VerificationReportResponse, VerifyActionRequest
from app.services.admin_service import AdminService


router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/verification", response_model=list[VerificationReportResponse])
def list_verification_reports(service: AdminService = Depends(get_admin_service)) -> list[VerificationReportResponse]:
    return service.list_verification_reports()


@router.get("/verification/{report_id}", response_model=VerificationReportResponse)
def get_verification_report(
    report_id: str,
    service: AdminService = Depends(get_admin_service),
) -> VerificationReportResponse:
    return service.get_verification_report(report_id)


@router.patch("/verification/{report_id}", response_model=VerificationReportResponse)
def verify_report(
    report_id: str,
    payload: VerifyActionRequest,
    service: AdminService = Depends(get_admin_service),
) -> VerificationReportResponse:
    return service.verify_report(report_id, payload.action)


@router.get("/claims", response_model=list[ClaimResponse])
def list_claims(service: AdminService = Depends(get_admin_service)) -> list[ClaimResponse]:
    return service.list_claims()


@router.post("/claims", response_model=ClaimResponse)
def create_claim(
    payload: ClaimCreateRequest,
    service: AdminService = Depends(get_admin_service),
) -> ClaimResponse:
    return service.create_claim(payload)


@router.get("/claims/{claim_id}", response_model=ClaimResponse)
def get_claim(claim_id: str, service: AdminService = Depends(get_admin_service)) -> ClaimResponse:
    return service.get_claim(claim_id)


@router.patch("/claims/{claim_id}", response_model=ClaimResponse)
def verify_claim(
    claim_id: str,
    payload: VerifyActionRequest,
    service: AdminService = Depends(get_admin_service),
) -> ClaimResponse:
    return service.verify_claim(claim_id, payload.action)
