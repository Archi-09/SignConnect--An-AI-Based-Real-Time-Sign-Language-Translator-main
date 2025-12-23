from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 1. Define Database File
SQL_ALCHEMY_DATABASE_URL = "sqlite:///./signconnect.db"

# 2. Create Engine
engine = create_engine(
    SQL_ALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# 3. Create Session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 4. Define BASE (This was missing!)
Base = declarative_base()

# 5. Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()