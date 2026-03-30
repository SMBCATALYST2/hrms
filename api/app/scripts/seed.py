"""Seed script to populate initial data for HRMS demo."""

import asyncio
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings
from app.core.security import hash_password
from app.models.base import Base
from app.models.user import Role, User, UserRole
from app.models.company import Company
from app.models.department import Department
from app.models.designation import Designation


async def seed(session: AsyncSession) -> None:
    """Insert demo data."""

    # Check if already seeded
    result = await session.execute(select(Role).limit(1))
    if result.scalars().first():
        print("Database already seeded. Skipping.")
        return

    # --- Roles ---
    roles_data = [
        ("Super Admin", "super_admin", "Full system access", True),
        ("HR Admin", "hr_admin", "HR operations and employee management", True),
        ("Manager", "manager", "Team management and approvals", True),
        ("Employee", "employee", "Self-service access", True),
        ("Recruiter", "recruiter", "Recruitment and hiring", True),
        ("Finance Admin", "finance_admin", "Payroll and finance", True),
    ]
    roles = {}
    for name, code, desc, is_system in roles_data:
        role = Role(id=uuid.uuid4(), name=name, code=code, description=desc, is_system=is_system)
        session.add(role)
        roles[code] = role

    await session.flush()

    # --- Company ---
    company = Company(
        id=uuid.uuid4(),
        name="SMB Catalyst Demo",
        legal_name="SMB Catalyst Pvt. Ltd.",
        country="India",
    )
    session.add(company)
    await session.flush()

    # --- Departments ---
    departments_data = [
        "Human Resources", "Engineering", "Sales", "Marketing",
        "Finance", "Operations", "Product", "Design",
    ]
    depts = {}
    for dept_name in departments_data:
        dept = Department(
            id=uuid.uuid4(),
            name=dept_name,
            company_id=company.id,
        )
        session.add(dept)
        depts[dept_name] = dept

    await session.flush()

    # --- Designations ---
    designations_data = [
        "CEO", "CTO", "VP Engineering", "HR Manager", "Software Engineer",
        "Senior Software Engineer", "Product Manager", "Designer",
        "Sales Executive", "Finance Manager", "Intern",
    ]
    desigs = {}
    for title in designations_data:
        desig = Designation(
            id=uuid.uuid4(),
            name=title,
        )
        session.add(desig)
        desigs[title] = desig

    await session.flush()

    # --- Users ---
    users_info = [
        ("admin@hrms.demo", "Admin@123", "super_admin"),
        ("hr@hrms.demo", "Admin@123", "hr_admin"),
        ("manager@hrms.demo", "Admin@123", "manager"),
        ("employee@hrms.demo", "Admin@123", "employee"),
        ("recruiter@hrms.demo", "Admin@123", "recruiter"),
        ("finance@hrms.demo", "Admin@123", "finance_admin"),
    ]
    for email, password, role_code in users_info:
        user = User(
            id=uuid.uuid4(),
            email=email,
            password_hash=hash_password(password),
            is_active=True,
            is_email_verified=True,
        )
        session.add(user)
        await session.flush()

        user_role = UserRole(
            id=uuid.uuid4(),
            user_id=user.id,
            role_id=roles[role_code].id,
            scope_type="global",
        )
        session.add(user_role)

    await session.flush()
    await session.commit()

    print("Seed completed successfully!")
    print()
    print("Demo Accounts:")
    print("=" * 50)
    for email, password, role_code in users_info:
        print(f"  {role_code:<15} | {email:<25} | {password}")
    print("=" * 50)


async def main() -> None:
    engine = create_async_engine(settings.DATABASE_URL, echo=False)

    # Create all tables directly (fallback if no migrations)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        await seed(session)

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
