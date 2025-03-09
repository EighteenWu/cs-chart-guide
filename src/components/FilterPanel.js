import React, { useState, useEffect } from 'react';
import { Select, Input, Row, Col, Card, Space, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { Option } = Select;

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
    setSelectedWeaponName
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

    // 处理搜索查询变更
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    // 重置所有筛选条件
    const handleReset = () => {
        setSelectedContainer([]);
        setSelectedWeaponType(null);
        setSelectedWeaponName(null);
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

    return (
        <Card className="filter-container">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={6} lg={6}>
                        <div style={{ marginBottom: 8 }}>收藏品类型</div>
                        <Select
                            placeholder="请选择收藏品类型"
                            style={{ width: '100%' }}
                            value={containerType}
                            onChange={handleContainerTypeChange}
                            allowClear
                        >
                            {getContainerTypeOptions().map(option => (
                                <Option key={option.value} value={option.value}>
                                    {option.label}
                                </Option>
                            ))}
                        </Select>
                    </Col>

                    <Col xs={24} sm={24} md={12} lg={12}>
                        <div style={{ marginBottom: 8 }}>选择{containerType === 'weapon_case' ? '武器箱' : containerType === 'map_collection' ? '地图收藏品' : '收藏品'}</div>
                        <Select
                            placeholder={`请选择${containerType === 'weapon_case' ? '武器箱' : containerType === 'map_collection' ? '地图收藏品' : '收藏品'}`}
                            style={{ width: '100%' }}
                            value={selectedContainer}
                            onChange={handleContainerChange}
                            allowClear
                            mode="multiple"
                            maxTagCount={3}
                            maxTagTextLength={10}
                            disabled={!containerType}
                        >
                            {containers.map(container => (
                                <Option key={container.name} value={container.name}>
                                    {container.name}
                                </Option>
                            ))}
                        </Select>
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