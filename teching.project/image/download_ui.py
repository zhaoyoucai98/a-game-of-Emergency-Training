"""
生成扩展 UI 素材
- 成就徽章 (8 个)
- NPC 伤员 (4 个不同情景)
- 道具图标 (8 个)
风格统一：扁平矢量、卡通儿童教育游戏风、透明/纯白背景
"""
import os
import time
import urllib.request
import urllib.parse

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# === 成就徽章 (圆形徽章风格) ===
BADGES = {
    "badge-cpr.png": "Circular medal badge icon, golden ring border with red ribbon, "
                     "red cross medical symbol in center, heart shape with CPR text, "
                     "shining golden light, achievement badge, flat vector cartoon style, "
                     "white background, kawaii game UI icon, seed:4001",
    "badge-bleeding.png": "Circular medal badge icon, silver ring with red ribbon, "
                          "bandage roll with red drop in center, achievement badge, "
                          "flat vector cartoon style, white background, kawaii game UI, seed:4002",
    "badge-burns.png": "Circular medal badge icon, orange ring with red ribbon, "
                       "flame symbol with water drop in center, achievement badge, "
                       "flat vector cartoon style, white background, kawaii game UI, seed:4003",
    "badge-fracture.png": "Circular medal badge icon, blue ring with red ribbon, "
                          "bone with splint in center, achievement badge, "
                          "flat vector cartoon style, white background, kawaii game UI, seed:4004",
    "badge-poisoning.png": "Circular medal badge icon, green ring with red ribbon, "
                           "warning bottle skull icon in center, achievement badge, "
                           "flat vector cartoon style, white background, kawaii game UI, seed:4005",
    "badge-syncope.png": "Circular medal badge icon, yellow ring with red ribbon, "
                         "sun with thermometer in center, achievement badge, "
                         "flat vector cartoon style, white background, kawaii game UI, seed:4006",
    "badge-hero.png": "Circular medal badge icon, rainbow ring with red ribbon, "
                      "golden star with hero cape in center, MAX text label, "
                      "shining golden rays, ultimate achievement badge, "
                      "flat vector cartoon style, white background, kawaii game UI, seed:4007",
    "badge-streak.png": "Circular medal badge icon, fire orange ring with red ribbon, "
                        "fire flame symbol with number combo, streak achievement, "
                        "flat vector cartoon style, white background, kawaii game UI, seed:4008",
}

# === NPC 伤员形象 ===
NPCS = {
    "npc-injured-arm.png": "Chibi cartoon child character, cute boy with worried expression, "
                           "wearing yellow t-shirt and blue shorts, "
                           "right arm wrapped in white bandage with small red spot, "
                           "holding injured arm, slight tears in eyes, "
                           "flat vector kawaii style, pure white background, full body, seed:4101",
    "npc-fainted.png": "Chibi cartoon adult character lying on ground unconscious, "
                       "elderly grandma in purple dress, eyes closed peacefully, "
                       "lying flat on back, faint Z sleep symbol above head, "
                       "flat vector kawaii style, pure white background, full body, seed:4102",
    "npc-burned.png": "Chibi cartoon child character, little girl with painful expression, "
                      "wearing pink dress, holding hand with red burn mark, "
                      "tears flowing, fire spark symbol near hand, "
                      "flat vector kawaii style, pure white background, full body, seed:4103",
    "npc-fallen.png": "Chibi cartoon child character, boy sitting on ground after falling, "
                      "wearing green t-shirt blue jeans, holding ankle with hurt expression, "
                      "scattered bicycle helmet near, scratched knee, "
                      "flat vector kawaii style, pure white background, full body, seed:4104",
}

