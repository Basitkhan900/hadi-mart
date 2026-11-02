Add-Type -AssemblyName System.Drawing

$srcPath = "c:\Users\hp 840 G5\Downloads\hadi-mart\hadi-mart\public\HeroSec1.jfif"
$outPath = "c:\Users\hp 840 G5\Downloads\hadi-mart\hadi-mart\public\HeroSec1_clean.png"

$bmp = [System.Drawing.Bitmap]::FromFile($srcPath)
Write-Host "Image loaded: $($bmp.Width) x $($bmp.Height)"

# ---- LEFT BUTTON region: roughly X=20..220, Y=580..870 ----
# Sample background just to the right of where the button ends (~X=230)
# We'll do per-row color sampling from X=230..280 area to get natural blend

Write-Host "Painting over LEFT button..."
for ($y = 580; $y -le 870; $y++) {
    # Sample the color from just to the right of the button region
    $refX = 240
    $refColor = $bmp.GetPixel($refX, $y)
    # Also sample from far left (outside button)
    $refX2 = 5
    $refColor2 = $bmp.GetPixel($refX2, $y)
    # Blend: average the two reference pixels
    $r = [int](($refColor.R + $refColor2.R) / 2)
    $g = [int](($refColor.G + $refColor2.G) / 2)
    $b = [int](($refColor.B + $refColor2.B) / 2)
    $fillColor = [System.Drawing.Color]::FromArgb(255, $r, $g, $b)
    for ($x = 20; $x -le 220; $x++) {
        $bmp.SetPixel($x, $y, $fillColor)
    }
}

# ---- RIGHT BUTTON region: roughly X=2920..3120, Y=640..860 ----
Write-Host "Painting over RIGHT button..."
$imgW = $bmp.Width  # 3136
for ($y = 640; $y -le 860; $y++) {
    # Sample from just left of the button
    $refX = 2910
    $refColor = $bmp.GetPixel($refX, $y)
    # Sample from far right edge
    $refX2 = $imgW - 5
    $refColor2 = $bmp.GetPixel($refX2, $y)
    $r = [int](($refColor.R + $refColor2.R) / 2)
    $g = [int](($refColor.G + $refColor2.G) / 2)
    $b = [int](($refColor.B + $refColor2.B) / 2)
    $fillColor = [System.Drawing.Color]::FromArgb(255, $r, $g, $b)
    for ($x = 2920; $x -le 3120; $x++) {
        $bmp.SetPixel($x, $y, $fillColor)
    }
}

Write-Host "Saving clean PNG..."
$bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "Done! Saved to: $outPath"

