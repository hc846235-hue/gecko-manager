"""生成 PWA 图标 icon-192.png 和 icon-512.png（纯标准库实现）"""
import struct, zlib, os

def write_png(filename, size):
    """用纯 Python 标准库写一个简单的 PNG 图标"""
    w = h = size

    # 创建像素数组 RGBA
    pixels = [[None] * w for _ in range(h)]

    bg = (124, 154, 110, 255)   # 绿色背景
    body = (200, 230, 180, 255) # 浅绿守宫身体
    eye  = (50, 80, 40, 255)    # 深色眼睛
    trans = (0, 0, 0, 0)        # 透明

    # 填充透明
    for y in range(h):
        for x in range(w):
            pixels[y][x] = trans

    # 圆角背景
    r_corner = size // 5
    for y in range(h):
        for x in range(w):
            # 判断是否在圆角矩形内
            in_rect = True
            cx_c, cy_c = None, None
            if x < r_corner and y < r_corner:
                cx_c, cy_c = r_corner, r_corner
            elif x > w - 1 - r_corner and y < r_corner:
                cx_c, cy_c = w - 1 - r_corner, r_corner
            elif x < r_corner and y > h - 1 - r_corner:
                cx_c, cy_c = r_corner, h - 1 - r_corner
            elif x > w - 1 - r_corner and y > h - 1 - r_corner:
                cx_c, cy_c = w - 1 - r_corner, h - 1 - r_corner
            if cx_c is not None:
                dist = ((x - cx_c)**2 + (y - cy_c)**2) ** 0.5
                in_rect = dist <= r_corner
            if in_rect:
                pixels[y][x] = bg

    # 画椭圆辅助
    def fill_ellipse(cx, cy, rx, ry, color):
        for y in range(max(0, cy - ry), min(h, cy + ry + 1)):
            for x in range(max(0, cx - rx), min(w, cx + rx + 1)):
                if ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1.0:
                    pixels[y][x] = color

    # 画线段辅助
    def draw_line(x0, y0, x1, y1, color, thickness=1):
        steps = max(abs(x1 - x0), abs(y1 - y0))
        if steps == 0:
            return
        for i in range(steps + 1):
            t = i / steps
            px = round(x0 + t * (x1 - x0))
            py = round(y0 + t * (y1 - y0))
            for dy in range(-thickness, thickness + 1):
                for dx in range(-thickness, thickness + 1):
                    nx, ny = px + dx, py + dy
                    if 0 <= nx < w and 0 <= ny < h:
                        pixels[ny][nx] = color

    cxc = w // 2
    cyc = h // 2

    bw = int(w * 0.28)
    bh = int(h * 0.36)

    # 身体
    fill_ellipse(cxc, cyc, bw, bh, body)

    # 头部
    hrad = int(w * 0.17)
    fill_ellipse(cxc, cyc - bh - int(h * 0.04), hrad, int(hrad * 1.1), body)

    # 眼睛
    eye_y = cyc - bh - int(h * 0.02)
    eye_xo = int(w * 0.07)
    eye_r = max(2, int(w * 0.035))
    fill_ellipse(cxc - eye_xo, eye_y, eye_r, eye_r, eye)
    fill_ellipse(cxc + eye_xo, eye_y, eye_r, eye_r, eye)

    # 腿
    leg_t = max(1, int(w * 0.03))
    lc = (170, 215, 145, 255)
    draw_line(cxc - bw, cyc - int(bh*0.3), cxc - int(w*0.42), cyc - int(h*0.05), lc, leg_t)
    draw_line(cxc + bw, cyc - int(bh*0.3), cxc + int(w*0.42), cyc - int(h*0.05), lc, leg_t)
    draw_line(cxc - bw, cyc + int(bh*0.2), cxc - int(w*0.42), cyc + int(h*0.38), lc, leg_t)
    draw_line(cxc + bw, cyc + int(bh*0.2), cxc + int(w*0.38), cyc + int(h*0.38), lc, leg_t)

    # 尾巴
    draw_line(cxc, cyc + bh, cxc + int(w*0.25), cyc + int(h*0.45), lc, leg_t)
    draw_line(cxc + int(w*0.25), cyc + int(h*0.45), cxc + int(w*0.35), cyc + int(h*0.38), lc, leg_t)

    # --- 编码 PNG ---
    def make_chunk(chunk_type, data):
        chunk_len = struct.pack('>I', len(data))
        chunk_data = chunk_type + data
        crc = struct.pack('>I', zlib.crc32(chunk_data) & 0xffffffff)
        return chunk_len + chunk_data + crc

    # IHDR
    ihdr_data = struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0)  # 8bit RGB... 使用 RGBA: colortype=6
    ihdr_data = struct.pack('>II', w, h) + bytes([8, 6, 0, 0, 0])  # 8-bit RGBA

    # IDAT: 每行前加滤波器字节 0
    raw_rows = b''
    for y in range(h):
        raw_rows += b'\x00'
        for x in range(w):
            raw_rows += bytes(pixels[y][x])

    compressed = zlib.compress(raw_rows, 9)

    png_data = b'\x89PNG\r\n\x1a\n'
    png_data += make_chunk(b'IHDR', ihdr_data)
    png_data += make_chunk(b'IDAT', compressed)
    png_data += make_chunk(b'IEND', b'')

    with open(filename, 'wb') as f:
        f.write(png_data)
    print(f"已生成 {os.path.basename(filename)} ({w}x{h})")

out_dir = r"c:/Users/WIN10/WorkBuddy/20260317064605"
write_png(os.path.join(out_dir, "icon-192.png"), 192)
write_png(os.path.join(out_dir, "icon-512.png"), 512)
print("图标生成完成！")
