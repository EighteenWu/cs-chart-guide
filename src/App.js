import React, { useState, useEffect, useMemo } from 'react';
import { Layout, Pagination, Alert, Spin, ConfigProvider, theme, Switch, Space, Row, Col, Menu } from 'antd';
import { BulbOutlined, BulbFilled, AppstoreOutlined, SyncOutlined } from '@ant-design/icons';
import FilterPanel from './components/FilterPanel';
import WeaponList from './components/WeaponList';
import TradeUpSimulator from './components/TradeUpSimulator';
import weaponCaseData from './assets/weapon_case.json';
import mapCollectionData from './assets/map_collection.json';
import weaponTypes from './assets/weapon_types.json';
import {
    extractWeaponCaseItems,
    extractMapCollectionItems,
} from './utils/dataUtils';

// 导入真实数据
import weaponCaseDetailsData from './assets/weapon_case_details.json';
import mapCollectionDetailsData from './assets/map_collection_details.json';

const { Header, Content, Footer } = Layout;
const { defaultAlgorithm, darkAlgorithm } = theme;

// 计算网站运行时间
const calculateRunningTime = () => {
    const startDate = new Date('2025-03-07'); // 设置网站开始运行的日期
    const currentDate = new Date();
    const timeDiff = currentDate - startDate;
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const years = Math.floor(days / 365);
    const remainingDays = days % 365;

    return `${years}年${remainingDays}天`;
};

