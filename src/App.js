import React, { useState, useEffect, useMemo } from 'react';
import { Layout, Pagination, Alert, Spin } from 'antd';
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

const { Header, Content } = Layout;

function App() {
    const [containerType, setContainerType] = useState('weapon_case');
    const [selectedContainer, setSelectedContainer] = useState(null);
    const [selectedWeaponType, setSelectedWeaponType] = useState(null);
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
        if (containerType === 'weapon_case') {
            return weaponCaseData.data.items;
        } else {
            return mapCollectionData.data.items;
        }
    };

    // 筛选武器
    useEffect(() => {
        // 根据容器类型选择数据源
        let items = containerType === 'weapon_case' ? weaponCaseItems : mapCollectionItems;

        console.log(`当前数据源: ${containerType}, 数据项数量: ${items.length}`);

        // 按容器筛选
        if (selectedContainer) {
            items = items.filter(item => item.container === selectedContainer);
            console.log(`按容器筛选后数量: ${items.length}`);
        }

        // 按武器类型筛选
        if (selectedWeaponType) {
            items = items.filter(item =>
                item.weapon_type && item.weapon_type === selectedWeaponType
            );
            console.log(`按武器类型筛选后数量: ${items.length}`);
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

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header style={{ background: '#1f1f1f', padding: '0 20px' }}>
                <div className="title">CS汰换模拟器</div>
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
        </Layout>
    );
}

export default App; 