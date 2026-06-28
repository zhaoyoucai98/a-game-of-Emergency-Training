"""
生成小泉的扩展状态图 - 第二批
晕厥施救、AED电击、心理安慰、奖杯领取、装备升级
"""
import os
import time
import urllib.request
import urllib.parse

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# 公共风格描述（保持角色一致性）
STYLE = (
    "Chibi cartoon character, cute 12-year-old Chinese boy hero named Xiao Quan, "
    "big sparkling brown eyes, short chestnut brown hair, "
    "wearing white t-shirt with red cross emblem on chest, "
    "bright orange-red rescue vest with reflective stripes, "
    "dark blue shorts, white socks, red and white sneakers, "
    "white medical cap with red cross logo, "
    "green first-aid backpack with white cross icon, "
    "two head tall chibi proportions, "
    "flat vector illustration, soft pastel colors, pure white background, "
    "kawaii anime style, children educational game character, full body"
)

# 第二批扩展动作
ACTIONS = {
    "xiaoquan-syncope.png": (
        STYLE + ", helping fainted person, kneeling beside unconscious patient lying on ground, "
        "supporting patient head with one hand, checking pulse on neck with other hand, "
        "lifting patient legs up elevated position, "
        "worried caring concentrated expression, syncope first aid rescue scene, "
        "seed:2001"
    ),
    "xiaoquan-aed-shock.png": (
        STYLE + ", performing AED defibrillation shock, both hands pressing AED shock button, "
        "yellow AED device with red shock button on the floor, "
        "electric lightning bolts and energy sparks radiating outward, "
        "patient lying down with electrode pads on chest, "
        "intense focused urgent expression, dramatic medical rescue scene, "
        "seed:2002"
    ),
    "xiaoquan-comfort.png": (
        STYLE + ", giving emotional comfort to crying child patient, "
        "gently patting child's shoulder with one hand, kneeling down to same eye level, "
        "warm gentle smile, soft caring expression, pink heart bubbles floating around, "
        "psychological support healing scene, "
        "seed:2003"
    ),
    "xiaoquan-trophy.png": (
        STYLE + ", holding up shiny golden trophy cup high above head with both hands, "
        "huge proud joyful smile, eyes closed in happiness, "
        "golden sparkles and confetti falling around, "
        "achievement victory celebration scene, golden light aura, "
        "seed:2004"
    ),
    "xiaoquan-upgrade.png": (
        STYLE + ", equipment upgrade transformation scene, "
        "wearing new advanced silver stethoscope around neck, "
        "holding glowing red cross medical badge in hand, "
        "new red rescue cape flowing behind, golden light beams from above, "
        "magical sparkle particles swirling around body, "
        "excited proud confident face, equipment level up scene, "
        "seed:2005"
    ),
}


def build_url(prompt, seed):
    encoded = urllib.parse.quote(prompt)
    return (
        f"https://image.pollinations.ai/prompt/{encoded}"
        f"?width=1024&height=1024&nologo=true&seed={seed}&model=flux"
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
    print("=" * 60)
    print("Xiao Quan Extended Action Frames (Batch 2)")
    print(f"Target dir: {BASE_DIR}")
    print(f"Total: {len(ACTIONS)} action frames")
    print("=" * 60)

    seeds_map = {name: 2001 + i for i, name in enumerate(ACTIONS.keys())}

    results = {}
    for filename, prompt in ACTIONS.items():
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
    print(f"\nTotal: {ok_count}/{len(ACTIONS)} succeeded")
    print("=" * 60)


if __name__ == "__main__":
    main()
