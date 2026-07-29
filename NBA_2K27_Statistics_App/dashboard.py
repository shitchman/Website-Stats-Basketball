from flask import Blueprint, render_template, request, redirect, url_for, flash, session

from auth import login_required
from database import get_db, execute_write

# Dashboard blueprint.
# Provides the authenticated left-hand navigation and the main dashboard pages.
dashboard_bp = Blueprint('dashboard', __name__)


@dashboard_bp.route('/dashboard')
@login_required
def home():
    db = get_db()
    total_games = db.execute('SELECT COUNT(*) AS count FROM player_stats').fetchone()['count']
    recent_games = db.execute(
        'SELECT player_name, game_date, position, points, rebounds, assists FROM player_stats '
        'ORDER BY game_date DESC, id DESC LIMIT 5'
    ).fetchall()
    return render_template('dashboard_home.html', total_games=total_games, recent_games=recent_games, active_page='home')


@dashboard_bp.route('/dashboard/friends', methods=['GET', 'POST'])
@login_required
def friends():
    db = get_db()
    error = None

    if request.method == 'POST':
        friend_name = request.form.get('friend_name', '').strip()
        friend_handle = request.form.get('friend_handle', '').strip()

        if not friend_name:
            error = 'Friend name is required.'
        else:
            db = get_db()
            db.execute(
                'INSERT INTO friends (user_id, friend_name, friend_handle) VALUES (?, ?, ?)',
                (get_user_id(), friend_name, friend_handle),
            )
            db.commit()
            flash('Friend added successfully.', 'success')
            return redirect(url_for('dashboard.friends'))

    friends_list = db.execute(
        'SELECT friend_name, friend_handle FROM friends WHERE user_id = ? ORDER BY id DESC',
        (get_user_id(),),
    ).fetchall()
    return render_template('friends.html', friends=friends_list, error=error, active_page='friends')


def get_user_id():
    return session.get('user_id')
