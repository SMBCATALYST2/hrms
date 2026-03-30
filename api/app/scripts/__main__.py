"""Allow running seed via: python -m app.scripts.seed"""
import asyncio
from app.scripts.seed import main

asyncio.run(main())
