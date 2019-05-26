import hashlib

from sqlalchemy import Column, String, Text, Unicode
import config
from models.base_model import SQLMixin, db


class User(SQLMixin, db.Model):

    __tablename__ = 'User'

    username = Column(String(50), nullable=False)
    password = Column(String(100), nullable=False)
    image = Column(String(100), nullable=False, default='/images/3.jpg')
    email = Column(String(50), nullable=False, default=config.  test_mail)
    label = Column(Unicode(50), nullable=False, default='这家伙很懒，什么个性签名都没有留下。')

    @staticmethod
    def salted_password(password, salt='$!@><?>HUI&DWQa`'):
        salted = hashlib.sha256((password + salt).encode('ascii')).hexdigest()
        return salted

    @classmethod
    def register(cls, form):
        name = form.get('username', '')
        password = form.get('password', '')
        if len(name) > 2 and len(password) > 2 and User.one(username=name) is None:

            form['password'] = User.salted_password(form['password'])
            u = User.new(form)
            result = '注册成功'
            return u, result
        else:
            result = '用户名和密码长度须大于2或者用户名已存在'
            return None, result

    @classmethod
    def validate_login(cls, form):
        query = dict(
            username=form['username'],
            password=User.salted_password(form['password']),
        )
        print('validate_login', form, query)
        return User.one(**query)
