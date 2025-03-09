import React from 'react';
import { Empty, Card, Tag, Tooltip } from 'antd';

// 品质颜色映射
const RARITY_COLORS = {
    '消费级': '#b0c3d9',
    '工业级': '#5e98d9',
    '军规级': '#4b69ff',
    '受限': '#8847ff',
    '受限级': '#8847ff', // 兼容旧数据
    '保密': '#d32ce6',
    '保密级': '#d32ce6', // 兼容旧数据
    '隐秘': '#eb4b4b',
    '隐秘级': '#eb4b4b'  // 兼容旧数据
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
        'csgo_type_pistol': '手枪',
        'csgo_type_smg': '微型冲锋枪',
        'csgo_type_rifle': '步枪',
        'csgo_type_shotgun': '霰弹枪',
        'csgo_type_sniper_rifle': '狙击步枪',
        'csgo_type_machinegun': '机枪',
        'csgo_type_knife': '匕首',
        'csgo_type_gloves': '手套',
        'csgo_type_other': '其他',
        'csgo_type_agent': '探员',
        'csgo_type_sticker': '贴纸',
        'csgo_type_music_kit': '音乐盒',
        'csgo_type_graffiti': '涂鸦',
        'csgo_type_collectible': '收藏品',
        'csgo_type_key': '钥匙',
        'csgo_type_pass': '通行证',
        'csgo_type_gift': '礼物',
        'csgo_type_tag': '名称标签',
        'csgo_type_tool': '工具',
        'csgo_type_container': '容器',
        'csgo_type_patch': '补丁',
        'csgo_type_pin': '徽章',
    };
    return typeMap[internalName] || '未知';
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

const WeaponList = ({ items }) => {
    if (!items || items.length === 0) {
        return (
            <Empty
                description="没有找到符合条件的武器"
                style={{ margin: '40px 0' }}
            />
        );
    }

    return (
        <div className="weapon-grid">
            {items.map((item, index) => (
                <Card
                    key={index}
                    className="weapon-card"
                    hoverable
                    cover={
                        <img
                            alt={item.name}
                            src={item.icon_url}
                            className="weapon-image"
                        />
                    }
                >
                    <div className="weapon-info">
                        <Tooltip title={item.name}>
                            <div className="weapon-name">
                                {item.name}
                            </div>
                        </Tooltip>

                        <div className="weapon-details">
                            {item.rarity && (
                                <Tooltip title={item.rarity.localized_name}>
                                    <Tag
                                        className={getRarityClass(item.rarity)}
                                        color={RARITY_COLORS[item.rarity.localized_name] || item.rarity.color}
                                    >
                                        {getStandardRarityName(item.rarity.localized_name)}
                                    </Tag>
                                </Tooltip>
                            )}
                            {item.weapon_type && (
                                <Tooltip title={getWeaponTypeName(item.weapon_type)}>
                                    <Tag className="weapon-type">{getWeaponTypeName(item.weapon_type)}</Tag>
                                </Tooltip>
                            )}
                            {item.exterior && (
                                <Tag className="weapon-exterior">{item.exterior.localized_name}</Tag>
                            )}
                        </div>

                        <div className="weapon-container">
                            {item.container || '未知容器'}
                        </div>

                        <div className="weapon-price">
                            {item.price ? (
                                <div className="price-tag">
                                    <span className="price-label">售价:</span>
                                    <span className="price-value">{formatPrice(item.price.sell_min)}</span>
                                </div>
                            ) : (
                                <div className="price-tag">暂无价格</div>
                            )}
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default WeaponList; 