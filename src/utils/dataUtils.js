/**
 * 从原始武器箱详情数据中提取武器信息
 * @param {Object} weaponCaseDetails 武器箱详情数据
 * @returns {Array} 格式化后的武器数据数组
 */
export const extractWeaponCaseItems = (weaponCaseDetails) => {
    const result = [];

    // 检查数据格式
    if (!weaponCaseDetails || !Array.isArray(weaponCaseDetails)) {
        console.error('武器箱详情数据为空或格式不正确');
        return result;
    }

    try {
        // 遍历武器箱数据
        weaponCaseDetails.forEach(caseData => {
            if (caseData.code === "OK" && caseData.data && Array.isArray(caseData.data.items)) {
                const containerName = caseData.data.container ? caseData.data.container.name : '未知';

                console.log(`处理武器箱 "${containerName}" 的物品，数量:`, caseData.data.items.length);

                caseData.data.items.forEach(item => {
                    if (item.goods && item.goods.tags) {
                        const { goods } = item;

                        // 只提取需要的字段
                        result.push({
                            name: goods.short_name || goods.name,
                            icon_url: goods.icon_url,
                            weapon_type: goods.tags.category_group ? goods.tags.category_group.localized_name : '',
                            weapon_name: goods.tags.weapon ? goods.tags.weapon.localized_name : '',
                            container: containerName,
                            container_internal_name: goods.tags.weaponcase ? goods.tags.weaponcase.internal_name : '',
                            // 添加汰换所需的字段
                            rarity: goods.tags.rarity || null,
                            quality: goods.tags.quality || null,
                            weaponcase: goods.tags.weaponcase || null,
                            exterior: goods.tags.exterior || null,
                            is_souvenir: goods.tags.quality && goods.tags.quality.internal_name === 'tournament'
                        });
                    }
                });
            }
        });
    } catch (error) {
        console.error('处理武器箱详情数据时出错:', error);
    }

    console.log('提取的武器箱物品数量:', result.length);
    return result;
};

/**
 * 从原始地图收藏品详情数据中提取武器信息
 * @param {Object} mapCollectionDetails 地图收藏品详情数据
 * @returns {Array} 格式化后的武器数据数组
 */
export const extractMapCollectionItems = (mapCollectionDetails) => {
    const result = [];

    // 检查数据格式
    if (!mapCollectionDetails || !Array.isArray(mapCollectionDetails)) {
        console.error('地图收藏品详情数据为空或格式不正确');
        return result;
    }

    try {
        // 遍历地图收藏品数据
        mapCollectionDetails.forEach(collectionData => {
            if (collectionData.code === "OK" && collectionData.data && Array.isArray(collectionData.data.items)) {
                const containerName = collectionData.data.container ? collectionData.data.container.name : '未知';

                console.log(`处理地图收藏品 "${containerName}" 的物品，数量:`, collectionData.data.items.length);

                collectionData.data.items.forEach(item => {
                    if (item.goods && item.goods.tags) {
                        const { goods } = item;

                        // 只提取需要的字段
                        result.push({
                            name: goods.short_name || goods.name,
                            icon_url: goods.icon_url,
                            weapon_type: goods.tags.category_group ? goods.tags.category_group.localized_name : '',
                            weapon_name: goods.tags.weapon ? goods.tags.weapon.localized_name : '',
                            container: containerName,
                            container_internal_name: goods.tags.itemset ? goods.tags.itemset.internal_name : '',
                            // 添加汰换所需的字段
                            rarity: goods.tags.rarity || null,
                            quality: goods.tags.quality || null,
                            weaponcase: goods.tags.itemset || null, // 对于地图收藏品，使用itemset作为weaponcase
                            exterior: goods.tags.exterior || null,
                            is_souvenir: goods.tags.quality && goods.tags.quality.internal_name === 'tournament'
                        });
                    }
                });
            }
        });
    } catch (error) {
        console.error('处理地图收藏品详情数据时出错:', error);
    }

    console.log('提取的地图收藏品物品数量:', result.length);
    return result;
};

/**
 * 根据稀有度内部名称获取对应的颜色
 * @param {string} rarityInternalName 稀有度内部名称
 * @returns {string} 颜色代码
 */
export const getRarityColor = (rarityInternalName) => {
    const rarityColors = {
        'ancient_weapon': '#eb4b4b',    // 隐秘
        'legendary_weapon': '#d32ce6',  // 保密
        'mythical_weapon': '#8847ff',   // 受限级
        'rare_weapon': '#4b69ff',       // 军规级
        'uncommon_weapon': '#5e98d9',   // 工业级
        'common_weapon': '#b0c3d9'      // 消费级
    };

    return rarityColors[rarityInternalName] || '#b0c3d9';
};

/**
 * 根据稀有度内部名称获取对应的中文名称
 * @param {string} rarityInternalName 稀有度内部名称
 * @returns {string} 中文名称
 */
export const getRarityName = (rarityInternalName) => {
    const rarityNames = {
        'ancient_weapon': '隐秘级',
        'legendary_weapon': '保密级',
        'mythical_weapon': '受限级',
        'rare_weapon': '军规级',
        'uncommon_weapon': '工业级',
        'common_weapon': '消费级'
    };

    return rarityNames[rarityInternalName] || '未知';
};

/**
 * 获取所有可用的武器箱名称
 * @param {Object} weaponCaseData 武器箱数据
 * @returns {Array} 武器箱名称数组
 */
export const getWeaponCaseNames = (weaponCaseData) => {
    if (!weaponCaseData || !weaponCaseData.data || !weaponCaseData.data.items) {
        return [];
    }

    return weaponCaseData.data.items.map(item => item.name);
};

/**
 * 获取所有可用的地图收藏品名称
 * @param {Object} mapCollectionData 地图收藏品数据
 * @returns {Array} 地图收藏品名称数组
 */
export const getMapCollectionNames = (mapCollectionData) => {
    if (!mapCollectionData || !mapCollectionData.data || !mapCollectionData.data.items) {
        return [];
    }

    return mapCollectionData.data.items.map(item => item.name);
};

/**
 * 检查物品是否为收藏品系列中的最高品质
 * @param {Object} item 物品对象
 * @param {Array} allItems 所有物品数组
 * @returns {boolean} 是否为最高品质
 */
export const isHighestRarityInCollection = (item, allItems) => {
    if (!item || !item.weaponcase || !item.rarity || !item.rarity.internal_name) {
        return false;
    }

    const collectionName = item.weaponcase.internal_name;
    const itemRarity = item.rarity.internal_name;

    // 查找同一收藏品系列中的所有物品
    const sameCollectionItems = allItems.filter(
        i => i.weaponcase && i.weaponcase.internal_name === collectionName
    );

    // 获取该系列中的最高稀有度
    const rarityLevels = {
        'common_weapon': 1,
        'uncommon_weapon': 2,
        'rare_weapon': 3,
        'mythical_weapon': 4,
        'legendary_weapon': 5,
        'ancient_weapon': 6
    };

    const currentRarityLevel = rarityLevels[itemRarity] || 0;

    // 检查是否有更高稀有度的物品
    const hasHigherRarity = sameCollectionItems.some(i => {
        if (!i.rarity || !i.rarity.internal_name) return false;
        const otherRarityLevel = rarityLevels[i.rarity.internal_name] || 0;
        return otherRarityLevel > currentRarityLevel;
    });

    return !hasHigherRarity;
}; 