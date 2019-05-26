# Hang Loose BBS
-  测试账号 用户名:abc 密码:123
-  论坛网址：http://limoximoxi.club

## Web架构（MVC架构）
[![](https://img.shields.io/badge/Flask-1.0.2-green.svg)](https://github.com/ronin-hang/bbs)
[![](https://img.shields.io/badge/Jinja-2.10-green.svg)](https://github.com/ronin-hang/bbs)
[![](https://img.shields.io/badge/SQLAlchemy-1.3.2-green.svg)](https://github.com/ronin-hang/bbs)
[![](https://img.shields.io/badge/Celery-4.3.0-green.svg)](https://github.com/ronin-hang/bbs)
[![](https://img.shields.io/badge/Redis-5.0.4-green.svg)](https://github.com/ronin-hang/bbs)
[![](https://img.shields.io/badge/Supervisor-4.0.2-green.svg)](https://github.com/ronin-hang/bbs)
[![](https://img.shields.io/badge/Nginx-1.16.0-green.svg)](https://github.com/ronin-hang/bbs)

### 后端
- 采用Flask框架。
- 采用Redis作为缓存中间件，提高/topic/profile页面的访问性能。
- 采用Celery任务队列，处理发送邮件业务，提供顺畅的访问性能。

### 数据库
- 采用MySQL数据库，并使用SQLAlchemy数据库ORM工具。

### 前端
- 采用了Bootstrap作为前端的css和js框架。
- 编写话题采用了marked.js和prism.js,提供markdown的编辑环境。

## 主要功能
### 用户

- 登录注册（账户名有限制，注册失败有提示）

![VVN0k8.gif](https://s2.ax1x.com/2019/05/27/VVN0k8.gif)

- 个人信息页面（修改个人信息，头像,以及对应提示）

![VVUfKA.gif](https://s2.ax1x.com/2019/05/27/VVUfKA.gif)

### 帖子相关
- 发布话题 - 发表评论 - @其他人 - 增加板块 

![VVa0zQ.gif](https://s2.ax1x.com/2019/05/27/VVa0zQ.gif)

- 个人动态最近创建话题，回复(采用了celery存储话题信息，避免因大量查询数据库操作增加服务器负担)
- 删除帖子（只有本人可以）  

![VVabo6.gif](https://s2.ax1x.com/2019/05/27/VVabo6.gif)

### 发送邮件
- 站内信 - 发邮件（邮件能发送至默认的测试邮箱）

![VVdmOs.gif](https://s2.ax1x.com/2019/05/27/VVdmOs.gif)
