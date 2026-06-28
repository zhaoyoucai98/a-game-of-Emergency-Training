"""
生成动画 GIF：
- xiaoquan-idle.gif    呼吸效果（轻微缩放）
- xiaoquan-run.gif     行走/跳跃循环（上下浮动 + 轻微旋转）
- xiaoquan-cheer.gif   欢呼跳跃（大幅上下浮动 + 缩放）

技术方案：基于单张原图，通过 PIL 做位移/缩放/旋转生成多帧，合成 GIF
"""
import os
from PIL import Image

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def make_breath_gif(src_path, out_path, frames=20, duration=80):
    """呼吸效果：缩放 100% -> 103% -> 100%"""
    base = Image.open(src_path).convert("RGBA")
    w, h = base.size
    canvas_size = (w, h)
    images = []
    for i in range(frames):
        t = i / frames
        # sin 波形缩放 1.00 ~ 1.03
        import math
        scale = 1.0 + 0.03 * (math.sin(t * 2 * math.pi) + 1) / 2
        new_w, new_h = int(w * scale), int(h * scale)
        scaled = base.resize((new_w, new_h), Image.LANCZOS)
        canvas = Image.new("RGBA", canvas_size, (255, 255, 255, 255))
        x = (w - new_w) // 2
        y = (h - new_h) // 2
        canvas.paste(scaled, (x, y), scaled)
        images.append(canvas.convert("P", palette=Image.ADAPTIVE))

    images[0].save(
        out_path, save_all=True, append_images=images[1:],
        duration=duration, loop=0, disposal=2, optimize=True
    )
    print(f"[OK] Breath GIF: {out_path} ({os.path.getsize(out_path)} bytes)")


def make_run_gif(src_path, out_path, frames=12, duration=80):
    """行走/跳跃：上下浮动 + 轻微左右倾斜"""
    base = Image.open(src_path).convert("RGBA")
    w, h = base.size
    images = []
    import math
    for i in range(frames):
        t = i / frames
        # 上下浮动 ±15px
        offset_y = int(15 * math.sin(t * 2 * math.pi))
        # 左右轻微倾斜 ±5度
        tilt = 5 * math.sin(t * 2 * math.pi)
        rotated = base.rotate(tilt, resample=Image.BICUBIC, expand=False)
        canvas = Image.new("RGBA", (w, h), (255, 255, 255, 255))
        canvas.paste(rotated, (0, -offset_y), rotated)
        images.append(canvas.convert("P", palette=Image.ADAPTIVE))

    images[0].save(
        out_path, save_all=True, append_images=images[1:],
        duration=duration, loop=0, disposal=2, optimize=True
    )
    print(f"[OK] Run GIF: {out_path} ({os.path.getsize(out_path)} bytes)")


def make_cheer_gif(src_path, out_path, frames=16, duration=100):
    """欢呼跳跃：大幅上下浮动 + 缩放"""
    base = Image.open(src_path).convert("RGBA")
    w, h = base.size
    images = []
    import math
    for i in range(frames):
        t = i / frames
        # 跳跃 ±40px
        offset_y = int(40 * abs(math.sin(t * math.pi)))
        # 跳到最高点时变大
        scale = 1.0 + 0.08 * abs(math.sin(t * math.pi))
        new_w, new_h = int(w * scale), int(h * scale)
        scaled = base.resize((new_w, new_h), Image.LANCZOS)
        canvas = Image.new("RGBA", (w, h), (255, 255, 255, 255))
        x = (w - new_w) // 2
        y = (h - new_h) // 2 - offset_y
        canvas.paste(scaled, (x, y), scaled)
        images.append(canvas.convert("P", palette=Image.ADAPTIVE))

    images[0].save(
        out_path, save_all=True, append_images=images[1:],
        duration=duration, loop=0, disposal=2, optimize=True
    )
    print(f"[OK] Cheer GIF: {out_path} ({os.path.getsize(out_path)} bytes)")


def make_levelup_gif(src_path, out_path, frames=20, duration=80):
    """升级闪光：缩放 + 闪烁亮度"""
    from PIL import ImageEnhance
    base = Image.open(src_path).convert("RGBA")
    w, h = base.size
    images = []
    import math
    for i in range(frames):
        t = i / frames
        scale = 1.0 + 0.05 * (math.sin(t * 4 * math.pi) + 1) / 2
        new_w, new_h = int(w * scale), int(h * scale)
        scaled = base.resize((new_w, new_h), Image.LANCZOS)
        # 闪烁亮度 1.0 ~ 1.3
        brightness = 1.0 + 0.3 * (math.sin(t * 4 * math.pi) + 1) / 2
        enhancer = ImageEnhance.Brightness(scaled)
        scaled = enhancer.enhance(brightness)
        canvas = Image.new("RGBA", (w, h), (255, 255, 255, 255))
        x = (w - new_w) // 2
        y = (h - new_h) // 2
        canvas.paste(scaled, (x, y), scaled)
        images.append(canvas.convert("P", palette=Image.ADAPTIVE))

    images[0].save(
        out_path, save_all=True, append_images=images[1:],
        duration=duration, loop=0, disposal=2, optimize=True
    )
    print(f"[OK] LevelUp GIF: {out_path} ({os.path.getsize(out_path)} bytes)")


def main():
    print("=" * 60)
    print("Animation GIF Generator")
    print("=" * 60)

    make_breath_gif(
        os.path.join(BASE_DIR, "xiaoquan-idle.png"),
        os.path.join(BASE_DIR, "xiaoquan-idle.gif"),
    )
    make_run_gif(
        os.path.join(BASE_DIR, "xiaoquan-run.png"),
        os.path.join(BASE_DIR, "xiaoquan-run.gif"),
    )
    make_cheer_gif(
        os.path.join(BASE_DIR, "xiaoquan-cheer.png"),
        os.path.join(BASE_DIR, "xiaoquan-cheer.gif"),
    )
    make_levelup_gif(
        os.path.join(BASE_DIR, "xiaoquan-levelup.png"),
        os.path.join(BASE_DIR, "xiaoquan-levelup.gif"),
    )

    # Mascot 小黑也来一个呼吸 GIF
    make_breath_gif(
        os.path.join(BASE_DIR, "xiaohei.png"),
        os.path.join(BASE_DIR, "xiaohei-idle.gif"),
        frames=20, duration=100,
    )

    print("=" * 60)
    print("All animations done!")
    print("=" * 60)


if __name__ == "__main__":
    main()
