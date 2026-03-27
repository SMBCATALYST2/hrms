.PHONY: dev dev-api dev-web dev-mobile setup migrate seed test build clean logs

# ─── Development ─────────────────────────────────────────────────
dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d db redis mailhog
	@echo "DB + Redis + MailHog started. Run 'make dev-api' and 'make dev-web' in separate terminals."

dev-api:
	cd api && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

dev-web:
	cd web && npm run dev

dev-mobile:
	cd mobile && npx expo start

# ─── Setup ───────────────────────────────────────────────────────
setup:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d db redis
	cd packages/shared && npm install
	cd api && pip install -e ".[dev]"
	cd web && npm install
	cd mobile && npm install
	@echo "Setup complete. Run 'make migrate' then 'make seed'."

install-shared:
	cd packages/shared && npm install && npm run build

# ─── Database ────────────────────────────────────────────────────
migrate:
	cd api && alembic upgrade head

migrate-create:
	cd api && alembic revision --autogenerate -m "$(msg)"

migrate-down:
	cd api && alembic downgrade -1

seed:
	cd api && python -m app.scripts.seed

# ─── Testing ─────────────────────────────────────────────────────
test:
	cd api && pytest
	cd web && npm test
	cd mobile && npm test

test-api:
	cd api && pytest -v

test-web:
	cd web && npm test

test-mobile:
	cd mobile && npm test

# ─── Build & Deploy ──────────────────────────────────────────────
build:
	docker compose build

build-web:
	cd web && npm run build

build-mobile-ios:
	cd mobile && npx eas build --platform ios

build-mobile-android:
	cd mobile && npx eas build --platform android

# ─── Utilities ───────────────────────────────────────────────────
logs:
	docker compose logs -f

logs-api:
	docker compose logs -f api

clean:
	docker compose down -v
	@echo "Containers stopped and volumes removed."

format:
	cd api && ruff format . && ruff check --fix .
	cd web && npx prettier --write src/
	cd mobile && npx prettier --write app/ components/ services/ hooks/ store/ utils/

lint:
	cd api && ruff check .
	cd web && npx eslint src/
	cd mobile && npx eslint app/ components/
