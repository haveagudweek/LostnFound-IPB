from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app.cores.database import get_db
from app.cores.config import settings
from app.models.user import User
from app.schemas.user import TokenData

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email_ipb: str = payload.get("sub")
        if email_ipb is None:
            raise credentials_exception
        token_data = TokenData(email_ipb=email_ipb)
    except JWTError:
        raise credentials_exception
        
    user = db.query(User).filter(User.email_ipb == token_data.email_ipb).first()
    if user is None:
        raise credentials_exception
    return user

def get_current_active_admin(current_user: User = Depends(get_current_user)):
    if current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user
