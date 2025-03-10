import React, { useState, useEffect } from 'react';
import { Select, Input, Row, Col, Card, Space, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { Option } = Select;

// 品质等级映射
const RARITY_LEVELS = {
    '消费级': 1,
    '工业级': 2,
    '军规级': 3,
    '受限': 4,
    '保密': 5,
    '隐秘': 6
};

// 品质颜色映射
const RARITY_COLORS = {
    '消费级': '#b0c3d9',
    '工业级': '#5e98d9',
    '军规级': '#4b69ff',
    '受限': '#8847ff',
    '保密': '#d32ce6',
    '隐秘': '#eb4b4b'
};

const FilterPanel = ({
    containerType,
    setContainerType,
    containers,
    selectedContainer,
    setSelectedContainer,
    weaponTypes,
    selectedWeaponType,
    setSelectedWeaponType,
    searchQuery,
    setSearchQuery,
    weaponNames,
    selectedWeaponName,
    setSelectedWeaponName,
    selectedRarity,
    setSelectedRarity
}) => {
    // 本地状态，用于存储按武器类型筛选的武器名称列表
    const [filteredWeaponNames, setFilteredWeaponNames] = useState([]);

    // 处理容器类型变更
    const handleContainerTypeChange = (value) => {
        setContainerType(value);
        setSelectedContainer([]);
    };

    // 处理容器选择变更（多选）
    const handleContainerChange = (values) => {
        setSelectedContainer(values);
    };

    // 处理武器类型变更
    const handleWeaponTypeChange = (value) => {
        setSelectedWeaponType(value);
        setSelectedWeaponName(null); // 重置武器名称选择
    };

    // 处理武器名称变更
    const handleWeaponNameChange = (value) => {
        setSelectedWeaponName(value);
    };

    // 处理品质变更
    const handleRarityChange = (value) => {
        setSelectedRarity(value);
    };

    // 处理搜索查询变更
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    // 重置所有筛选条件
    const handleReset = () => {
        setSelectedContainer([]);
        setSelectedWeaponType(null);
        setSelectedWeaponName(null);
        setSelectedRarity(null);
        setSearchQuery('');
    };

    // 获取武器类型选项
    const getWeaponTypeOptions = () => {
        // 使用预定义的武器类型，去掉狙击步枪
        const predefinedTypes = [
            { id: '手枪', name: '手枪' },
            { id: '微型冲锋枪', name: '微型冲锋枪' },
            { id: '步枪', name: '步枪' },
            { id: '霰弹枪', name: '霰弹枪' },
            { id: '机枪', name: '机枪' }
        ];

        return predefinedTypes;
    };

    // 获取容器类型选项
    const getContainerTypeOptions = () => {
        return [
            { value: 'weapon_case', label: '武器箱' },
            { value: 'map_collection', label: '地图收藏品' }
        ];
    };

    // 获取品质选项
    const getRarityOptions = () => {
        return Object.entries(RARITY_LEVELS).map(([name, level]) => ({
            value: name,
            label: name,
            color: RARITY_COLORS[name]
        }));
    };

    // 当武器类型变化时，筛选对应的武器名称
    useEffect(() => {
        if (!selectedWeaponType || !weaponNames || weaponNames.length === 0) {
            setFilteredWeaponNames([]);
            return;
        }

        // 筛选出当前武器类型下的所有武器名称
        const filtered = weaponNames.filter(weapon => weapon.type === selectedWeaponType);
        setFilteredWeaponNames(filtered);
    }, [selectedWeaponType, weaponNames]);

    // 渲染容器类型选择器
    const renderContainerTypeSelector = () => {
        return (
            <Select
                placeholder="选择收藏品类型"
                style={{ width: '100%' }}
                value={containerType}
                onChange={handleContainerTypeChange}
                allowClear
            >
                <Option value="">全部</Option>
                <Option value="weapon_case">武器箱</Option>
                <Option value="map_collection">地图收藏品</Option>
            </Select>
        );
    };

    // 渲染容器选择器
    const renderContainerSelector = () => {
        return (
            <Select
                mode="multiple"
                placeholder="选择具体收藏品"
                style={{ width: '100%' }}
                value={selectedContainer}
                onChange={setSelectedContainer}
                allowClear
                maxTagCount={3}
            >
                {containers.map(container => (
                    <Option key={container} value={container}>
                        {container}
                    </Option>
                ))}
            </Select>
        );
    };

    return (
        <Card className="filter-container">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={6} lg={6}>
                        <div style={{ marginBottom: 8 }}>收藏品类型</div>
                        {renderContainerTypeSelector()}
                    </Col>

                    <Col xs={24} sm={24} md={12} lg={12}>
                        <div style={{ marginBottom: 8 }}>选择{containerType === 'weapon_case' ? '武器箱' : containerType === 'map_collection' ? '地图收藏品' : '收藏品'}</div>
                        {renderContainerSelector()}
                    </Col>

                    <Col xs={24} sm={12} md={6} lg={6} style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <Button type="primary" danger onClick={handleReset}>
                            重置筛选
                        </Button>
                    </Col>
                </Row>

                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={6} lg={6}>
                        <div style={{ marginBottom: 8 }}>武器类型</div>
                        <Select
                            placeholder="请选择武器类型"
                            style={{ width: '100%' }}
                            value={selectedWeaponType}
                            onChange={handleWeaponTypeChange}
                            allowClear
                        >
                            {getWeaponTypeOptions().map(type => (
                                <Option key={type.id} value={type.id}>
                                    {type.name}
                                </Option>
                            ))}
                        </Select>
                    </Col>

                    <Col xs={24} sm={12} md={6} lg={6}>
                        <div style={{ marginBottom: 8 }}>武器类名</div>
                        <Select
                            placeholder="请选择武器类名"
                            style={{ width: '100%' }}
                            value={selectedWeaponName}
                            onChange={handleWeaponNameChange}
                            allowClear
                            disabled={!selectedWeaponType || filteredWeaponNames.length === 0}
                        >
                            {filteredWeaponNames.map(weapon => (
                                <Option key={weapon.name} value={weapon.name}>
                                    {weapon.name}
                                </Option>
                            ))}
                        </Select>
                    </Col>

                    <Col xs={24} sm={12} md={6} lg={6}>
                        <div style={{ marginBottom: 8 }}>皮肤品质</div>
                        <Select
                            placeholder="请选择皮肤品质"
                            style={{ width: '100%' }}
                            value={selectedRarity}
                            onChange={handleRarityChange}
                            allowClear
                        >
                            {getRarityOptions().map(option => (
                                <Option key={option.value} value={option.value}>
                                    <span style={{ color: option.color }}>{option.label}</span>
                                </Option>
                            ))}
                        </Select>
                    </Col>

                    <Col xs={24} sm={12} md={6} lg={6}>
                        <div style={{ marginBottom: 8 }}>搜索</div>
                        <Input
                            placeholder="输入武器名称搜索"
                            prefix={<SearchOutlined />}
                            value={searchQuery}
                            onChange={handleSearchChange}
                            allowClear
                        />
                    </Col>
                </Row>
            </Space>
        </Card>
    );
};

export default FilterPanel; 