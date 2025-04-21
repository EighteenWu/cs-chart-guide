import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, message, Tag, Empty, Pagination, InputNumber, Spin, Divider, Progress } from 'antd';


// 定义品质等级
const RARITY_LEVELS = {
    '消费级': 1,
    '工业级': 2,
    '军规级': 3,
    '受限级': 4,
    '保密级': 5,
    '隐秘级': 6,  // 隐秘级是最高品质，不能参与汰换
    '传说级': 7
};

// 定义品质名称
const RARITY_NAMES = {
    1: '消费级',
    2: '工业级',
    3: '军规级',
    4: '受限级',
    5: '保密级',
    6: '隐秘级',
    7: '传说级'
};

// 定义品质颜色
const RARITY_COLORS = {
    '消费级': '#b0c3d9',
    '工业级': '#5e98d9',
    '军规级': '#4b69ff',
    '受限': '#8847ff',
    '受限级': '#8847ff',
    '保密': '#d32ce6',
    '保密级': '#d32ce6',
    '隐秘': '#eb4b4b',
    '隐秘级': '#eb4b4b',
    '传说级': '#e4ae39'
};

// 定义磨损等级颜色
const WEAR_COLORS = [
    { value: 0.07, color: '#0073ff' },  // 崭新出厂
    { value: 0.15, color: '#4b69ff' },  // 略有磨损
    { value: 0.38, color: '#8847ff' },  // 久经沙场
    { value: 0.45, color: '#d32ce6' },  // 破损不堪
    { value: 1.00, color: '#eb4b4b' }   // 战痕累累
];

// 磨损条组件
const WearBar = ({ wear }) => {
    // 如果磨损值为空或未定义，显示灰色磨损条
    if (wear === null || wear === undefined) {
        return (
            <div className="wear-bar-container">
                <Progress
                    percent={0}
                    showInfo={false}
                    strokeColor="#cccccc"
                    size="small"
                    style={{ marginBottom: 4 }}
                />
                <div className="wear-text" style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>未设置磨损</span>
                    <span>-</span>
                </div>
            </div>
        );
    }

    // 确保磨损值在0-1之间
    const safeWear = Math.max(0, Math.min(1, wear));

    // 计算百分比
    const percent = safeWear * 100;

    // 确定颜色
    let color = WEAR_COLORS[WEAR_COLORS.length - 1].color;
    for (let i = 0; i < WEAR_COLORS.length; i++) {
        if (safeWear <= WEAR_COLORS[i].value) {
            color = WEAR_COLORS[i].color;
            break;
        }
    }

    // 确定磨损等级文本
    let wearText = '';
    if (safeWear <= 0.07) wearText = '崭新出厂';
    else if (safeWear <= 0.15) wearText = '略有磨损';
    else if (safeWear <= 0.38) wearText = '久经沙场';
    else if (safeWear <= 0.45) wearText = '破损不堪';
    else wearText = '战痕累累';

    // 格式化磨损值，保留原始精度
    const formattedWear = typeof safeWear === 'number' ?
        safeWear.toString().replace(/(\.\d*?[1-9])0+$|\.0*$/, '$1') :
        safeWear;

    return (
        <div className="wear-bar-container">
            <Progress
                percent={percent}
                showInfo={false}
                strokeColor={color}
                size="small"
                style={{ marginBottom: 4 }}
            />
            <div className="wear-text" style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
                <span>{wearText}</span>
                <span>{formattedWear}</span>
            </div>
        </div>
    );
};

const getWearName = (wearValue) => {
    if (wearValue <= 0.07) return '崭新出厂';
    if (wearValue <= 0.15) return '略有磨损';
    if (wearValue <= 0.38) return '久经沙场';
    if (wearValue <= 0.45) return '破损不堪';
    return '战痕累累';
};

const getRarityClass = (rarity) => {
    if (!rarity) return '';
    const rarityName = typeof rarity === 'string' ? rarity : rarity.localized_name;
    return rarityName ? rarityName.toLowerCase().replace(/\s+/g, '-') : '';
};

const getStandardRarityName = (rarityName) => {
    if (!rarityName) return '未知';
    return rarityName;
};