# === 道具图标 (小尺寸图标风格) ===
ITEMS = {
    "item-bandage.png": "White bandage roll icon with red cross, flat vector cartoon, "
                        "clean simple shape, pure white background, game item icon, seed:4201",
    "item-aed.png": "Yellow AED defibrillator device icon with red lightning button, "
                    "flat vector cartoon, pure white background, game item icon, seed:4202",
    "item-stethoscope.png": "Silver stethoscope icon with red tubes, flat vector cartoon, "
                            "pure white background, medical game item icon, seed:4203",
    "item-firstaid-kit.png": "Green first aid kit box icon with white cross, "
                             "flat vector cartoon, pure white background, game item icon, seed:4204",
    "item-thermometer.png": "Glass thermometer icon with red mercury, "
                            "flat vector cartoon, pure white background, game item icon, seed:4205",
    "item-water-bottle.png": "Blue water bottle icon with water droplets, "
                             "flat vector cartoon, pure white background, game item icon, seed:4206",
    "item-pills.png": "Pill bottle icon with colorful capsules, "
                      "flat vector cartoon, pure white background, game item icon, seed:4207",
    "item-phone-call.png": "Red emergency phone icon with 120 number, "
                           "flat vector cartoon, pure white background, game item icon, seed:4208",
}

# === UI 按钮 ===
BUTTONS = {
    "ui-btn-start.png": "Rectangular game UI button with rounded corners, "
                        "bright red color with white START text, "
                        "soft shadow, glossy highlight, flat vector cartoon style, "
                        "pure white background, kawaii game button, seed:4301",
    "ui-btn-next.png": "Rectangular game UI button with rounded corners, "
                       "bright green color with white right arrow icon, "
                       "soft shadow, glossy highlight, flat vector cartoon style, "
                       "pure white background, kawaii game button, seed:4302",
    "ui-btn-retry.png": "Rectangular game UI button with rounded corners, "
                        "bright orange color with white refresh circular arrow icon, "
                        "flat vector cartoon style, pure white background, seed:4303",
    "ui-btn-home.png": "Square game UI button with rounded corners, "
                       "bright blue color with white house home icon, "
                       "flat vector cartoon style, pure white background, seed:4304",
    "ui-star.png": "Golden yellow five-pointed star icon shining bright, "
                   "flat vector cartoon style, pure white background, "
                   "achievement star, glossy highlight, seed:4305",
    "ui-heart.png": "Bright red heart icon with white highlight, "
                    "flat vector cartoon style, pure white background, "
                    "game life HP icon, glossy, seed:4306",
}


def build_url(prompt, seed, size=(512, 512)):
    encoded = urllib.parse.quote(prompt)
    w, h = size
    return (
        f"https://image.pollinations.ai/prompt/{encoded}"
        f"?width={w}&height={h}&nologo=true&seed={seed}&model=flux"
    )


def download_one(filename, prompt, seed, size=(512, 512)):
    url = build_url(prompt, seed, size)
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
        with urllib.request.urlopen(req, timeout=180) as resp:
            data = resp.read()
        with open(out_path, "wb") as f:
            f.write(data)
        print(f"    [OK] {len(data)} bytes")
        return True
    except Exception as e:
        print(f"    [FAIL] {e}")
        return False


def main():
    all_assets = {}
    seed_base = 4001
    for d, size in [(BADGES, (512, 512)), (NPCS, (768, 768)),
                    (ITEMS, (512, 512)), (BUTTONS, (512, 256))]:
        for name, prompt in d.items():
            all_assets[name] = (prompt, size)

    print("=" * 60)
    print(f"UI Assets Generator - Total: {len(all_assets)}")
    print("=" * 60)

    results = {}
    for filename, (prompt, size) in all_assets.items():
        # 从 prompt 末尾提取 seed
        seed = int(prompt.split("seed:")[-1].rstrip(", ").strip())
        results[filename] = download_one(filename, prompt, seed, size)
        time.sleep(1.5)

    print("\n" + "=" * 60)
    ok = sum(1 for v in results.values() if v)
    print(f"Done: {ok}/{len(results)} succeeded")
    print("=" * 60)


if __name__ == "__main__":
    main()
