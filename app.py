#!/usr/bin/env python3

import time
from flask import Flask

import secret
import config
from models.base_model import db
from models.reply import Reply

from routes.index import main as index_routes
from routes.topic import main as topic_routes
from routes.reply import main as reply_routes
from routes.board import main as board_routes
from routes.message import main as mail_routes
from routes.setting import main as setting_routes


def format_time(unix_timestamp):
    f = '%Y-%m-%d %H:%M:%S'
    value = time.localtime(unix_timestamp)
    formatted = time.strftime(f, value)
    return formatted


def count(input):
    return len(input)


def configured_app():
    app = Flask(__name__)
    app.secret_key = secret.secret_key

    uri = 'mysql+pymysql://root:{}@localhost/web21?charset=utf8mb4'.format(
        secret.database_password
    )
    app.config['SQLALCHEMY_DATABASE_URI'] = uri
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)

    register_routes(app)
    return app


def register_routes(app):

    app.register_blueprint(index_routes)
    app.register_blueprint(topic_routes, url_prefix='/topic')
    app.register_blueprint(reply_routes, url_prefix='/reply')
    app.register_blueprint(board_routes, url_prefix='/board')
    app.register_blueprint(mail_routes, url_prefix='/mail')
    app.register_blueprint(setting_routes, url_prefix='/setting')

    app.template_filter()(format_time)
    app.template_filter()(count)


if __name__ == '__main__':
    app = configured_app()
    app.config['TEMPLATES_AUTO_RELOAD'] = True
    app.jinja_env.auto_reload = True
    app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
    config = dict(
        debug=True,
        host='0.0.0.0',
        port=2000,
        threaded=True,
    )
    app.run(**config)
