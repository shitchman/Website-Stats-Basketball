from flask import Blueprint, render_template, request, redirect, url_for, flash, session

from auth import login_required
from database import get_db

# Profile blueprint.
# Allows logged-in users to edit their in-game username and create builds.
profile_bp = Blueprint('profile', __name__)


def get_or_create_profile(user_id):
    db = get_db()
    profile = db.execute(
        'SELECT id, in_game_username FROM user_profiles WHERE user_id = ?',
        (user_id,),
    ).fetchone()
    if profile is None:
        db.execute('INSERT INTO user_profiles (user_id, in_game_username) VALUES (?, ?)', (user_id, None))
        db.commit()
        profile = db.execute(
            'SELECT id, in_game_username FROM user_profiles WHERE user_id = ?',
            (user_id,),
        ).fetchone()
    return profile


@profile_bp.route('/profile', methods=['GET', 'POST'])
@login_required
def profile():
    print('DEBUG profile() called; session keys=', list(session.keys()))
    db = get_db()
    print('DEBUG got db connection, type=', type(db))
    user_id = session.get('user_id')
    profile = get_or_create_profile(user_id)
    builds = db.execute(
        'SELECT id, build_name, height, position FROM user_builds WHERE profile_id = ? ORDER BY id DESC',
        (profile['id'],),
    ).fetchall()

    if request.method == 'POST':
        if request.form.get('form_type') == 'profile':
            in_game_username = request.form.get('in_game_username', '').strip()
            db.execute('UPDATE user_profiles SET in_game_username = ? WHERE id = ?',
                          (in_game_username, profile['id']))
            db.commit()
            flash('Profile updated successfully.', 'success')
            return redirect(url_for('profile.profile'))

        if request.form.get('form_type') == 'build':
            build_name = request.form.get('build_name', '').strip()
            height = request.form.get('height', '').strip()
            position = request.form.get('position', '').strip()
            if not build_name or not height or not position:
                flash('Build name, height, and position are required.', 'error')
            else:
                db.execute('INSERT INTO user_builds (profile_id, build_name, height, position) VALUES (?, ?, ?, ?)',
                              (profile['id'], build_name, height, position))
                db.commit()
                flash('Build added successfully.', 'success')
                return redirect(url_for('profile.profile'))

    return render_template('profile.html', profile=profile, builds=builds, active_page='profile')
