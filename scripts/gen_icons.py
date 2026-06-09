#!/usr/bin/env python3
"""
Generate SmartRecycle AI app icons.
Design: forest-green gradient bg · white leaf · amber scan bar + dot
"""
from PIL import Image, ImageDraw

# ── Palette ────────────────────────────────────────────────────────────────────
BG_TOP = (34,  84,  61, 255)   # #22543D  (slightly lighter top)
BG_BOT = (27,  67,  50, 255)   # #1B4332  (brand forest green)
WHITE  = (255, 255, 255, 255)
AMBER  = (240, 112,  88, 255)  # #F07058 coral
AMBER2 = (255, 160, 140, 200)  # highlight
CLEAR  = (  0,   0,   0,   0)

# ── Helpers ────────────────────────────────────────────────────────────────────
def gradient_bg(size):
    img = Image.new('RGBA', (size, size))
    d = ImageDraw.Draw(img)
    for y in range(size):
        t = y / (size - 1)
        r = round(BG_TOP[0] + t * (BG_BOT[0] - BG_TOP[0]))
        g = round(BG_TOP[1] + t * (BG_BOT[1] - BG_TOP[1]))
        b = round(BG_TOP[2] + t * (BG_BOT[2] - BG_TOP[2]))
        d.line([(0, y), (size - 1, y)], fill=(r, g, b, 255))
    return img

def qbez(p0, p1, p2, n=300):
    """Quadratic bezier curve as list of (x, y) float tuples."""
    pts = []
    for i in range(n + 1):
        t = i / n
        u = 1 - t
        pts.append((
            u*u*p0[0] + 2*u*t*p1[0] + t*t*p2[0],
            u*u*p0[1] + 2*u*t*p1[1] + t*t*p2[1],
        ))
    return pts

def leaf_polygon(cx, top_y, bot_y, half_w, bulge_frac=0.05):
    """Smooth leaf polygon (right arc down + left arc up), widest slightly below mid."""
    span  = bot_y - top_y
    mid_y = (top_y + bot_y) / 2 + bulge_frac * span
    top   = (cx, top_y)
    bot   = (cx, bot_y)
    R = qbez(top, (cx + half_w, mid_y), bot)
    L = qbez(bot, (cx - half_w, mid_y), top)
    return R + L

def x_extent_at_y(pts, target_y, tol):
    xs = [p[0] for p in pts if abs(p[1] - target_y) < tol]
    return (min(xs), max(xs)) if xs else (None, None)

# ── Main render ────────────────────────────────────────────────────────────────
def render_icon(size, pad=0, transparent=False):
    img = Image.new('RGBA', (size, size), CLEAR) if transparent else gradient_bg(size)
    d   = ImageDraw.Draw(img)

    s  = size
    cx = s / 2

    # Leaf geometry — half_w is the bezier control offset.
    # For quadratic bezier, actual max half-width ≈ half_w / 2.
    # Target: leaf ~54% of icon width (276px per side → half_w ≈ 552).
    top_y  = s * 0.155 + pad
    bot_y  = s * 0.855 - pad
    half_w = s * 0.54 - pad * 0.80   # control point offset; actual width ≈ half_w/2

    # bulge_frac = 0 → symmetric bipointed leaf (classic leaf / eye shape)
    # slight positive value lowers the widest point below center (teardrop lean)
    pts = leaf_polygon(cx, top_y, bot_y, half_w, bulge_frac=0.03)
    d.polygon([(round(x), round(y)) for x, y in pts], fill=WHITE)

    # Amber scan bar at 38% from top (near widest point)
    scan_y = top_y + 0.38 * (bot_y - top_y)
    tol    = max(6.0, s * 0.018)
    x1, x2 = x_extent_at_y(pts, scan_y, tol)
    if x1 is None:
        x1, x2 = cx - half_w * 0.35, cx + half_w * 0.35

    inset  = s * 0.024
    bar_h  = s * 0.017
    d.rectangle(
        [round(x1 + inset), round(scan_y - bar_h),
         round(x2 - inset), round(scan_y + bar_h)],
        fill=AMBER,
    )

    # Amber dot at centre of bar (smaller, cleaner)
    dot_r = s * 0.028
    d.ellipse(
        [round(cx - dot_r), round(scan_y - dot_r),
         round(cx + dot_r), round(scan_y + dot_r)],
        fill=AMBER,
    )
    # Inner highlight
    hi = dot_r * 0.38
    d.ellipse(
        [round(cx - dot_r * 0.30 - hi), round(scan_y - dot_r * 0.55 - hi),
         round(cx - dot_r * 0.30 + hi), round(scan_y - dot_r * 0.55 + hi)],
        fill=AMBER2,
    )

    return img

# ── Generate files ─────────────────────────────────────────────────────────────
import os
ASSETS = os.path.join(os.path.dirname(__file__), '..', 'assets')

# 1. Main icon (1024 × 1024, no rounding — OS handles that)
render_icon(1024).save(os.path.join(ASSETS, 'icon.png'))
print('✓ icon.png')

# 2. Android adaptive foreground — transparent bg, content in safe zone (~640 px)
render_icon(1024, pad=190, transparent=True).save(
    os.path.join(ASSETS, 'android-icon-foreground.png')
)
print('✓ android-icon-foreground.png')

# 3. Android adaptive background — solid brand gradient
gradient_bg(1024).save(os.path.join(ASSETS, 'android-icon-background.png'))
print('✓ android-icon-background.png')

# 4. Monochrome silhouette — white leaf only on transparent (no amber)
mono = Image.new('RGBA', (1024, 1024), CLEAR)
dm   = ImageDraw.Draw(mono)
pts_m = leaf_polygon(512, 1024*0.165+160, 1024*0.840-160, 1024*0.54-130, bulge_frac=-0.10)
dm.polygon([(round(x), round(y)) for x, y in pts_m], fill=WHITE)
mono.save(os.path.join(ASSETS, 'android-icon-monochrome.png'))
print('✓ android-icon-monochrome.png')

# 5. Splash icon — same design, larger leaf proportion, no padding needed
render_icon(1024).save(os.path.join(ASSETS, 'splash-icon.png'))
print('✓ splash-icon.png')

print('\nAll icons generated successfully.')
