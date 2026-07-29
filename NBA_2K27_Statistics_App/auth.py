from functools import wraps

from flask import Blueprint, render_template, request, redirect, url_for, flash, session
from werkzeug.security import check_password_hash, generate_password_hash

from database import get_db, execute_write

# Authentication blueprint.
# Contains login, registration, and logout logic for the app.
auth_bp = Blueprint('auth', __name__)


def login_required(view):
    @wraps(view)
    def wrapped_view(*args, **kwargs):
        if 'username' not in session:
            flash('Please log in to access this page.', 'error')
            return redirect(url_for('auth.login'))
        return view(*args, **kwargs)
    return wrapped_view


@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '').strip()
        error = None

        if not username or not password:
            error = 'Username and password are required.'
        else:
            db = get_db()
            user = db.execute(
                'SELECT id, username, password_hash FROM users WHERE username = ?',
                (username,),
            ).fetchone()

            if user is None or not check_password_hash(user['password_hash'], password):
                error = 'Invalid username or password.'

        if error is None:
            session.clear()
            session['user_id'] = user['id']
            session['username'] = username
            flash('Logged in successfully.', 'success')
            return redirect(url_for('dashboard.home'))

        flash(error, 'error')

    return render_template('login.html')


@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '').strip()
        confirm_password = request.form.get('confirm_password', '').strip()
        error = None

        if not username:
            error = 'Username is required.'
        elif not password:
            error = 'Password is required.'
        elif password != confirm_password:
            error = 'Passwords do not match.'
        else:
            db = get_db()
            existing = db.execute(
                'SELECT id FROM users WHERE username = ?',
                (username,),
            ).fetchone()
            if existing:
                error = 'That username is already taken.'

        if error is None:
            db = get_db()
            db.execute(
                'INSERT INTO users (username, password_hash) VALUES (?, ?)',
                (username, generate_password_hash(password)),
            )
            db.commit()
            flash('User created successfully. Please log in.', 'success')
            return redirect(url_for('auth.login'))

        flash(error, 'error')

    return render_template('register.html')


@auth_bp.route('/logout')
def logout():
    session.clear()
    flash('Logged out successfully.', 'success')
    return redirect(url_for('home.home'))
