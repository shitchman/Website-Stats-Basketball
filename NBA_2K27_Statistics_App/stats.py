from flask import Blueprint, render_template, request, redirect, url_for, flash

from auth import login_required
from database import get_db, execute_write

# Stats blueprint.
# Contains routes for entering and viewing saved player statistics.
stats_bp = Blueprint('stats', __name__)


@stats_bp.route('/add-game', methods=['GET', 'POST'])
@login_required
def entry():
    error = None
    if request.method == 'POST':
        player_name = request.form.get('player_name', '').strip()
        game_date = request.form.get('game_date', '').strip()
        position = request.form.get('position', '').strip()
        points = request.form.get('points', '').strip()
        rebounds = request.form.get('rebounds', '').strip()
        assists = request.form.get('assists', '').strip()
        steals = request.form.get('steals', '').strip()
        blocks = request.form.get('blocks', '').strip()
        turnovers = request.form.get('turnovers', '').strip()
        fouls = request.form.get('fouls', '').strip()

        if not player_name:
            error = 'Player name is required.'
        elif not game_date:
            error = 'Game date is required.'
        elif not position:
            error = 'Position is required.'
        else:
            try:
                stats = {
                    'points': int(points or 0),
                    'rebounds': int(rebounds or 0),
                    'assists': int(assists or 0),
                    'steals': int(steals or 0),
                    'blocks': int(blocks or 0),
                    'turnovers': int(turnovers or 0),
                    'fouls': int(fouls or 0),
                }
            except ValueError:
                error = 'All statistic fields must be whole numbers.'

        if error is None:
            db = get_db()
            db.execute(
                '''
                INSERT INTO player_stats
                (player_name, game_date, position, points, rebounds, assists, steals, blocks, turnovers, fouls)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''',
                (
                    player_name,
                    game_date,
                    position,
                    stats['points'],
                    stats['rebounds'],
                    stats['assists'],
                    stats['steals'],
                    stats['blocks'],
                    stats['turnovers'],
                    stats['fouls'],
                ),
            )
            db.commit()
            flash('Player statistics saved successfully.', 'success')
            return redirect(url_for('stats.list_stats'))

        flash(error, 'error')

    return render_template('entry.html', active_page='add_game')


@stats_bp.route('/stats')
@login_required
def list_stats():
    db = get_db()
    entries = db.execute(
        'SELECT id, player_name, game_date, position, points, rebounds, assists, steals, blocks, turnovers, fouls '
        'FROM player_stats ORDER BY game_date DESC, id DESC'
    ).fetchall()
    return render_template('list.html', entries=entries, active_page='add_game')
