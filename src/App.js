import React, { useState, useEffect, useMemo } from 'react';
import { Layout, Pagination, Alert, Spin, ConfigProvider, theme, Switch, Space, Row, Col } from 'antd';
import { BulbOutlined, BulbFilled } from '@ant-design/icons';
import FilterPanel from './components/FilterPanel';
import WeaponList from './components/WeaponList';
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
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredItems, setFilteredItems] = useState([]);

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

    // 提取所有武器名称及其类型
    const weaponNames = useMemo(() => {
        const allItems = [...weaponCaseItems, ...mapCollectionItems];
        const weaponNameSet = new Set();
        const result = [];

        allItems.forEach(item => {
            if (item.weapon_name && item.weapon_type) {
                const key = `${item.weapon_name}_${item.weapon_type}`;
                if (!weaponNameSet.has(key)) {
                    weaponNameSet.add(key);
                    result.push({
                        name: item.weapon_name,
                        type: item.weapon_type
                    });
                }
            }
        });

        return result;
    }, [weaponCaseItems, mapCollectionItems]);

    // 获取容器列表
    const getContainers = () => {
        if (containerType === 'weapon_case') {
            return weaponCaseData.data.items;
        } else if (containerType === 'map_collection') {
            return mapCollectionData.data.items;
        } else {
            return [];
        }
    };

    // 处理主题模式切换
    const handleThemeChange = (checked) => {
        setDarkMode(checked);
    };

    // 筛选武器
    useEffect(() => {
        // 如果没有选择容器类型，显示所有数据
        let items = [];
        if (!containerType) {
            items = [...weaponCaseItems, ...mapCollectionItems];
        } else {
            // 根据容器类型选择数据源
            items = containerType === 'weapon_case' ? weaponCaseItems : mapCollectionItems;
        }

        console.log(`当前数据源数量: ${items.length}`);

        // 按容器筛选（多选）
        if (selectedContainer && selectedContainer.length > 0) {
            items = items.filter(item => selectedContainer.includes(item.container));
            console.log(`按容器筛选后数量: ${items.length}`);
        }

        // 按武器类型筛选
        if (selectedWeaponType) {
            items = items.filter(item =>
                item.weapon_type && item.weapon_type === selectedWeaponType
            );
            console.log(`按武器类型筛选后数量: ${items.length}`);
        }

        // 按武器名称筛选
        if (selectedWeaponName) {
            items = items.filter(item =>
                item.weapon_name && item.weapon_name === selectedWeaponName
            );
            console.log(`按武器名称筛选后数量: ${items.length}`);
        }

        // 按搜索关键词筛选
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            items = items.filter(item =>
                (item.name && item.name.toLowerCase().includes(query)) ||
                (item.weapon_name && item.weapon_name.toLowerCase().includes(query))
            );
            console.log(`按搜索关键词筛选后数量: ${items.length}`);
        }

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
        searchQuery,
        weaponCaseItems,
        mapCollectionItems
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

    // 配置主题
    const themeConfig = {
        algorithm: darkMode ? darkAlgorithm : defaultAlgorithm,
        token: {
            colorPrimary: '#1890ff',
            borderRadius: 4,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        },
    };

    return (
        <ConfigProvider theme={themeConfig}>
            <Layout className={darkMode ? 'dark-theme' : 'light-theme'} style={{ minHeight: '100vh' }}>
                <Header className="app-header">
                    <Row justify="space-between" align="middle">
                        <Col>
                            <div className="title">CS汰换模拟器</div>
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
                            weaponNames={weaponNames}
                            selectedWeaponName={selectedWeaponName}
                            setSelectedWeaponName={setSelectedWeaponName}
                        />

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