function App() {
    const [containerType, setContainerType] = useState('');
    const [selectedContainer, setSelectedContainer] = useState([]);
    const [selectedWeaponType, setSelectedWeaponType] = useState(null);
    const [selectedWeaponName, setSelectedWeaponName] = useState(null);
    const [selectedRarity, setSelectedRarity] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredItems, setFilteredItems] = useState([]);

    // 添加筛选条件状态
    const [filters, setFilters] = useState({
        collectionType: [], // 收藏品类型：武器箱或地图收藏品
        collections: [],    // 具体的收藏品
        weaponTypes: [],    // 武器类型
        rarities: [],       // 皮肤品质
        exteriors: []       // 外观
    });

    // 添加分页相关状态
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [totalItems, setTotalItems] = useState(0);
    const [paginatedItems, setPaginatedItems] = useState([]);

    // 添加数据加载状态
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 添加暗黑模式状态
    const [darkMode, setDarkMode] = useState(false);

    // 添加当前活动页面状态
    const [activePage, setActivePage] = useState('browse'); // 'browse' 或 'tradeup'

    // 网站运行时间
    const [runningTime, setRunningTime] = useState(calculateRunningTime());

    // 定期更新运行时间
    useEffect(() => {
        const timer = setInterval(() => {
            setRunningTime(calculateRunningTime());
        }, 1000 * 60 * 60); // 每小时更新一次

        return () => clearInterval(timer);
    }, []);

    // 使用 useMemo 缓存处理后的数据，避免重复计算
    const weaponCaseItems = useMemo(() => {
        setLoading(true);
        setError(null);

        try {
            // 使用真实数据
            const items = extractWeaponCaseItems(weaponCaseDetailsData);

            if (items.length === 0) {
                setError('武器箱数据为空，请检查数据格式');
            }

            return items;
        } catch (error) {
            console.error('处理武器箱数据时出错:', error);
            setError('加载武器箱数据失败，请检查数据格式');
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const mapCollectionItems = useMemo(() => {
        setLoading(true);
        setError(null);

        try {
            // 使用真实数据
            const items = extractMapCollectionItems(mapCollectionDetailsData);

            if (items.length === 0) {
                setError('地图收藏品数据为空，请检查数据格式');
            }

            return items;
        } catch (error) {
            console.error('处理地图收藏品数据时出错:', error);
            setError('加载地图收藏品数据失败，请检查数据格式');
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    // 获取容器列表
    const getContainers = () => {
        // 根据当前选择的容器类型返回不同的容器列表
        if (containerType === 'weapon_case') {
            // 返回武器箱列表
            return [...new Set(weaponCaseItems.map(item => item.container))].filter(Boolean).sort();
        } else if (containerType === 'map_collection') {
            // 返回地图收藏品列表
            return [...new Set(mapCollectionItems.map(item => item.container))].filter(Boolean).sort();
        } else {
            // 返回所有容器列表
            const allContainers = [
                ...new Set([
                    ...weaponCaseItems.map(item => item.container),
                    ...mapCollectionItems.map(item => item.container)
                ])
            ].filter(Boolean).sort();
            return allContainers;
        }
    };

    // 获取所有武器名称
    const getWeaponNames = () => {
        // 合并所有物品数据
        const allItems = [...weaponCaseItems, ...mapCollectionItems];

        // 提取不同的武器类型和名称
        const uniqueWeapons = [];
        const weaponSet = new Set();

        allItems.forEach(item => {
            const weaponType = item.weapon_type;
            const weaponName = item.weapon_name;

            if (weaponType && weaponName && !weaponSet.has(weaponName)) {
                weaponSet.add(weaponName);
                uniqueWeapons.push({
                    type: weaponType,
                    name: weaponName
                });
            }
        });

        return uniqueWeapons;
    };

    // 处理主题切换
    const handleThemeChange = (checked) => {
        setDarkMode(checked);
    };

    // 配置主题
    const themeConfig = {
        algorithm: darkMode ? darkAlgorithm : defaultAlgorithm,
        token: {
            colorPrimary: '#1890ff',
            borderRadius: 4,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        },
    };

    // 修改 handleFilterChange 函数
    const handleFilterChange = (filterType, value) => {
        // 更新筛选条件
        if (filterType === 'containerType') {
            setContainerType(value);
        } else if (filterType === 'container') {
            setSelectedContainer(value);
        } else if (filterType === 'weaponType') {
            setSelectedWeaponType(value);
        } else if (filterType === 'weaponName') {
            setSelectedWeaponName(value);
        } else if (filterType === 'rarity') {
            setSelectedRarity(value);
        } else if (filterType === 'search') {
            setSearchQuery(value);
        } else {
            // 更新新的筛选条件
            setFilters(prev => ({
                ...prev,
                [filterType]: value
            }));
        }

        // 重置页码
        setCurrentPage(1);
    };

    // 修改筛选逻辑
    const filterItems = (items) => {
        if (!items) return [];

        return items.filter(item => {
            // 检查物品是否有必要的属性
            if (!item || !item.name) return false;

            // 根据容器类型筛选
            if (containerType === 'weapon_case' && (!item.container || !item.container.includes('武器箱'))) {
                return false;
            }
            if (containerType === 'map_collection' && (!item.container || item.container.includes('武器箱'))) {
                return false;
            }

            // 按容器筛选（多选）
            if (selectedContainer && selectedContainer.length > 0) {
                if (!item.container || !selectedContainer.includes(item.container)) {
                    return false;
                }
            }

            // 按武器类型筛选
            if (selectedWeaponType) {
                if (!item.weapon_type || item.weapon_type !== selectedWeaponType) {
                    return false;
                }
            }

            // 按武器名称筛选
            if (selectedWeaponName) {
                if (!item.weapon_name || item.weapon_name !== selectedWeaponName) {
                    return false;
                }
            }

            // 按皮肤品质筛选
            if (selectedRarity) {
                if (!item.rarity || !item.rarity.localized_name) return false;

                // 处理品质名称的变化
                let rarityName = item.rarity.localized_name;
                if (rarityName === '受限级') rarityName = '受限';
                if (rarityName === '保密级') rarityName = '保密';
                if (rarityName === '隐秘级') rarityName = '隐秘';

                if (rarityName !== selectedRarity) {
                    return false;
                }
            }

            // 按搜索关键词筛选
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                if (!(
                    (item.name && item.name.toLowerCase().includes(query)) ||
                    (item.weapon_name && item.weapon_name.toLowerCase().includes(query))
                )) {
                    return false;
                }
            }

            return true;
        });
    };

    useEffect(() => {
        // 如果没有选择容器类型，显示所有数据
        let items = [];
        if (!containerType) {
            items = [...weaponCaseItems, ...mapCollectionItems];
        } else {
            // 根据容器类型选择数据源
            items = containerType === 'weapon_case' ? weaponCaseItems : mapCollectionItems;
        }

        // 应用筛选逻辑
        items = filterItems(items);

        // 更新总数量和筛选后的项目
        setTotalItems(items.length);
        setFilteredItems(items);

        // 重置为第一页
        setCurrentPage(1);
    }, [
        containerType,
        selectedContainer,
        selectedWeaponType,
        selectedWeaponName,
        selectedRarity,
        searchQuery,
        weaponCaseItems,
        mapCollectionItems,
        filters
    ]);

    // 处理分页
    useEffect(() => {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        setPaginatedItems(filteredItems.slice(startIndex, endIndex));
    }, [filteredItems, currentPage, pageSize]);

    // 处理页码变化
    const handlePageChange = (page, size) => {
        setCurrentPage(page);
        if (size !== pageSize) {
            setPageSize(size);
        }
    };

    // 处理导航菜单点击
    const handleMenuClick = (e) => {
        setActivePage(e.key);
    };

    // 创建筛选面板组件
    const filterPanelComponent = (
        <FilterPanel
            containerType={containerType}
            setContainerType={setContainerType}
            containers={getContainers()}
            selectedContainer={selectedContainer}
            setSelectedContainer={setSelectedContainer}
            weaponTypes={weaponTypes.types}
            selectedWeaponType={selectedWeaponType}
            setSelectedWeaponType={setSelectedWeaponType}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            weaponNames={getWeaponNames()}
            selectedWeaponName={selectedWeaponName}
            setSelectedWeaponName={setSelectedWeaponName}
            selectedRarity={selectedRarity}
            setSelectedRarity={setSelectedRarity}
        />
    );

    return (
        <ConfigProvider theme={themeConfig}>
            <Layout className={darkMode ? 'dark-theme' : 'light-theme'} style={{ minHeight: '100vh' }}>
                <Header className="app-header">
                    <Row justify="space-between" align="middle">
                        <Col>
                            <div className="title">CS工具箱</div>
                        </Col>
                        <Col flex="auto">
                            <Menu
                                mode="horizontal"
                                selectedKeys={[activePage]}
                                onClick={handleMenuClick}
                                style={{ background: 'transparent', borderBottom: 'none' }}
                            >
                                <Menu.Item key="browse" icon={<AppstoreOutlined />}>
                                    浏览皮肤
                                </Menu.Item>
                                <Menu.Item key="tradeup" icon={<SyncOutlined />}>
                                    汰换模拟
                                </Menu.Item>
                            </Menu>
                        </Col>
                        <Col>
                            <Space>
                                <span>主题模式</span>
                                <Switch
                                    checked={darkMode}
                                    onChange={handleThemeChange}
                                    checkedChildren={<BulbFilled />}
                                    unCheckedChildren={<BulbOutlined />}
                                />
                            </Space>
                        </Col>
                    </Row>
                </Header>
                <Content style={{ padding: '20px' }}>
                    <div className="container">
                        {error && (
                            <Alert
                                message="数据加载错误"
                                description={error}
                                type="error"
                                showIcon
                                style={{ marginBottom: '20px' }}
                            />
                        )}

                        {activePage === 'browse' ? (
                            <>
                                {filterPanelComponent}

                                {loading ? (
                                    <div className="loading-container">
                                        <Spin size="large" tip="加载数据中..." />
                                    </div>
                                ) : (
                                    <>
                                        <WeaponList items={paginatedItems} />

                                        {/* 添加分页组件 */}
                                        {totalItems > 0 && (
                                            <div className="pagination-container">
                                                <Pagination
                                                    current={currentPage}
                                                    pageSize={pageSize}
                                                    total={totalItems}
                                                    onChange={handlePageChange}
                                                    showSizeChanger
                                                    showTotal={(total) => `共 ${total} 个物品`}
                                                    pageSizeOptions={[10, 20, 50, 100]}
                                                />
                                            </div>
                                        )}
                                    </>
                                )}
                            </>
                        ) : (
                            <TradeUpSimulator
                                weaponCaseItems={weaponCaseItems}
                                mapCollectionItems={mapCollectionItems}
                                filterPanel={filterPanelComponent}
                                filteredItems={filteredItems}
                            />
                        )}
                    </div>
                </Content>
                <Footer className="app-footer">
                    <div className="footer-content">
                        <div>cs-alchemize.dkon.cn | design by Cursor</div>
                        <div>网站已运行 {runningTime}</div>
                    </div>
                </Footer>
            </Layout>
        </ConfigProvider>
    );
}

export default App; 