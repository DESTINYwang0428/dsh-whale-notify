# 上传到 GitHub 步骤（仓库名：鲸鱼娘插件）

> 本机 shell 连不上 github.com 网页（被网络环境阻断），但 API 可达。以下步骤在任何能打开 GitHub 的电脑/手机上操作即可。

## 方式一：网页上传（最简单，推荐）

1. 浏览器打开 **github.com** 并登录
2. 右上角 **+** → **New repository**
3. **Repository name** 填：`鲸鱼娘插件`（GitHub 支持中文仓库名，URL 会自动编码）
4. **Public**（公开）→ 勾选 **Add a README file**（可省，README 已备好）→ **Create repository**
5. 进入新仓库页面 → **Add file** → **Upload files**
6. 把本文件夹里的这些文件全部拖进去（或点 choose your files 选择）：
   - `whale-balance.mjs`
   - `dagou_loud.mp3`
   - `DSniang02.png`
   - `cordis.patch.yml`
   - `README.md`
   - `LICENSE`
   - `.gitignore`
7. 底部 **Commit changes** → 完成

## 方式二：git 命令行（标准方式，需要 git + 认证）

```bash
# 在有 GitHub 访问权限的环境
cd 鲸鱼娘插件
git init
git add .
git commit -m "鲸鱼娘插件：余额鲸鱼 + 任务完成提醒整合版"
git branch -M main
git remote add origin https://github.com/<你的用户名>/鲸鱼娘插件.git
git push -u origin main
```

认证（二选一）：
- HTTPS：`gh auth login`（设备码）或 Personal Access Token（勾选 repo 权限）
- SSH：`ssh-keygen -t ed25519` 生成密钥 → GitHub Settings → SSH keys 添加 → 把 remote 换成 `git@github.com:<用户名>/鲸鱼娘插件.git`

## 建议

- 仓库名用中文没问题；如果担心 URL 编码，也可以建英文名（如 `jingyuan-plugin`），README 和描述写中文
- 仓库建好后，把 README 里「安装」一节让 DSH 的 AI 照着做即可在任意机器复现安装
