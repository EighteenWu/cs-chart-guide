import React from 'react';
import { Radio, Select, Input, Row, Col, Card, Space, Button } from 'antd';
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
    setSearchQuery
}) => {
    // 处理容器类型变更
    const handleContainerTypeChange = (e) => {
        setContainerType(e.target.value);
        setSelectedContainer(null);
    };

    // 处理容器选择变更
    const handleContainerChange = (value) => {
        setSelectedContainer(value);
    };

    // 处理武器类型变更
    const handleWeaponTypeChange = (value) => {
        setSelectedWeaponType(value);
    };

    // 处理搜索查询变更
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    // 重置所有筛选条件
    const handleReset = () => {
        setSelectedContainer(null);
        setSelectedWeaponType(null);
        setSearchQuery('');
    };

    // 获取武器类型选项
    const getWeaponTypeOptions = () => {
        // 使用预定义的武器类型
        const predefinedTypes = [
            { id: '手枪', name: '手枪' },
            { id: '微型冲锋枪', name: '微型冲锋枪' },
            { id: '步枪', name: '步枪' },
            { id: '霰弹枪', name: '霰弹枪' },
            { id: '机枪', name: '机枪' },
            { id: '狙击步枪', name: '狙击步枪' }
        ];

        return predefinedTypes;
    };

    return (
        <Card className="filter-container">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        <Radio.Group
                            value={containerType}
                            onChange={handleContainerTypeChange}
                            buttonStyle="solid"
                        >
                            <Radio.Button value="weapon_case">武器箱</Radio.Button>
                            <Radio.Button value="map_collection">地图收藏品</Radio.Button>
                        </Radio.Group>
                    </Col>
                </Row>

                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <div style={{ marginBottom: 8 }}>选择{containerType === 'weapon_case' ? '武器箱' : '地图收藏品'}</div>
                        <Select
                            placeholder={`请选择${containerType === 'weapon_case' ? '武器箱' : '地图收藏品'}`}
                            style={{ width: '100%' }}
                            value={selectedContainer}
                            onChange={handleContainerChange}
                            allowClear
                        >
                            {containers.map(container => (
                                <Option key={container.name} value={container.name}>
                                    {container.name}
                                </Option>
                            ))}
                        </Select>
                    </Col>

                    <Col xs={24} sm={12} md={8} lg={6}>
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

                    <Col xs={24} sm={12} md={8} lg={6}>
                        <div style={{ marginBottom: 8 }}>搜索</div>
                        <Input
                            placeholder="输入武器名称搜索"
                            prefix={<SearchOutlined />}
                            value={searchQuery}
                            onChange={handleSearchChange}
                            allowClear
                        />
                    </Col>

                    <Col xs={24} sm={12} md={8} lg={6} style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <Button type="primary" danger onClick={handleReset}>
                            重置筛选
                        </Button>
                    </Col>
                </Row>
            </Space>
        </Card>
    );
};

export default FilterPanel; 