const getWeaponTypeName = (internalName) => {
    const typeMap = {
        'rifle': '步枪',
        'smg': '微型冲锋枪',
        'pistol': '手枪',
        'shotgun': '霰弹枪',
        'machinegun': '机枪',
        'knife': '匕首',
        'sniper rifle': '狙击步枪'
    };
    return typeMap[internalName] || internalName || '未知类型';
};

const formatPrice = (price) => {
    if (!price) return '¥0.00';
    return `¥${parseFloat(price).toFixed(2)}`;
};

// 在 TradeUpSimulator 组件中添加以下辅助函数
const getExteriorName = (exterior) => {
    if (!exterior) return '';
    return typeof exterior === 'string' ? exterior : exterior.localized_name || '';
};

const getTypeName = (type) => {
    if (!type) return '';
    return typeof type === 'string' ? type : type.localized_name || '';
};

const TradeUpSimulator = ({ weaponCaseItems, mapCollectionItems, filterPanel, filteredItems }) => {
    const [selectedItems, setSelectedItems] = useState([]);
    const [availableItems, setAvailableItems] = useState([]);
    const [resultItems, setResultItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [itemWearValues, setItemWearValues] = useState({});

    // 添加分页相关状态
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [paginatedItems, setPaginatedItems] = useState([]);

    // 合并所有物品数据
    useEffect(() => {
        const allItems = [...weaponCaseItems, ...mapCollectionItems].filter(item =>
            item.rarity &&
            item.rarity.localized_name &&
            RARITY_LEVELS[item.rarity.localized_name] &&
            RARITY_LEVELS[item.rarity.localized_name] < 6 // 隐秘级(6)及以上不能用于汰换
        );

        setAvailableItems(allItems);
    }, [weaponCaseItems, mapCollectionItems]);

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

    // 添加物品到选择列表
    const addItem = (item) => {
        if (selectedItems.length >= 10) {
            message.warning('最多只能选择10个物品进行汰换');
            return;
        }

        // 检查是否已经选择了不同品质或类型的物品
        if (selectedItems.length > 0) {
            const firstItem = selectedItems[0];

            // 检查品质是否一致
            if (firstItem.rarity.localized_name !== item.rarity.localized_name) {
                message.error('只能选择相同品质的物品');
                return;
            }

            // 检查类型是否一致（普通或暗金）
            const firstIsDarkGold = firstItem.quality && firstItem.quality.internal_name === 'unusual';
            const currentIsDarkGold = item.quality && item.quality.internal_name === 'unusual';

            if (firstIsDarkGold !== currentIsDarkGold) {
                message.error('只能选择相同类型的物品（普通或暗金）');
                return;
            }
        }

        // 确保每个物品有唯一的ID
        const itemWithUniqueId = {
            ...item,
            uniqueId: Date.now() + Math.random().toString(36).substring(2, 9)
        };

        // 初始不设置磨损值
        setItemWearValues(prev => {
            const newValues = { ...prev };
            newValues[itemWithUniqueId.uniqueId] = null;
            return newValues;
        });

        setSelectedItems(prevItems => [...prevItems, itemWithUniqueId]);
    };

    // 移除已选择的物品
    const removeItem = (index) => {
        const newItems = [...selectedItems];
        const removedItem = newItems[index];
        newItems.splice(index, 1);

        // 移除对应的磨损值
        setItemWearValues(prev => {
            const newValues = { ...prev };
            delete newValues[removedItem.uniqueId || removedItem.id];
            return newValues;
        });

        setSelectedItems(newItems);
        if (newItems.length === 0) {
            setResultItems([]); // 清除结果
        }
    };

    // 清空所有选择
    const clearSelection = () => {
        setSelectedItems([]);
        setItemWearValues({});
        setResultItems([]);
    };

    // 更新物品磨损值 - 使用原始精度
    const updateItemWear = (itemId, value) => {
        // 如果值为空，设置为 null
        if (value === null || value === undefined || isNaN(value)) {
            setItemWearValues(prev => {
                const newValues = { ...prev };
                newValues[itemId] = null;
                return newValues;
            });
            return;
        }

        // 确保值在0-1之间
        const numValue = Math.max(0, Math.min(1, parseFloat(value)));

        // 直接使用原始输入值，避免精度问题
        setItemWearValues(prev => {
            const newValues = { ...prev };
            newValues[itemId] = numValue;
            return newValues;
        });
    };

    // 计算汰换结果的磨损值 - 使用CS2汰换公式
    const calculateResultWear = () => {
        // 根据CS2汰换公式：结果磨损值 = 输入皮肤平均磨损值 * (目标皮肤最大磨损值 - 目标皮肤最小磨损值) + 目标皮肤最小磨损值
        // 在这里我们只计算平均磨损值部分

        // 计算所有选中物品的平均磨损值
        const wearValues = selectedItems.map(item => {
            const value = itemWearValues[item.uniqueId || item.id];
            // 如果值为空，使用默认值0.15
            if (value === null || value === undefined) return 0.15;
            // 确保值是数字类型
            const numValue = parseFloat(value);
            return isNaN(numValue) ? 0.15 : numValue;
        });

        // 计算平均值
        const sum = wearValues.reduce((acc, val) => acc + val, 0);
        let avgWear = wearValues.length > 0 ? sum / wearValues.length : 0.15;

        // 直接返回计算结果，保留原始精度
        return avgWear;
    };

    // 计算每个收藏品系列的上级皮肤数量
    const getNextRaritySkinCount = (collection, currentRarityLevel, allItems) => {
        const nextRarityName = RARITY_NAMES[currentRarityLevel + 1];
        return allItems.filter(item =>
            item.weaponcase &&
            item.weaponcase.internal_name === collection &&
            item.rarity &&
            item.rarity.localized_name === nextRarityName
        ).length;
    };

    // 执行汰换
    const performTradeUp = () => {
        if (selectedItems.length !== 10) {
            message.error('需要选择10个物品才能进行汰换');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // 获取当前品质等级
            const currentRarityLevel = RARITY_LEVELS[selectedItems[0].rarity.localized_name];

            // 确保有更高品质可用
            if (currentRarityLevel >= 5) { // 保密级是最高可汰换品质，隐秘级不能汰换
                setError('已经是最高可汰换品质，无法继续汰换');
                setLoading(false);
                return;
            }

            // 获取下一级品质名称
            const nextRarityName = RARITY_NAMES[currentRarityLevel + 1];

            // 获取所有物品所属的收藏品系列
            const collections = selectedItems.map(item =>
                item.weaponcase && item.weaponcase.internal_name
            ).filter(Boolean);

            // 统计各收藏品系列的数量
            const collectionCounts = collections.reduce((acc, collection) => {
                acc[collection] = (acc[collection] || 0) + 1;
                return acc;
            }, {});

            // 获取所有可能的结果物品
            const allItems = [...weaponCaseItems, ...mapCollectionItems];
            const possibleResults = allItems.filter(item => {
                // 必须是下一级品质
                if (!item.rarity || item.rarity.localized_name !== nextRarityName) return false;

                // 必须是相同类型（普通或暗金）
                const itemIsDarkGold = item.quality && item.quality.internal_name === 'unusual';
                const selectedIsDarkGold = selectedItems[0].quality && selectedItems[0].quality.internal_name === 'unusual';
                if (itemIsDarkGold !== selectedIsDarkGold) return false;

                // 必须来自已选物品的收藏品系列之一
                return item.weaponcase && collections.includes(item.weaponcase.internal_name);
            });

            if (possibleResults.length === 0) {
                setError('没有找到符合条件的汰换结果');
                setLoading(false);
                return;
            }

            // 计算结果磨损值
            const resultWear = calculateResultWear();

            // 计算各收藏品系列的上级皮肤数量
            const collectionNextRarityCounts = {};
            Object.keys(collectionCounts).forEach(collection => {
                collectionNextRarityCounts[collection] = getNextRaritySkinCount(collection, currentRarityLevel, allItems);
            });

            // 计算总权重
            let totalWeight = 0;
            Object.keys(collectionCounts).forEach(collection => {
                totalWeight += collectionCounts[collection] * collectionNextRarityCounts[collection];
            });

            // 根据新公式计算概率
            const resultProbabilities = possibleResults.map(item => {
                const collection = item.weaponcase.internal_name;

                // 计算该收藏品系列的概率
                const collectionProbability = (collectionCounts[collection] * collectionNextRarityCounts[collection]) / totalWeight;

                // 计算该皮肤的概率 (收藏品系列概率 / 该系列上级皮肤数量)
                const skinProbability = collectionProbability / collectionNextRarityCounts[collection];

                return {
                    item,
                    probability: skinProbability,
                    wear: resultWear
                };
            });

            // 设置所有可能的结果
            setResultItems(resultProbabilities);
        } catch (err) {
            console.error('汰换过程中出错:', err);
            setError('汰换过程中出错: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="trade-up-simulator">
            <Card variant="outlined" style={{ marginBottom: 16 }}>
                <h2>CS2 汰换模拟器</h2>
                <p>选择10个相同品质的皮肤进行汰换，获得一个更高品质的皮肤。</p>

                {/* 合并筛选条件区域 */}
                <div className="filter-conditions">
                    <h3>筛选条件</h3>
                    {filterPanel}
                </div>
            </Card>

            {/* 修改为上下布局 */}
            <Row>
                <Col span={24}>
                    <Card
                        title={`已选物品 (${selectedItems.length}/10)`}
                        variant="outlined"
                        style={{ marginBottom: 16 }}
                        extra={
                            <Button type="primary" danger onClick={clearSelection} disabled={selectedItems.length === 0}>
                                清空
                            </Button>
                        }
                    >
                        {selectedItems.length > 0 ? (
                            <Row gutter={[16, 16]}>
                                {selectedItems.map((item, index) => (
                                    <Col
                                        xs={24} sm={12} md={8} lg={6} xl={4}
                                        key={`selected-${index}`}
                                    >
                                        <Card
                                            className="weapon-card"
                                            variant="outlined"
                                            hoverable
                                            cover={
                                                <div className="weapon-image-container">
                                                    <img
                                                        className="weapon-image"
                                                        alt={item.name}
                                                        src={item.icon_url || item.image}
                                                        style={{ maxHeight: 120, width: '100%', objectFit: 'contain' }}
                                                    />
                                                    <WearBar wear={itemWearValues[item.uniqueId || item.id]} />
                                                </div>
                                            }
                                            onClick={() => removeItem(index)}
                                        >
                                            <div className="weapon-info">
                                                <div className="weapon-name" title={item.name}>
                                                    {item.name}
                                                </div>
                                                <div className="weapon-details">
                                                    <Tag color={item.rarity && (RARITY_COLORS[item.rarity.localized_name] || item.rarity.color)}>{item.rarity ? item.rarity.localized_name : '未知'}</Tag>
                                                    <Tag>{item.weapon_name || getTypeName(item.type) || '未知武器'}</Tag>
                                                    {(item.exterior || item.tags?.exterior) && <Tag>{getExteriorName(item.exterior) || (item.tags?.exterior?.localized_name) || ''}</Tag>}
                                                </div>
                                                <div className="weapon-container">
                                                    {item.container || (item.weaponcase && (typeof item.weaponcase === 'string' ? item.weaponcase : item.weaponcase.localized_name)) || '未知收藏品'}
                                                </div>
                                                <div style={{ marginTop: 8 }}>
                                                    <InputNumber
                                                        min={0}
                                                        max={1}
                                                        step={0.0001}
                                                        style={{ width: '100%' }}
                                                        value={itemWearValues[item.uniqueId || item.id]}
                                                        onChange={(value) => {
                                                            // 阻止事件冒泡，防止触发卡片的点击事件
                                                            updateItemWear(item.uniqueId || item.id, value);
                                                        }}
                                                        onClick={(e) => {
                                                            // 阻止事件冒泡，防止触发卡片的点击事件
                                                            e.stopPropagation();
                                                        }}
                                                        onMouseDown={(e) => {
                                                            // 阻止事件冒泡，防止触发卡片的点击事件
                                                            e.stopPropagation();
                                                        }}
                                                        formatter={(value) => {
                                                            if (value === null || value === undefined) return '';
                                                            // 保留原始精度，去除末尾多余的0
                                                            return value.toString().replace(/(\.\d*?[1-9])0+$|\.0*$/, '$1');
                                                        }}
                                                        parser={(value) => {
                                                            const parsed = parseFloat(value);
                                                            return isNaN(parsed) ? null : parsed;
                                                        }}
                                                        controls={false}
                                                        placeholder="输入磨损值 (0-1)"
                                                    />
                                                </div>
                                            </div>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        ) : (
                            <Empty description="请从下方选择物品" />
                        )}

                        <div style={{ marginTop: 16, textAlign: 'center' }}>
                            <Button
                                type="primary"
                                onClick={performTradeUp}
                                disabled={selectedItems.length !== 10}
                                loading={loading}
                            >
                                执行汰换
                            </Button>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* 汰换结果放在已选物品下方 */}
            <Row>
                <Col span={24}>
                    <Card
                        title="汰换结果"
                        variant="outlined"
                        style={{ marginBottom: 16 }}
                    >
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: 20 }}>
                                <Spin size="large" />
                                <p>正在计算汰换结果...</p>
                            </div>
                        ) : error ? (
                            <div style={{ color: 'red', padding: 10 }}>
                                {error}
                            </div>
                        ) : resultItems.length > 0 ? (
                            <Row gutter={[16, 16]}>
                                {resultItems.map((result, index) => (
                                    <Col
                                        xs={24} sm={12} md={8} lg={6} xl={4}
                                        key={`result-${index}`}
                                    >
                                        <Card
                                            className="weapon-card"
                                            variant="outlined"
                                            cover={
                                                <div className="weapon-image-container">
                                                    <img
                                                        className="weapon-image"
                                                        alt={result.item.name}
                                                        src={result.item.icon_url || result.item.image}
                                                        style={{ maxHeight: 120, width: '100%', objectFit: 'contain' }}
                                                    />
                                                    <WearBar wear={result.wear} />
                                                </div>
                                            }
                                        >
                                            <div className="weapon-info">
                                                <div className="weapon-name" title={result.item.name}>
                                                    {result.item.name}
                                                </div>
                                                <div className="weapon-details">
                                                    <Tag color={result.item.rarity && (RARITY_COLORS[result.item.rarity.localized_name] || result.item.rarity.color)}>{result.item.rarity ? result.item.rarity.localized_name : '未知'}</Tag>
                                                    <Tag>{result.item.weapon_name || getTypeName(result.item.type) || '未知武器'}</Tag>
                                                </div>
                                                <div className="weapon-container">
                                                    {result.item.container || (result.item.weaponcase && (typeof result.item.weaponcase === 'string' ? result.item.weaponcase : result.item.weaponcase.localized_name)) || '未知收藏品'}
                                                </div>
                                                <div className="weapon-probability">
                                                    <Tag color="blue">概率: {(result.probability * 100).toFixed(2)}%</Tag>
                                                </div>
                                            </div>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        ) : (
                            <Empty description="请先执行汰换" />
                        )}
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col span={24}>
                    <Card
                        title="可用物品"
                        variant="outlined"
                    >
                        {filteredItems.length > 0 ? (
                            <>
                                <Row gutter={[16, 16]}>
                                    {paginatedItems.map((item, index) => (
                                        <Col
                                            xs={24} sm={12} md={8} lg={6} xl={4}
                                            key={`available-${index}`}
                                        >
                                            <Card
                                                className="weapon-card"
                                                variant="outlined"
                                                hoverable
                                                cover={
                                                    <div className="weapon-image-container">
                                                        <img
                                                            className="weapon-image"
                                                            alt={item.name}
                                                            src={item.icon_url || item.image}
                                                            style={{ maxHeight: 120, width: '100%', objectFit: 'contain' }}
                                                        />
                                                    </div>
                                                }
                                                onClick={() => addItem(item)}
                                            >
                                                <div className="weapon-info">
                                                    <div className="weapon-name" title={item.name}>
                                                        {item.name}
                                                    </div>
                                                    <div className="weapon-details">
                                                        <Tag color={item.rarity && (RARITY_COLORS[item.rarity.localized_name] || item.rarity.color)}>{item.rarity ? item.rarity.localized_name : '未知'}</Tag>
                                                        <Tag>{item.weapon_name || getTypeName(item.type) || '未知武器'}</Tag>
                                                    </div>
                                                    <div className="weapon-container">
                                                        {item.container || (item.weaponcase && (typeof item.weaponcase === 'string' ? item.weaponcase : item.weaponcase.localized_name)) || '未知收藏品'}
                                                    </div>
                                                </div>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                                <div style={{ marginTop: 16, textAlign: 'right' }}>
                                    <Pagination
                                        current={currentPage}
                                        pageSize={pageSize}
                                        total={filteredItems.length}
                                        onChange={handlePageChange}
                                        showSizeChanger
                                        pageSizeOptions={['10', '20', '50', '100']}
                                    />
                                </div>
                            </>
                        ) : (
                            <Empty description="没有找到符合条件的物品" />
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default TradeUpSimulator; 