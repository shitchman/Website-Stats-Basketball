from flask import Flask

from auth import auth_bp
from database import init_db
from dashboard import dashboard_bp
from home import home_bp
from profile import profile_bp
from stats import stats_bp

# Application factory and top-level WSGI app.
# `create_app()` builds the Flask application, registers blueprints, and initializes the database.

def create_app():
    app = Flask(__name__)
    app.config.from_mapping(
        DATABASE='player_stats.db',
        SECRET_KEY='dev_secret_key',
    )

    init_db(app)
    app.register_blueprint(home_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(stats_bp)
    app.register_blueprint(profile_bp)

    return app


# Top-level Flask application object used by many deployment tools.
app = create_app()


if __name__ == '__main__':
    # Disable the Werkzeug reloader to avoid SystemExit(3) when running
    # under the VS Code debugpy launcher.
    app.run(debug=True, use_reloader=False)