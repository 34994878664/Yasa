# 手机上传 GitHub 仓库并生成网址教程

下面按安卓手机浏览器写。你只要照着点就行。

---

## 第一步：解压整合包

1. 下载 `cute-abyss-dungeon.zip`
2. 在手机文件管理里点开压缩包
3. 解压后确认里面有这些文件：
   - `index.html`
   - `styles.css`
   - `game.js`
   - `manifest.webmanifest`
   - `icon.svg`
   - `.nojekyll`
   - `robots.txt`
   - `sitemap.xml`

> 重点：这些文件要在仓库最外层，不要套一层文件夹。也就是说 GitHub 仓库打开后，第一眼就能看到 `index.html`。

---

## 第二步：新建 GitHub 仓库

1. 打开 GitHub App 或手机浏览器进入 GitHub
2. 点右上角 `+`
3. 选择 `New repository`
4. 仓库名字可以填：`cute-abyss-dungeon`
5. 选择 `Public`
6. 点 `Create repository`

---

## 第三步：上传文件

1. 进入刚创建的仓库
2. 点 `Add file`
3. 点 `Upload files`
4. 选择刚才解压出来的所有文件
5. 等上传完成
6. 页面底部 `Commit changes` 直接点确认

> 如果手机一次选不了所有文件，就分几次上传也可以。一定要确保 `index.html`、`game.js`、`styles.css` 都上传了。

---

## 第四步：开启 GitHub Pages

1. 进入仓库首页
2. 点 `Settings`
3. 找到 `Pages`
4. Source 选择：`Deploy from a branch`
5. Branch 选择：`main`
6. 文件夹选择：`/root`
7. 点 `Save`

---

## 第五步：打开游戏网址

1. 回到 `Settings → Pages`
2. 等几十秒到几分钟
3. 页面会出现类似：

`https://你的用户名.github.io/cute-abyss-dungeon/`

4. 把这个网址发给朋友，朋友点开就能玩

---

## 常见问题

### 1. 打开网址是 404

一般是 GitHub Pages 还没部署好，等一会再刷新。

也可能是文件没放在最外层。仓库首页必须直接看到 `index.html`。

### 2. 打开后是空白

检查这三个文件是否都上传成功：

- `index.html`
- `styles.css`
- `game.js`

缺一个都可能白屏。

### 3. 手机上不好操作

游戏默认开启自动射击。朋友第一次玩，只需要左摇杆移动就可以；右摇杆是给高手手动瞄准用的。

### 4. 想换仓库名

可以换。GitHub Pages 网址最后一段会跟仓库名变化。

例如仓库叫 `my-game`，网址就是：

`https://你的用户名.github.io/my-game/`

---

## sitemap 修改方法

`sitemap.xml` 里默认写的是示例网址。等你的 GitHub Pages 网址生成后，可以把里面的：

`https://example.github.io/cute-abyss-dungeon/`

替换成你的真实网址。

不改也不影响朋友游玩，只影响搜索引擎收录。
