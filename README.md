# 🐋 鲸鱼娘插件（DeepSeek Balance Whale Widget + 任务完成提醒）

DeepSeek Harness（DSH）Web 界面右下角的**常驻小鲸鱼**：显示 DeepSeek 余额，**点击弹出控制面板**——余额刷新、任务完成提醒（开关 / 音量 / 试听 / 自定义音频）一站式设置。

整合自两个插件：

- [MeteorNOX/DeepSeek-Balance-Whale-Widget](https://github.com/MeteorNOX/DeepSeek-Balance-Whale-Widget)：余额鲸鱼主体（拖拽吸附、Q 弹、尺寸记忆）
- 任务完成提醒：agent 回合结束（`turn/end`）时播放提示音（默认「大狗大狗叫叫叫」）

## 特性

- 🐋 **鲸鱼主体**：右下角常驻，余额显示，60 秒自动刷新 + 点击刷新
- 🖱️ **拖拽吸附**：四边四分之一吸附（角落可组合），左吸附水平镜像翻转
- 🧸 **Q 弹 + 缩放**：按压玩偶效果，悬停调大小（0.6–1.4 倍，记忆）
- 🎛️ **点击弹面板**：
  - 余额显示 + 手动刷新
  - 任务完成提醒：开关 / 音量滑块 / 试听（再按停止）/ 自定义音频 URL
- 🔊 **任务完成提醒**：宿主侧监听会话事件流 `turn/end`，客户端轮询触发播放；历史回放不误报
- 📐 随窗口缩放，样式跟随 DSH 主题令牌

## 文件清单

| 文件 | 说明 |
|---|---|
| `whale-balance.mjs` | 整合版插件本体（宿主侧路由 + 页面脚本，含面板与提醒逻辑） |
| `DSniang02.png` | 小鲸鱼气泡图（1026×1026），必须与插件同目录 |
| `dagou_loud.mp3` | 默认任务完成提醒音频（可替换） |
| `cordis.patch.yml` | profile 补丁模板（把 insert 合并进你的 profile 补丁） |

## 安装

### 手动安装

1. 把 `whale-balance.mjs`、`DSniang02.png`、`dagou_loud.mp3` 复制到 DSH Web profile 目录：
   - `~/.dsh/profiles/web/`（`$DSH_HOME` 未设置时默认 `~/.dsh`）
2. 把 `cordis.patch.yml` 模板里的 insert 段合并进同目录的 `cordis.patch.yml`（文件是 `[]` 就整段使用）：
   ```yaml
   - insert:
       - id: whale-balance-widget
         name: ./whale-balance.mjs?v=1
   ```
3. 保存即热生效（profile 补丁被实时监视）；若未生效重启 `dsh web`
4. 刷新浏览器，右下角出现小鲸鱼

### 交给 AI 安装

把本文件夹放进 DSH 工作区，然后对你的 AI 说：

> 请把工作区 `鲸鱼娘插件` 文件夹里的 `whale-balance.mjs`、`DSniang02.png`、`dagou_loud.mp3` 安装到 `$DSH_HOME/profiles/web/`（默认 `~/.dsh/profiles/web/`）：复制三个文件进去，把 `cordis.patch.yml` 模板的 insert 行合并进同目录的 `cordis.patch.yml`；完成后 curl 验证 `/dsh-whale/image.png`、`/dsh-whale/audio.mp3`、`/dsh-whale/poll` 返回 200，并提醒我刷新页面。

## 验证

```bash
curl http://127.0.0.1:3080/dsh-whale/image.png     # 200 image/png（鲸鱼图）
curl http://127.0.0.1:3080/dsh-whale/audio.mp3     # 200 audio/mpeg（提醒音频）
curl http://127.0.0.1:3080/dsh-whale/balance.json  # 200 {"ok":true,...}（余额）
curl http://127.0.0.1:3080/dsh-whale/poll          # 200 {"doneAt":0}（任务完成时间戳）
```

## 任务完成提醒

- **触发时机**：宿主侧监听会话事件流，`turn/end`（回合结束）即认为任务完成，记录时间戳；客户端 1.5 秒轮询 `/dsh-whale/poll`，发现新时间戳即播放
- **设置**：点鲸鱼弹出面板 → 开关 / 音量 / 试听（再按停止）/ 自定义音频 URL（留空恢复默认）
- **存储**：localStorage（`dashu-notify:enabled` / `volume` / `url`），刷新保留
- **换音频**：替换 `dagou_loud.mp3` 并更新补丁 `?v=` 数字 +1，或直接在面板填任意音频 URL

## 更新

替换 `whale-balance.mjs`（或音频/图片）后，把补丁行 `name` 里的 `?v=` 数字 +1（ESM 缓存需破缓存），保存即热更新。

## 隐私

插件不含任何密钥；余额从 DSH 凭据服务（`DEEPSEEK_API_KEY`）运行时读取。请勿上传 `.credentials.yaml`、`settings.yaml`、`sessions` 等敏感文件。

## License

MIT（主体部分继承自 [DeepSeek-Balance-Whale-Widget](https://github.com/MeteorNOX/DeepSeek-Balance-Whale-Widget)，原作者保留权利）。
