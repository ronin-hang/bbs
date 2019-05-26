from flask import (
    render_template,
    request,
    redirect,
    url_for,
    Blueprint,
    flash)

from routes import *

from models.topic import Topic
from models.board import Board
from models.reply import Reply

main = Blueprint('topic', __name__)


@main.route("/")
def index():
    board_id = int(request.args.get('board_id', -1))
    if board_id == -1:
        ms = Topic.all()
    else:
        ms = Topic.all(board_id=board_id)
    token = new_csrf_token()
    bs = Board.all()
    u = current_user()
    return render_template("topic/index.html", ms=ms, token=token, bs=bs, bid=board_id, user=u)


@main.route('/<int:id>')
def detail(id):
    m = Topic.get(id)
    return render_template("topic/detail.html", topic=m)


@main.route("/delete")
@csrf_required
def delete():
    id = int(request.args.get('id'))
    u = current_user()
    print('删除 topic 用户是', u, id)
    topic = Topic.one(id=id)
    uid = topic.user_id
    if u.id == uid:
        rs = topic.replies()
        for r in rs:
            Reply.delete(r.id)
        Topic.delete(id)
        return redirect(url_for('.index'))
    else:
        flash('没有权限', 'err')
        return redirect(url_for('.index'))


@main.route("/new")
def new():
    board_id = int(request.args.get('board_id'))
    bs = Board.all()
    # return render_template("topic/new.html", bs=bs, bid=board_id)
    token = new_csrf_token()
    return render_template("topic/new.html", bs=bs, token=token, bid=board_id)


@main.route("/add", methods=["POST"])
@csrf_required
def add():
    form = request.form.to_dict()
    u = current_user()
    Topic.new(form, user_id=u.id)
    return redirect(url_for('.index'))
