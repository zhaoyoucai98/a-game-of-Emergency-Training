"""
下载角色立绘 - 使用 Pollinations.ai 免费 AI 图像服务
该服务可以通过 HTTP GET 直接生成并返回图像（无需 API Key）
"""
import os
import time
import urllib.request
import urllib.parse

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

CHARACTERS = {
    "xiaoquan.png": (
        "Chibi cartoon character, cute 12-year-old Chinese boy hero named Xiao Quan, "
        "big sparkling brown eyes, short chestnut brown hair, "
        "wearing white t-shirt with red cross emblem on chest, "
        "bright orange-red rescue vest with reflective stripes, "
        "dark blue shorts, white socks, red and white sneakers, "
        "white medical cap with red cross logo, "
        "green first-aid backpack with white cross icon, "
        "heroic confident smile, thumbs up pose, two head tall chibi proportions, "
        "flat vector illustration, soft pastel colors, pure white background, "
        "kawaii anime style, full body front view, children educational game character"
    ),
    "xiaohei.png": (
        "Chibi cartoon mascot, tiny adorable black puppy, "
        "short shiny black fur all over body, round fluffy head, "
        "floppy droopy ears, big glossy round black eyes with sparkle highlights, "
        "small pink tongue sticking out, short stubby legs, fat round belly, "
        "wagging tail, wearing red cross medical collar with small golden bell, "
        "sitting pose looking up curiously, kawaii mascot style, "
        "flat vector illustration, soft pastel colors, pure white background, "
        "Labrador retriever mixed puppy"
    ),
    "grandpa-quan.png": (
        "Chibi cartoon character, kind elderly Chinese grandpa teacher named Grandpa Quan, "
        "warm friendly smile, round eyeglasses, "
        "silver white hair and short white beard, rosy cheeks, "
        "wearing white doctor coat with red cross badge on chest, "
        "red bow tie, brown pants, brown leather shoes, "
        "holding wooden teaching pointer stick, stethoscope around neck, "
        "two head tall chibi proportions, gentle wise teacher expression, "
        "flat vector illustration, soft pastel colors, pure white background, "
        "kawaii children educational game character, full body front view"
    ),
}

# Pollinations.ai 免费图像生成 API
BASE_URL = "https://image.pollinations.ai/prompt/"


def build_url(prompt, seed=42):
    encoded = urllib.parse.quote(prompt)
    return f"{BASE_URL}{encoded}?width=1024&height=1024&nologo=true&seed={seed}&model=flux"


def download_one(filename, prompt, seed):
    url = build_url(prompt, seed)
    out_path = os.path.join(BASE_DIR, filename)
    print(f"\n>>> Downloading: {filename}")
    print(f"    URL: {url[:100]}...")

    try:
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                              "AppleWebKit/537.36 (KHTML, like Gecko) "
                              "Chrome/120.0.0.0 Safari/537.36",
                "Accept": "image/png,image/*",
            },
        )
        # Pollinations 实时生成，需要给较长超时
        with urllib.request.urlopen(req, timeout=180) as resp:
            data = resp.read()

        size = len(data)
        with open(out_path, "wb") as f:
            f.write(data)
        print(f"    [OK] Saved: {out_path} ({size} bytes)")
        return True
    except Exception as e:
        print(f"    [FAIL] {e}")
        return False


def main():
    print("=" * 60)
    print("Character Image Generator (Pollinations.ai)")
    print(f"Target dir: {BASE_DIR}")
    print("=" * 60)

    seeds = {"xiaoquan.png": 1001, "xiaohei.png": 2002, "grandpa-quan.png": 3003}
    results = {}
    for filename, prompt in CHARACTERS.items():
        results[filename] = download_one(filename, prompt, seeds[filename])
        time.sleep(2)

    print("\n" + "=" * 60)
    print("Summary:")
    for filename, ok in results.items():
        path = os.path.join(BASE_DIR, filename)
        size = os.path.getsize(path) if os.path.exists(path) else 0
        status = "[OK]    " if ok else "[FAIL]  "
        print(f"  {status}{filename}  ({size} bytes)")
    print("=" * 60)


if __name__ == "__main__":
    main()
