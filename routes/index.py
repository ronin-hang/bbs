import os
import uuid

from flask import (
    render_template,
    request,
    redirect,
    session,
    url_for,
    Blueprint,
    make_response,
    abort,
    send_from_directory,
    flash
)
from werkzeug.datastructures import FileStorage
from werkzeug.utils import secure_filename

from models.reply import Reply
from models.topic import Topic
from models.user import User
from routes import current_user

import json
import redis

cache = redis.StrictRedis()
main = Blueprint('index', __name__)


@main.route("/")
def index():
    u = current_user()
    return render_template("index.html", user=u)


@main.route("/register", methods=['POST'])
def register():
    form = request.form.to_dict()
    u, result = User.register(form)
    flash(result, 'err')
    return redirect(url_for('.index'))


@main.route("/login", methods=['POST'])
def login():
    form = request.form
    u = User.validate_login(form)

    if u is None:
        flash('用户名或密码错误', 'err')
        return redirect(url_for('.index'))
    else:
        session['user_id'] = u.id
        session.permanent = True
        return redirect(url_for('topic.index'))


def created_topic(user_id):
    k = 'created_topic_{}'.format(user_id)
    if cache.exists(k):
        v = cache.get(k)
        ts = json.loads(v)
        return ts
    else:
        ts = Topic.all_time(user_id=user_id)
        v = json.dumps([t.json() for t in ts])

        cache.set(k, v)
        cache.expire(k, 10)
        return ts


def replied_topic(user_id):
    k = 'replied_topic_{}'.format(user_id)
    if cache.exists(k):
        v = cache.get(k)
        ts = json.loads(v)
        return ts
    else:
        rs = Reply.all(user_id=user_id)
        ts = []
        for r in rs:
            t = Topic.one(id=r.topic_id)
            if t not in ts:
                ts.append(t)
        new_ts = sorted(ts, key=lambda k: k.created_time, reverse=True)
        v = json.dumps([t.json() for t in new_ts])
        cache.set(k, v)
        cache.expire(k, 10)
        return new_ts


@main.route('/profile')
def profile():
    print('running profile route')
    u = current_user()
    if u is None:
        return redirect(url_for('.index'))
    else:
        created = created_topic(u.id)
        replied = replied_topic(u.id)
        return render_template(
            'topic/dynamic.html',
            user=u,
            created=created,
            replied=replied,
        )


@main.route('/user/<int:id>')
def user_detail(id):
    u = User.one(id=id)
    if u is None:
        abort(404)
    else:
        return render_template('profile.html', user=u)


@main.route('/image/add', methods=['POST'])
def avatar_add():
    file: FileStorage = request.files['avatar']
    suffix = file.filename.split('.')[-1]
    filename = '{}.{}'.format(str(uuid.uuid4()), suffix)
    path = os.path.join('images', filename)
    file.save(path)

    u = current_user()
    User.update(u.id, image='/images/{}'.format(filename))

    return redirect(url_for('setting.index'))


@main.route('/images/<filename>')
def image(filename):
    return send_from_directory('images', filename)


@main.route("/weixin")
def weixin():
    return render_template('wzxn.html')


@main.route("/quit")
def quited():
    session.clear()
    return redirect(url_for('.index'))
