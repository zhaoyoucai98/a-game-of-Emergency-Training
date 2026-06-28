"""
生成小泉的多种动作状态图 - 用于闯关游戏的角色动画帧
使用 Pollinations.ai 免费 AI 图像服务
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

# 状态动画帧
ACTIONS = {
    "xiaoquan-idle.png": (
        STYLE + ", standing idle pose, relaxed arms at sides, "
        "calm friendly smile, looking forward, default character pose, "
        "seed:1001"
    ),
    "xiaoquan-run.png": (
        STYLE + ", running pose sprinting forward, dynamic motion, "
        "one leg lifted high, arms swinging energetically, "
        "determined urgent face, speed lines, action pose, "
        "seed:1002"
    ),
    "xiaoquan-cpr.png": (
        STYLE + ", kneeling down performing CPR chest compression on patient dummy, "
        "both hands stacked pressing down on chest, serious focused face, "
        "concentrated medical rescue action, side view kneeling pose, "
        "seed:1003"
    ),
    "xiaoquan-bandage.png": (
        STYLE + ", carefully wrapping white bandage around injured arm, "
        "holding gauze and bandage roll, gentle caring expression, "
        "medical first aid bandaging action, sitting pose, "
        "seed:1004"
    ),
    "xiaoquan-cheer.png": (
        STYLE + ", celebrating victory pose, both arms raised high in the air, "
        "huge excited happy smile, eyes closed with joy, jumping up, "
        "sparkles and stars around, big red heart above head, "
        "correct answer celebration, seed:1005"
    ),
    "xiaoquan-sad.png": (
        STYLE + ", sad disappointed pose, both hands covering face, "
        "shoulders slumped down, single blue tear drop falling, "
        "wrong answer sad expression, gloomy aura, "
        "seed:1006"
    ),
    "xiaoquan-think.png": (
        STYLE + ", thinking pose, one hand on chin scratching head, "
        "puzzled curious expression, glowing yellow lightbulb above head, "
        "question mark floating, contemplating, "
        "seed:1007"
    ),
    "xiaoquan-levelup.png": (
        STYLE + ", level up power up pose, standing tall confidently, "
        "right hand giving salute gesture, golden light aura surrounding body, "
        "shining sparkles and stars exploding outward, "
        "heroic triumphant face, glowing background rays, "
        "seed:1008"
    ),
    "xiaoquan-aed.png": (
        STYLE + ", using AED defibrillator device, both hands holding electric pads, "
        "applying pads to patient chest, focused serious expression, "
        "medical emergency rescue action, "
        "seed:1009"
    ),
    "xiaoquan-hint.png": (
        STYLE + ", presenting pose pointing finger to the side, "
        "friendly smile teaching gesture, glowing speech bubble above head, "
        "explaining knowledge tip pose, mentor pose, "
        "seed:1010"
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
    print("Xiao Quan Action Frames Generator")
    print(f"Target dir: {BASE_DIR}")
    print(f"Total: {len(ACTIONS)} action frames")
    print("=" * 60)

    seeds_map = {name: 1001 + i for i, name in enumerate(ACTIONS.keys())}

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
