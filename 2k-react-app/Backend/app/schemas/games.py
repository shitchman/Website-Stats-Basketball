from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, model_validator


# Every stat column shared by the player and team statlines
class StatlineBase(BaseModel):
    points: int
    rebounds: int
    assists: int
    steals: int
    blocks: int
    fouls: int
    turnovers: int
    field_goals_made: int
    field_goals_attempted: int
    three_pointers_made: int
    three_pointers_attempted: int
    free_throws_made: int
    free_throws_attempted: int


class PlayerStatlineInput(StatlineBase):
    position: str | None = None
    is_self: bool
    friend_id: int | None = None
    build_id: int | None = None
    friend_build_id: int | None = None
    opponent: str

    # Mirrors the DB check constraint: self statlines use build_id only, friend statlines use friend_id + friend_build_id only
    @model_validator(mode="after")
    def check_player_type(self):
        if self.is_self:
            if not self.build_id or self.friend_id or self.friend_build_id:
                raise ValueError("Self statlines require build_id and must not include friend fields")
        else:
            if not self.friend_id or not self.friend_build_id or self.build_id:
                raise ValueError("Friend statlines require friend_id and friend_build_id and must not include build_id")
        return self

    @model_validator(mode="after")
    def check_opponent(self):
        if self.opponent not in ("Player", "AI"):
            raise ValueError("opponent must be 'Player' or 'AI'")
        return self


# The box score totals row, saved once per game
class TeamStatlineInput(StatlineBase):
    pass


class ConfirmGameRequest(BaseModel):
    build_id: int
    date_time: date
    result: str

    points_for: int
    q1_points_for: int
    q2_points_for: int
    q3_points_for: int
    q4_points_for: int

    points_against: int
    q1_points_against: int
    q2_points_against: int
    q3_points_against: int
    q4_points_against: int

    box_score_total_points: int
    team_statline: TeamStatlineInput
    statlines: list[PlayerStatlineInput]

    @model_validator(mode="after")
    def check_totals(self):
        if self.result not in ("W", "L"):
            raise ValueError("result must be 'W' or 'L'")

        expected_result = "W" if self.points_for > self.points_against else "L" if self.points_for < self.points_against else None
        if expected_result is None:
            raise ValueError("points_for and points_against cannot be tied")
        if self.result != expected_result:
            raise ValueError("result must match the higher final score")

        if self.q1_points_for + self.q2_points_for + self.q3_points_for + self.q4_points_for != self.points_for:
            raise ValueError("Quarter points for must sum to points_for")

        if self.q1_points_against + self.q2_points_against + self.q3_points_against + self.q4_points_against != self.points_against:
            raise ValueError("Quarter points against must sum to points_against")

        if self.points_for != self.box_score_total_points:
            raise ValueError("points_for must equal the box score's total points")

        if self.team_statline.points != self.box_score_total_points:
            raise ValueError("team_statline points must equal the box score's total points")

        return self


class TeamStatlineOut(StatlineBase):
    model_config = ConfigDict(from_attributes=True)

    id: int


class PlayerStatlineOut(StatlineBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    position: str | None = None
    build_id: int | None = None
    friend_id: int | None = None
    friend_build_id: int | None = None
    opponent: str | None = None


class GameOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    game_mode_id: int
    build_id: int | None = None
    build_name: str | None = None
    date_time: datetime
    result: str

    points_for: int
    q1_points_for: int
    q2_points_for: int
    q3_points_for: int
    q4_points_for: int

    points_against: int
    q1_points_against: int
    q2_points_against: int
    q3_points_against: int
    q4_points_against: int

    team_statline: TeamStatlineOut | None = None
    user_statline: PlayerStatlineOut | None = None


class GameDetailOut(GameOut):
    statlines: list[PlayerStatlineOut] = []

