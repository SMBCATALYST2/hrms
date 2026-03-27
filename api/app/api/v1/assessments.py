"""Assessment routes: CRUD, questions, submissions, results."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import PaginationParams, RequireRole, get_current_user
from app.models.assessment import Assessment, AssessmentSubmission, Question, QuestionBank
from app.models.user import User
from app.schemas.assessment import (
    AssessmentCreate,
    AssessmentResponse,
    AssessmentSubmissionCreate,
    AssessmentSubmissionResponse,
    AssessmentSubmitAnswers,
    AssessmentUpdate,
    QuestionBankCreate,
    QuestionBankResponse,
    QuestionInput,
    QuestionResponse,
)
from app.schemas.common import PaginatedResponse, SuccessResponse
from app.services.assessment_service import start_submission, submit_answers
from app.utils.pagination import paginate

router = APIRouter()


# --- Question Banks ---

@router.get("/question-banks", response_model=PaginatedResponse[QuestionBankResponse])
async def list_question_banks(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    params: Annotated[PaginationParams, Depends()],
    company_id: UUID | None = Query(default=None),
):
    """List question banks."""
    query = select(QuestionBank)
    if company_id:
        query = query.where(QuestionBank.company_id == company_id)
    return await paginate(db, query, params, QuestionBankResponse)


@router.post("/question-banks", response_model=QuestionBankResponse, status_code=status.HTTP_201_CREATED)
async def create_question_bank(
    data: QuestionBankCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireRole("super_admin", "hr_admin"))],
):
    """Create a question bank with questions."""
    questions_data = data.questions
    qb = QuestionBank(
        company_id=data.company_id,
        name=data.name,
        category=data.category,
    )
    db.add(qb)
    await db.flush()

    for q_data in questions_data:
        q = Question(question_bank_id=qb.id, **q_data.model_dump())
        db.add(q)

    await db.flush()
    await db.refresh(qb)
    return QuestionBankResponse.model_validate(qb)


@router.post("/question-banks/{bank_id}/questions", response_model=QuestionResponse, status_code=status.HTTP_201_CREATED)
async def add_question(
    bank_id: UUID,
    data: QuestionInput,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireRole("super_admin", "hr_admin"))],
):
    """Add a question to a question bank."""
    result = await db.execute(select(QuestionBank).where(QuestionBank.id == bank_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question bank not found")
    q = Question(question_bank_id=bank_id, **data.model_dump())
    db.add(q)
    await db.flush()
    await db.refresh(q)
    return QuestionResponse.model_validate(q)


# --- Assessments ---

@router.get("", response_model=PaginatedResponse[AssessmentResponse])
async def list_assessments(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    params: Annotated[PaginationParams, Depends()],
    company_id: UUID | None = Query(default=None),
):
    """List assessments."""
    query = select(Assessment)
    if company_id:
        query = query.where(Assessment.company_id == company_id)
    return await paginate(db, query, params, AssessmentResponse)


@router.post("", response_model=AssessmentResponse, status_code=status.HTTP_201_CREATED)
async def create_assessment(
    data: AssessmentCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireRole("super_admin", "hr_admin"))],
):
    """Create an assessment."""
    assessment = Assessment(**data.model_dump())
    db.add(assessment)
    await db.flush()
    await db.refresh(assessment)
    return AssessmentResponse.model_validate(assessment)


@router.patch("/{assessment_id}", response_model=AssessmentResponse)
async def update_assessment(
    assessment_id: UUID,
    data: AssessmentUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireRole("super_admin", "hr_admin"))],
):
    """Update an assessment."""
    result = await db.execute(select(Assessment).where(Assessment.id == assessment_id))
    assessment = result.scalar_one_or_none()
    if not assessment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(assessment, field, value)
    await db.flush()
    await db.refresh(assessment)
    return AssessmentResponse.model_validate(assessment)


# --- Submissions ---

@router.post("/submissions", response_model=AssessmentSubmissionResponse, status_code=status.HTTP_201_CREATED)
async def start_assessment(
    data: AssessmentSubmissionCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Start an assessment submission."""
    if not current_user.employee_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No linked employee")
    submission = await start_submission(db, data.assessment_id, current_user.employee_id)
    return AssessmentSubmissionResponse.model_validate(submission)


@router.post("/submissions/{submission_id}/submit", response_model=AssessmentSubmissionResponse)
async def submit_assessment_answers(
    submission_id: UUID,
    data: AssessmentSubmitAnswers,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Submit answers for an assessment."""
    answers = [a.model_dump() for a in data.answers]
    submission = await submit_answers(db, submission_id, answers)
    return AssessmentSubmissionResponse.model_validate(submission)


@router.get("/submissions/{submission_id}", response_model=AssessmentSubmissionResponse)
async def get_submission(
    submission_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Get assessment submission results."""
    result = await db.execute(
        select(AssessmentSubmission).where(AssessmentSubmission.id == submission_id)
    )
    submission = result.scalar_one_or_none()
    if not submission:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found")
    return AssessmentSubmissionResponse.model_validate(submission)
