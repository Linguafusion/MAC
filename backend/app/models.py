from sqlalchemy import Column, Integer, String
from .database import Base

class Enquete(Base):
    _tablename_ = "enquetes"

    id = Column(Integer, primary_key=True, index=True)
    titre = Column(String, index=True)
    description = Column(String)