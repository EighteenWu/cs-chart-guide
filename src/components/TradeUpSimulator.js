import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Select, Typography, Divider, message, Empty, Tag, Alert, InputNumber, Badge, Pagination, Tooltip, Progress, Spin } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { isHighestRarityInCollection } from '../utils/dataUtils';

const { Text, Paragraph } = Typography;
const { Option } = Select;

// 品质等级映射
const RARITY_LEVELS = {
    '消费级': 1,
    '工业级': 2,
    '军规级': 3,
    '受限级': 4,
    '保密级': 5,
    '隐秘级': 6,
    '传说级': 7
};

// 反向映射，用于显示
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
    '受限级': '#8847ff',
    '保密级': '#d32ce6',
    '隐秘级': '#eb4b4b',
    '传说级': '#e4ae39'
};

// 磨损度范围
const WEAR_RANGES = {
    'fn': { min: 0.00, max: 0.07, name: '崭新出厂', full_name: '崭新出厂 (Factory New)' },
    'mw': { min: 0.07, max: 0.15, name: '略有磨损', full_name: '略有磨损 (Minimal Wear)' },
    'ft': { min: 0.15, max: 0.37, name: '久经沙场', full_name: '久经沙场 (Field-Tested)' },
    'ww': { min: 0.37, max: 0.44, name: '破损不堪', full_name: '破损不堪 (Well-Worn)' },
    'bs': { min: 0.44, max: 1.00, name: '战痕累累', full_name: '战痕累累 (Battle-Scarred)' }
};

// 磨损条颜色
const WEAR_COLORS = [
    { value: 0.07, color: '#0073ff' },  // 崭新出厂
    { value: 0.15, color: '#4b69ff' },  // 略有磨损
    { value: 0.38, color: '#8847ff' },  // 久经沙场
    { value: 0.45, color: '#d32ce6' },  // 破损不堪
    { value: 1.00, color: '#eb4b4b' }   // 战痕累累
];

// 根据磨损值获取对应的磨损度名称
const getWearName = (wearValue) => {
    if (wearValue >= 0 && wearValue <= 0.07) return 'fn';
    if (wearValue > 0.07 && wearValue <= 0.15) return 'mw';
    if (wearValue > 0.15 && wearValue <= 0.37) return 'ft';
    if (wearValue > 0.37 && wearValue <= 0.44) return 'ww';
    if (wearValue > 0.44 && wearValue <= 1.00) return 'bs';
    return 'ft'; // 默认为久经沙场
};

// 磨损条组件
const WearBar = ({ wear }) => {
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
                <span>{safeWear.toFixed(18)}</span>
            </div>
        </div>
    );
};

// 根据稀有度获取对应的CSS类名
const getRarityClass = (rarity) => {
    switch (rarity?.name) {
        case '隐秘':
        case '隐秘级':
            return 'rarity-covert';
        case '保密':
        case '保密级':
            return 'rarity-classified';
        case '受限':
        case '受限级':
            return 'rarity-restricted';
        case '军规级':
            return 'rarity-milspec';
        case '工业级':
            return 'rarity-industrial';
        case '消费级':
            return 'rarity-consumer';
        default:
            return '';
    }
};

// 获取标准化的品质名称
const getStandardRarityName = (rarityName) => {
    if (rarityName === '受限级') return '受限';
    if (rarityName === '保密级') return '保密';
    if (rarityName === '隐秘级') return '隐秘';
    return rarityName;
};

// 根据武器类型获取对应的中文名称
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

