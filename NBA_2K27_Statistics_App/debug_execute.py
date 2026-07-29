from app import create_app
from database import get_db
import traceback

app = create_app()
with app.app_context():
    try:
        db = get_db()
        db.execute('UPDATE user_profiles SET in_game_username = ? WHERE id = ?', ('x', 1))
        db.commit()
        print('profile update succeeded')
    except Exception:
        traceback.print_exc()
