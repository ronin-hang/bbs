import json
import uuid
from functools import wraps

from flask import session, request, abort

from models.user import User
import redis


rs = redis.StrictRedis()


def current_user():
    uid = session.get('user_id', '')
    u = User.one(id=uid)
    return u


def csrf_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        token = request.args['token']
        u = current_user()
        result = rs.get(token)
        ts = json.loads(result)
        if ts == u.id:
            rs.delete(token)
            return f(*args, **kwargs)
        else:
            abort(401)

    return wrapper


def new_csrf_token():
    u = current_user()
    token = str(uuid.uuid4())
    v = json.dumps(u.id)
    rs.set(token, v)
    return token
