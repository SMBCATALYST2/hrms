"""Seed script to populate initial data for HRMS demo using raw SQL."""

import asyncio
import uuid

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

from app.core.config import settings
from app.core.security import hash_password
from app.models.base import Base
# Import all models so metadata knows about all tables
import app.models  # noqa: F401


async def main() -> None:
    engine = create_async_engine(settings.DATABASE_URL, echo=False)

    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    print("Tables created successfully.")

    # Seed using raw SQL to avoid ORM relationship issues
    async with engine.begin() as conn:
        # Check if already seeded
        result = await conn.execute(text("SELECT id FROM role LIMIT 1"))
        if result.first():
            print("Database already seeded. Skipping.")
            await engine.dispose()
            return

        # --- Roles ---
        roles = {}
        roles_data = [
            ("Super Admin", "super_admin", "Full system access"),
            ("HR Admin", "hr_admin", "HR operations and employee management"),
            ("Manager", "manager", "Team management and approvals"),
            ("Employee", "employee", "Self-service access"),
            ("Recruiter", "recruiter", "Recruitment and hiring"),
            ("Finance Admin", "finance_admin", "Payroll and finance"),
        ]
        for name, code, desc in roles_data:
            role_id = uuid.uuid4()
            roles[code] = role_id
            await conn.execute(text(
                "INSERT INTO role (id, name, code, description, is_system) "
                "VALUES (:id, :name, :code, :desc, true)"
            ), {"id": role_id, "name": name, "code": code, "desc": desc})

        # --- Company ---
        company_id = uuid.uuid4()
        await conn.execute(text(
            "INSERT INTO company (id, name, legal_name, country) "
            "VALUES (:id, :name, :legal_name, :country)"
        ), {"id": company_id, "name": "SMB Catalyst Demo",
            "legal_name": "SMB Catalyst Pvt. Ltd.", "country": "India"})

        # --- Departments ---
        for dept_name in ["Human Resources", "Engineering", "Sales", "Marketing",
                          "Finance", "Operations", "Product", "Design"]:
            await conn.execute(text(
                "INSERT INTO department (id, name, company_id) "
                "VALUES (:id, :name, :cid)"
            ), {"id": uuid.uuid4(), "name": dept_name, "cid": company_id})

        # --- Designations ---
        for title in ["CEO", "CTO", "VP Engineering", "HR Manager",
                      "Software Engineer", "Senior Software Engineer",
                      "Product Manager", "Designer", "Sales Executive",
                      "Finance Manager", "Intern"]:
            await conn.execute(text(
                "INSERT INTO designation (id, name) VALUES (:id, :name)"
            ), {"id": uuid.uuid4(), "name": title})

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
            user_id = uuid.uuid4()
            pw_hash = hash_password(password)
            await conn.execute(text(
                "INSERT INTO \"user\" (id, email, password_hash, is_active, is_email_verified) "
                "VALUES (:id, :email, :pw, true, true)"
            ), {"id": user_id, "email": email, "pw": pw_hash})

            await conn.execute(text(
                "INSERT INTO user_role (id, user_id, role_id, scope_type) "
                "VALUES (:id, :uid, :rid, 'global')"
            ), {"id": uuid.uuid4(), "uid": user_id, "rid": roles[role_code]})

    print()
    print("Seed completed successfully!")
    print()
    print("Demo Accounts:")
    print("=" * 50)
    for email, password, role_code in users_info:
        print(f"  {role_code:<15} | {email:<25} | {password}")
    print("=" * 50)

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
