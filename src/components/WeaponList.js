import React from 'react';
import { Empty, Card, Tag, Tooltip } from 'antd';

// 根据稀有度获取对应的CSS类名
const getRarityClass = (rarity) => {
    switch (rarity?.name) {
        case '隐秘':
            return 'rarity-covert';
        case '保密':
            return 'rarity-classified';
        case '分类':
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

// 根据武器类型获取对应的中文名称
const getWeaponTypeName = (internalName) => {
    const typeMap = {
        'csgo_type_pistol': '手枪',
        'csgo_type_smg': '微型冲锋枪',
        'csgo_type_rifle': '步枪',
        'csgo_type_shotgun': '霰弹枪',
        'csgo_type_machinegun': '机枪',
        'csgo_type_sniperrifle': '狙击步枪'
    };
    return typeMap[internalName] || internalName;
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
                            <div className="weapon-type">
                                {item.weapon_type || '未知类型'}
                            </div>

                            {item.weapon_name && (
                                <Tag color="blue" className="weapon-exterior">
                                    {item.weapon_name}
                                </Tag>
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