// 格式化价格
const formatPrice = (price) => {
    if (!price) return '暂无价格';

    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return '暂无价格';

    if (numPrice >= 10000) {
        return `¥${(numPrice / 10000).toFixed(2)}万`;
    } else {
        return `¥${numPrice.toFixed(2)}`;
    }
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
            item.rarity.localized_name !== '传说级' // 传说级是最高级，不能用于汰换
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

        // 为新添加的物品设置默认磨损值 - 使用 IEEE754 标准
        const defaultWear = 0.15;
        // 创建一个 Float64Array 来确保使用 IEEE754 标准
        const float64Array = new Float64Array(1);
        float64Array[0] = defaultWear;
        const ieee754Value = float64Array[0];

        setItemWearValues(prev => ({
            ...prev,
            [item.id]: ieee754Value
        }));

        setSelectedItems([...selectedItems, item]);
    };

    // 移除已选择的物品
    const removeItem = (index) => {
        const newItems = [...selectedItems];
        const removedItem = newItems[index];
        newItems.splice(index, 1);

        // 移除对应的磨损值
        const newWearValues = { ...itemWearValues };
        delete newWearValues[removedItem.id];

        setSelectedItems(newItems);
        setItemWearValues(newWearValues);
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

    // 更新物品磨损值 - 使用 IEEE754 标准
    const updateItemWear = (itemId, value) => {
        // 确保值是数字类型
        let numValue = parseFloat(value);
        if (isNaN(numValue)) {
            numValue = 0.15; // 默认值
        }

        // 确保值在0-1之间
        numValue = Math.max(0, Math.min(1, numValue));

        // 使用 IEEE754 标准
        const float64Array = new Float64Array(1);
        float64Array[0] = numValue;
        const ieee754Value = float64Array[0];

        setItemWearValues(prev => ({
            ...prev,
            [itemId]: ieee754Value
        }));
    };

    // 计算汰换结果的磨损值 - 使用 IEEE754 标准
    const calculateResultWear = () => {
        // 计算所有选中物品的平均磨损值
        const wearValues = selectedItems.map(item => {
            const value = itemWearValues[item.id];
            // 确保值是数字类型
            const numValue = parseFloat(value);
            return isNaN(numValue) ? 0.15 : numValue;
        });

        // 计算平均值
        const sum = wearValues.reduce((acc, val) => acc + val, 0);
        let avgWear = wearValues.length > 0 ? sum / wearValues.length : 0.15;

        // 使用 IEEE754 标准
        const float64Array = new Float64Array(1);
        float64Array[0] = avgWear;
        return float64Array[0];
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
            if (currentRarityLevel >= 6) { // 隐秘级是最高可汰换品质
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

            <Row gutter={16}>
                <Col span={12}>
                    <Card
                        title="可用物品"
                        variant="outlined"
                        style={{ marginBottom: 16 }}
                    >
                        {filteredItems.length > 0 ? (
                            <>
                                <Row gutter={[16, 16]}>
                                    {paginatedItems.map((item, index) => (
                                        <Col
                                            xs={24} sm={12} md={8} lg={6}
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
                                                        {(item.exterior || item.tags?.exterior) && <Tag>{getExteriorName(item.exterior) || (item.tags?.exterior?.localized_name) || ''}</Tag>}
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

                <Col span={12}>
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
                                        xs={24} sm={12} md={8} lg={6}
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
                                                    <WearBar wear={itemWearValues[item.id] || 0.15} />
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
                                                        step={0.01}
                                                        style={{ width: '100%' }}
                                                        value={itemWearValues[item.id]}
                                                        onChange={(value) => updateItemWear(item.id, value)}
                                                        formatter={(value) => value ? parseFloat(value).toFixed(18) : '0.000000000000000000'}
                                                        parser={(value) => parseFloat(value)}
                                                    />
                                                </div>
                                            </div>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        ) : (
                            <Empty description="请从左侧选择物品" />
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

                    <Card
                        title="汰换结果"
                        variant="outlined"
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
                                        xs={24} sm={12} md={8} lg={6}
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
                                                    {(result.item.exterior || result.item.tags?.exterior) && <Tag>{getExteriorName(result.item.exterior) || (result.item.tags?.exterior?.localized_name) || ''}</Tag>}
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
        </div>
    );
};

export default TradeUpSimulator; 