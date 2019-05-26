from flask import (
    render_template,
    redirect,
    url_for,
    Blueprint,
    flash
)

from routes import *
from models.user import User


main = Blueprint('setting', __name__)


@main.route("/")
def index():
    board_id = int(request.args.get('board_id', -1))
    token = new_csrf_token()
    u = current_user()
    return render_template("topic/setting.html", token=token, user=u, bid=board_id)


@main.route("/update", methods=["POST"])
@csrf_required
def update():
    form = request.form.to_dict()
    u = current_user()
    username = form['username']
    if username == u.username:
        User.update(id=u.id, **form)
        return redirect(url_for('.index'))
    else:
        if len(username) > 2 and User.one(username=username) is None:
            User.update(id=u.id, **form)
            return redirect(url_for('.index'))
        else:
            flash('用户名已存在或长度小于2', 'err')
            return redirect(url_for('.index'))


@main.route("/update_pass", methods=["POST"])
@csrf_required
def update_pass():
    form = request.form.to_dict()
    u = current_user()
    User.update(id=u.id, **form)
    old_pass = form.pop('old_pass')
    new_pass = form.pop('new_pass')
    old_pass = User.salted_password(old_pass)
    if len(new_pass) > 2 and u.password == old_pass:
        new_pass = User.salted_password(new_pass)
        form['password'] = new_pass
        User.update(id=u.id, **form)
        flash('修改完成', 'err_pass')
        return redirect(url_for('.index'))
    else:
        # print('231')
        # abort(401)
        flash('密码错误或为空', 'err_pass')
        return redirect(url_for('.index'))
