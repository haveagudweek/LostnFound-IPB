import hashlib
import hmac
import os


class PasswordService:
    iterations = 120_000

    def hash_password(self, password: str) -> str:
        salt = os.urandom(16)
        password_hash = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, self.iterations)
        return f"{salt.hex()}${password_hash.hex()}"

    def verify_password(self, password: str, stored_hash: str) -> bool:
        try:
            salt_hex, hash_hex = stored_hash.split("$", 1)
        except ValueError:
            return False

        salt = bytes.fromhex(salt_hex)
        expected_hash = bytes.fromhex(hash_hex)
        actual_hash = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, self.iterations)
        return hmac.compare_digest(actual_hash, expected_hash)
