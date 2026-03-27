"""Assessment service: submission handling and scoring."""

from datetime import UTC, datetime
from decimal import Decimal
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.assessment import (
    Assessment,
    AssessmentAnswer,
    AssessmentSubmission,
    Question,
)


async def start_submission(
    db: AsyncSession, assessment_id: UUID, employee_id: UUID,
) -> AssessmentSubmission:
    """Start a new assessment submission attempt."""
    # Verify assessment exists and is active
    result = await db.execute(select(Assessment).where(Assessment.id == assessment_id))
    assessment = result.scalar_one_or_none()
    if not assessment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment not found")
    if not assessment.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Assessment is not active")

    # Check max attempts
    count_result = await db.execute(
        select(AssessmentSubmission).where(
            and_(
                AssessmentSubmission.assessment_id == assessment_id,
                AssessmentSubmission.employee_id == employee_id,
            )
        )
    )
    existing = count_result.scalars().all()
    if len(existing) >= assessment.max_attempts:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Maximum attempts ({assessment.max_attempts}) reached",
        )

    submission = AssessmentSubmission(
        assessment_id=assessment_id,
        employee_id=employee_id,
        attempt_number=len(existing) + 1,
        started_at=datetime.now(UTC),
    )
    db.add(submission)
    await db.flush()
    await db.refresh(submission)
    return submission


async def submit_answers(
    db: AsyncSession,
    submission_id: UUID,
    answers: list[dict],
) -> AssessmentSubmission:
    """Submit answers for an assessment and auto-score."""
    result = await db.execute(
        select(AssessmentSubmission).where(AssessmentSubmission.id == submission_id)
    )
    submission = result.scalar_one_or_none()
    if not submission:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found")
    if submission.status != "in_progress":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Submission already completed")

    # Fetch assessment for passing threshold
    assess_result = await db.execute(
        select(Assessment).where(Assessment.id == submission.assessment_id)
    )
    assessment = assess_result.scalar_one()

    total_score = Decimal("0")
    total_possible = Decimal("0")

    for ans_data in answers:
        question_id = ans_data["question_id"]
        answer_text = ans_data.get("answer")

        # Fetch the question for scoring
        q_result = await db.execute(select(Question).where(Question.id == question_id))
        question = q_result.scalar_one_or_none()
        if not question:
            continue

        is_correct = None
        points_awarded = Decimal("0")
        total_possible += question.points

        # Auto-score for MCQ and true_false
        if question.type in ("mcq", "true_false") and question.correct_answer:
            is_correct = (answer_text or "").strip().lower() == question.correct_answer.strip().lower()
            if is_correct:
                points_awarded = question.points
                total_score += points_awarded

        answer = AssessmentAnswer(
            submission_id=submission_id,
            question_id=question_id,
            answer=answer_text,
            is_correct=is_correct,
            points_awarded=points_awarded,
        )
        db.add(answer)

    submission.completed_at = datetime.now(UTC)
    submission.score = total_score
    submission.status = "completed"

    if total_possible > 0:
        submission.percentage = ((total_score / total_possible) * 100).quantize(Decimal("0.01"))
        submission.passed = submission.percentage >= assessment.passing_percentage
    else:
        submission.percentage = Decimal("0")
        submission.passed = False

    await db.flush()
    await db.refresh(submission)
    return submission
