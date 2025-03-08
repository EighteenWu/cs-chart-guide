import requests
import json
from tqdm import tqdm

# 请求头
HEADERS = {
    "Host": "buff.163.com",
    "app-version": "1505",
    "app-version-code": "2.102.0.0",
    "brand": "Xiaomi",
    "build-fingerprint": "Xiaomi/thyme/thyme:13/TKQ1.221114.001/V816.0.4.0.TGACNXM:user/release-keys",
    "channel": "Official",
    "device-id-weak": "d28f4a3c49922111",
    "manufacturer": "Xiaomi",
    "model": "M2102J2SC",
    "network": "WIFI/",
    "product": "thyme",
    "resolution": "1080x2206",
    "screen-density": "440.00",
    "screen-size": "6.35",
    "system-type": "Android",
    "system-version": "33",
    "timestamp": "1741326777.413",
    "timezone": "China Standard Time",
    "timezone-offset": "28800000",
    "timezone-offset-dst": "28800000",
    "locale": "zh_CN",
    "locale-supported": "zh-Hans"
}

# 武器箱列表的URL
WEAPON_CASES_URL = "https://buff.163.com/api/market/csgo_container_list/v2?type=weapon_cases&page_num=1&page_size=60&type2=weapon_case_collection"

# 地图收藏品列表的URL
MAP_COLLECTIONS_URL = "https://buff.163.com/api/market/csgo_container_list/v2?type=map_collections&page_num=1&page_size=60"


def fetch_data(url):
    """发送GET请求并返回JSON数据"""
    response = requests.get(url, headers=HEADERS)
    if response.status_code == 200:
        return response.json()
    raise Exception(f"请求失败，状态码: {response.status_code}")


def extract_values(data):
    """从JSON数据中提取value字段"""
    return [item.get("value") for item in data.get("data", {}).get("items", [])]


def save_to_file(filename, data):
    """将数据保存到JSON文件"""
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)


def fetch_details(values, container_type):
    """根据value字段获取明细数据"""
    details = []
    for value in tqdm(values, desc=f"Fetching {container_type} details", unit="item"):
        detail_url = f"https://buff.163.com/api/market/csgo_container?container={value}&is_container=1&container_type={container_type}&unusual_only=0&game=csgo&appid=730"
        detail_response = requests.get(detail_url, headers=HEADERS)
        if detail_response.status_code == 200:
            details.append(detail_response.json())
    return details


def main():
    try:
        # 获取武器箱和地图收藏品列表数据
        print("Fetching weapon cases list...")
        weapon_cases_data = fetch_data(WEAPON_CASES_URL)
        print("Fetching map collections list...")
        map_collections_data = fetch_data(MAP_COLLECTIONS_URL)

        # 保存列表数据
        print("Saving weapon cases list...")
        save_to_file('weapon_case.json', weapon_cases_data)
        print("Saving map collections list...")
        save_to_file('map_collection.json', map_collections_data)

        # 提取value字段
        print("Extracting values...")
        weapon_case_values = extract_values(weapon_cases_data)
        map_collection_values = extract_values(map_collections_data)

        # 获取并保存明细数据
        print("Fetching weapon case details...")
        weapon_case_details = fetch_details(weapon_case_values, "weaponcase")
        print("Fetching map collection details...")
        map_collection_details = fetch_details(map_collection_values, "itemset")

        print("Saving weapon case details...")
        save_to_file('weapon_case_details.json', weapon_case_details)
        print("Saving map collection details...")
        save_to_file('map_collection_details.json', map_collection_details)

        print("武器箱列表数据已成功保存到weapon_case.json文件中。")
        print("地图收藏品列表数据已成功保存到map_collection.json文件中。")
        print("武器箱明细数据已成功保存到weapon_case_details.json文件中。")
        print("地图收藏品明细数据已成功保存到map_collection_details.json文件中。")

    except Exception as e:
        print(f"发生错误: {e}")


if __name__ == "__main__":
    main()
