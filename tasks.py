from celery import Celery
from marrow.mailer import Mailer

import secret
from config import admin_mail

celery = Celery('tasks', backend='redis://localhost', broker='redis://localhost')


def configured_mailer():
    config = {
        'transport.debug': True,
        'transport.timeout': 1,
        'transport.use': 'smtp',
        'transport.host': 'smtp.exmail.qq.com',
        'transport.port': 465,
        'transport.tls': 'ssl',
        'transport.username': admin_mail,
        'transport.password': secret.mail_password,
    }
    m = Mailer(config)
    m.start()
    return m


mailer = configured_mailer()


@celery.task
def send_async(subject, author, to, plain):
    m = mailer.new(
        subject=subject,
        author=author,
        to=to,
    )
    m.plain = plain
    mailer.send(m)

