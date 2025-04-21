# CS汰换模拟器

这是一个基于React的CS:GO汰换模拟器;每个物品的磨损区间不一致,需要拿到所有物品的所有磨损区间,然后进行计算;物品磨损实际汰换过程中只计算了前9位,后续的数值没有进行计算,buff的磨损后九位也是随机生成;

## 体验地址
https://cs-alchemize.dkon.cn/

## 功能特点

- 支持武器箱和地图收藏品两种类型的筛选
- 支持按武器类别筛选（手枪、微型冲锋枪、步枪、霰弹枪、机枪）
- 支持搜索功能，可进行模糊检索和精确检索
- 响应式设计，适配不同屏幕尺寸

## 技术栈

- React 18
- Ant Design 5
- CSS3 Grid Layout

## 安装与运行

1. 安装依赖：

```bash
npm install
```

2. 启动开发服务器：

```bash
npm start
```

3. 构建生产版本：

```bash
npm run build
```

## 数据来源

- 武器箱数据：`src/assets/weapon_case.json`
- 地图收藏品数据：`src/assets/map_collection.json`
- 武器详情数据：`src/assets/simplified_weapon_case_details.json` 和 `src/assets/simplified_map_collection_details.json`

## 项目结构

```
src/
  ├── assets/         # 静态资源和数据文件
  ├── components/     # React组件
  │   ├── FilterPanel.js  # 筛选面板组件
  │   └── WeaponList.js   # 武器列表组件
  ├── App.js          # 主应用组件
  ├── index.js        # 应用入口
  └── index.css       # 全局样式
``` 
