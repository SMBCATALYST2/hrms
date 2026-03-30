"""Allow running seed via: python -m app.scripts.seed"""
from app.scripts.seed import main
import asyncio

asyncio.run(main())
