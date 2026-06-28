"""
生成游戏场景地图背景图 - 适配小泉的各种施救场景
风格与角色一致：扁平矢量、柔和色彩、卡通儿童教育游戏风
"""
import os
import time
import urllib.request
import urllib.parse

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# 公共风格 - 保持与角色立绘一致
STYLE = (
    "Flat vector cartoon illustration game background scene, "
    "soft pastel colors, kawaii children educational game art style, "
    "clean simple shapes, bright cheerful atmosphere, "
    "wide horizontal 16:9 scene with empty foreground space for character placement, "
    "no people no characters in scene, "
    "soft warm lighting, gentle shadows, vibrant but soft palette"
)

# 场景地图 - 对应不同施救关卡
SCENES = {
    # 主菜单/首页背景
    "scene-home.png": (
        "Cozy welcoming first aid academy entrance scene, "
        "big red cross hospital building with white walls and red roof, "
        "green grass lawn with colorful flowers, blue sky with fluffy white clouds, "
        "decorative tree with green leaves, warm sunshine, "
        "welcoming friendly atmosphere, " + STYLE + ", seed:3001"
    ),

    # 关卡地图主界面
    "scene-map.png": (
        "World map adventure scene with winding path connecting multiple level checkpoints, "
        "different colored islands or zones representing chapters, "
        "small flags markers along the road, mountains and trees decorations, "
        "blue river crossing the map, cute level dots with stars on them, "
        "RPG game world map style, top-down isometric view, " + STYLE + ", seed:3002"
    ),

    # CPR/急救基础场景
    "scene-cpr-room.png": (
        "Indoor classroom training room with CPR practice manikin on blue mat, "
        "medical posters on white walls showing CPR steps, "
        "wooden floor, big window with sunlight coming in, "
        "first aid equipment table on the side, white background curtains, "
        "calm safe learning environment, " + STYLE + ", seed:3003"
    ),

    # 出血/包扎场景
    "scene-bandage.png": (
        "Outdoor park scene where someone got injured, "
        "green park path with benches, tall trees with green leaves, "
        "bandages and gauze first aid kit open on a wooden bench, "
        "red blood spot indicator on ground (cartoon style not scary), "
        "sunny day with blue sky, peaceful park atmosphere, "
        + STYLE + ", seed:3004"
    ),

    # 烧烫伤场景
    "scene-burns.png": (
        "Cartoon kitchen scene with stove and pots, "
        "red hot stove burner with cartoon flame, kettle on counter, "
        "kitchen sink with running water faucet, white tiles, "
        "wooden cabinets, fire safety poster on wall, "
        "warm orange-red color theme indicating burn hazard, " + STYLE + ", seed:3005"
    ),

    # 骨折扭伤场景
    "scene-fracture.png": (
        "Outdoor playground with slides and swings, "
        "wooden bench, green grass field, "
        "fallen bicycle on the ground showing accident scene, "
        "first aid splint and bandage roll prepared on bench, "
        "kids playground equipment in pastel colors, sunny afternoon, "
        + STYLE + ", seed:3006"
    ),

    # 中毒/急救场景
    "scene-poisoning.png": (
        "Home living room or dining area scene, "
        "wooden dining table with spilled glass and bottles, "
        "warning skull cartoon icon on chemical bottles, "
        "phone on side table for emergency call, "
        "sofa and family photos on wall, calm but tense atmosphere, "
        + STYLE + ", seed:3007"
    ),

    # 动物伤害场景
    "scene-animal.png": (
        "Outdoor park or forest path with green trees, "
        "wooden fence on one side, dog house with red roof in distance, "
        "cartoon paw prints on dirt path, water faucet for washing wound, "
        "warning sign with cartoon dog icon, sunny day, "
        + STYLE + ", seed:3008"
    ),

    # 晕厥/中暑场景
    "scene-syncope.png": (
        "Hot summer outdoor street scene with bright sun in sky, "
        "city sidewalk with shade trees, bus stop bench, "
        "vending machine with water bottles, hot wavy heat lines in air, "
        "yellow-orange warm color tones indicating heat, "
        "concrete pavement, shade umbrella, " + STYLE + ", seed:3009"
    ),

    # 紧急救援场景（车祸/灾害）
    "scene-emergency.png": (
        "Urban street emergency scene with red ambulance vehicle parked, "
        "flashing red lights, traffic cones on road, "
        "buildings in background, gray street with road markings, "
        "first aid emergency response kit on ground, "
        "urgent rescue atmosphere but cartoon friendly style, "
        + STYLE + ", seed:3010"
    ),

    # 通关庆祝场景
    "scene-victory.png": (
        "Victory celebration podium scene with golden trophy on pedestal, "
        "colorful confetti and balloons falling from sky, "
        "rainbow arch in background, golden sparkles everywhere, "
        "red carpet on stage, spotlight beams shining down, "
        "joyful celebration atmosphere, " + STYLE + ", seed:3011"
    ),

    # 教学/对话场景
    "scene-classroom.png": (
        "Indoor first aid classroom scene, "
        "green chalkboard with medical diagrams drawn on it, "
        "wooden teacher desk with anatomy model, "
        "rows of student desks and chairs, big window with daylight, "
        "educational posters and a red cross flag on the wall, "
        "cozy learning environment, " + STYLE + ", seed:3012"
    ),
}


def build_url(prompt, seed):
    encoded = urllib.parse.quote(prompt)
    return (
        f"https://image.pollinations.ai/prompt/{encoded}"
        f"?width=1536&height=864&nologo=true&seed={seed}&model=flux"
    )


def download_one(filename, prompt, seed):
    url = build_url(prompt, seed)
    out_path = os.path.join(BASE_DIR, filename)
    print(f"\n>>> {filename}")
    try:
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                              "AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
                "Accept": "image/png,image/*",
            },
        )
        with urllib.request.urlopen(req, timeout=240) as resp:
            data = resp.read()
        with open(out_path, "wb") as f:
            f.write(data)
        print(f"    [OK] {len(data)} bytes")
        return True
    except Exception as e:
        print(f"    [FAIL] {e}")
        return False


def main():
    print("=" * 60)
    print("Game Scene Background Generator")
    print(f"Target dir: {BASE_DIR}")
    print(f"Total: {len(SCENES)} scenes")
    print("=" * 60)

    seeds_map = {name: 3001 + i for i, name in enumerate(SCENES.keys())}

    results = {}
    for filename, prompt in SCENES.items():
        results[filename] = download_one(filename, prompt, seeds_map[filename])
        time.sleep(2)

    print("\n" + "=" * 60)
    print("Summary:")
    ok_count = 0
    for filename, ok in results.items():
        path = os.path.join(BASE_DIR, filename)
        size = os.path.getsize(path) if os.path.exists(path) else 0
        status = "[OK]  " if ok else "[FAIL]"
        if ok:
            ok_count += 1
        print(f"  {status} {filename}  ({size} bytes)")
    print(f"\nTotal: {ok_count}/{len(SCENES)} succeeded")
    print("=" * 60)


if __name__ == "__main__":
    main()
