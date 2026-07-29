from flask import Blueprint, render_template, redirect, session, url_for

# Home page blueprint.
# Defines the landing page for visitors and redirects logged-in users to the dashboard.
home_bp = Blueprint('home', __name__)


@home_bp.route('/')
def home():
    # Always send the user to the login page as the first page.
    return redirect(url_for('auth.login'))
