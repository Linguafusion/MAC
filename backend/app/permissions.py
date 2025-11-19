from fastapi import Depends, HTTPException, status
from .models import Role, User
from .security import get_current_user

def require_role(roles):
    if not isinstance(roles, list):
        roles = [roles]

    def checker(user: User = Depends(get_current_user)):
        if user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Accès refusé : rôle insuffisant."
            )
        return user
    return checker
