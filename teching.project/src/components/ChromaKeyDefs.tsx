/**
 * 全局 SVG 滤镜：抠掉接近纯白的外底（亮度 ≥ 96%），
 * 保留人物身上的白帽/白衣/皮肤等正常浅色细节。
 *
 * 用法：在 <img> 上加 className="chroma-key"
 *
 * 工作原理：
 * 1. 把每个像素的亮度 (0.299R + 0.587G + 0.114B) 写入 alpha 通道
 * 2. 用 discrete 阶梯：alpha < 0.96 → 1（保留），alpha ≥ 0.96 → 0（抠掉）
 * 3. 把这个二值蒙版作用回原图
 *
 * 阈值 96% 是"安全去白底"的甜点：
 * - 纯白背景（亮度 1.0）→ 抠掉
 * - text_to_image 生成的"接近白"背景（亮度 0.97~0.99）→ 抠掉
 * - 人物白帽白衣（亮度通常 0.92~0.95，因有阴影/线稿）→ 保留
 */
export default function ChromaKeyDefs() {
  return (
    <svg
      width="0"
      height="0"
      style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
      aria-hidden="true"
    >
      <defs>
        <filter
          id="chroma-key"
          x="0"
          y="0"
          width="100%"
          height="100%"
          colorInterpolationFilters="sRGB"
        >
          {/* 第一步：把"亮度"写入 alpha 通道 */}
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="
              1 0 0 0 0
              0 1 0 0 0
              0 0 1 0 0
              0.299 0.587 0.114 0 0
            "
            result="luma"
          />
          {/* 第二步：硬阈值 —— 100 档 discrete，前 96 档=1（保留），后 4 档=0（抠掉，亮度≥0.96） */}
          <feComponentTransfer in="luma" result="mask">
            <feFuncA
              type="discrete"
              tableValues="1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 0 0 0 0"
            />
          </feComponentTransfer>
          {/* 第三步：用蒙版的 alpha 取出原图（保留原色） */}
          <feComposite in="SourceGraphic" in2="mask" operator="in" />
        </filter>
      </defs>
    </svg>
  );
}

