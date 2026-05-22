Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$assets = Join-Path $root "assets"
$fontDir = Join-Path $assets "fonts"

$ink = [System.Drawing.ColorTranslator]::FromHtml("#1A1A1A")
$gold = [System.Drawing.ColorTranslator]::FromHtml("#C8A047")
$goldSoft = [System.Drawing.ColorTranslator]::FromHtml("#E0BC68")
$parchment = [System.Drawing.ColorTranslator]::FromHtml("#F4EBD0")
$cream = [System.Drawing.ColorTranslator]::FromHtml("#FAF6E9")
$sage = [System.Drawing.ColorTranslator]::FromHtml("#7A8B70")

$privateFonts = New-Object System.Drawing.Text.PrivateFontCollection
$privateFonts.AddFontFile((Join-Path $fontDir "ScheherazadeNew-Bold.ttf"))
$privateFonts.AddFontFile((Join-Path $fontDir "Amiri-Bold.ttf"))
$arabicFamily = $privateFonts.Families | Where-Object { $_.Name -like "*Scheherazade*" } | Select-Object -First 1
$latinFamily = $privateFonts.Families | Where-Object { $_.Name -like "*Amiri*" } | Select-Object -First 1
$sheenWithTatweel = [string]([char]0x0634) + [string]([char]0x0640)
$warshArabic = [string]([char]0x0648) + [string]([char]0x064E) + [string]([char]0x0631) + [string]([char]0x0652) + [string]([char]0x0634)
$middleDot = [string]([char]0x00B7)

function New-Canvas($size, [bool]$transparent = $false) {
  $bitmap = New-Object System.Drawing.Bitmap $size, $size, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  if ($transparent) {
    $graphics.Clear([System.Drawing.Color]::Transparent)
  } else {
    $graphics.Clear($parchment)
  }
  return @{ Bitmap = $bitmap; Graphics = $graphics }
}

function Draw-Motif($graphics, $size, $opacity) {
  $pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb($opacity, $sage)), 2
  $thinPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb([Math]::Max(10, $opacity - 10), $gold)), 1

  for ($y = 80; $y -lt $size; $y += 160) {
    for ($x = 80; $x -lt $size; $x += 160) {
      $graphics.DrawEllipse($pen, $x - 24, $y - 24, 48, 48)
      $graphics.DrawEllipse($thinPen, $x - 12, $y - 12, 24, 24)
      $graphics.DrawLine($thinPen, $x - 34, $y, $x - 50, $y)
      $graphics.DrawLine($thinPen, $x + 34, $y, $x + 50, $y)
      $graphics.DrawLine($thinPen, $x, $y - 34, $x, $y - 50)
      $graphics.DrawLine($thinPen, $x, $y + 34, $x, $y + 50)
    }
  }

  $pen.Dispose()
  $thinPen.Dispose()
}

function Draw-Seal($graphics, $cx, $cy, $diameter, [bool]$withBackground = $true) {
  $rect = New-Object System.Drawing.RectangleF ($cx - $diameter / 2), ($cy - $diameter / 2), $diameter, $diameter
  if ($withBackground) {
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, $cream, $parchment, 45
    $graphics.FillEllipse($brush, $rect)
    $brush.Dispose()
  }

  $border = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(185, $ink)), ($diameter * 0.012)
  $inner = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(105, $goldSoft)), ($diameter * 0.018)
  $graphics.DrawEllipse($border, $rect)
  $inset = $diameter * 0.08
  $graphics.DrawEllipse($inner, ($rect.X + $inset), ($rect.Y + $inset), ($rect.Width - 2 * $inset), ($rect.Height - 2 * $inset))
  $border.Dispose()
  $inner.Dispose()
}

function Draw-CenteredText($graphics, $text, $font, $brush, $cx, $cy, $format = $null) {
  if ($null -eq $format) {
    $format = New-Object System.Drawing.StringFormat
    $format.Alignment = [System.Drawing.StringAlignment]::Center
    $format.LineAlignment = [System.Drawing.StringAlignment]::Center
  }
  $layout = New-Object System.Drawing.RectangleF 0, 0, 2000, 600
  $size = $graphics.MeasureString($text, $font, [System.Drawing.SizeF]::new(2000, 600), $format)
  $rect = New-Object System.Drawing.RectangleF ($cx - $size.Width / 2), ($cy - $size.Height / 2), $size.Width, $size.Height
  $graphics.DrawString($text, $font, $brush, $rect, $format)
}

function Save-Png($bitmap, $path) {
  $bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
}

function Save-ScaledPng($sourcePath, $targetPath, $width, $height) {
  $source = [System.Drawing.Image]::FromFile($sourcePath)
  $bitmap = New-Object System.Drawing.Bitmap $width, $height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.Clear([System.Drawing.Color]::Transparent)
  $graphics.DrawImage($source, 0, 0, $width, $height)
  Save-Png $bitmap $targetPath
  $graphics.Dispose()
  $bitmap.Dispose()
  $source.Dispose()
}

# App icon: full parchment field with subtle motif and centered Warsh seal.
$icon = New-Canvas 1024 $false
Draw-Motif $icon.Graphics 1024 30
Draw-Seal $icon.Graphics 512 512 760 $true
$markFont = New-Object System.Drawing.Font $arabicFamily, 430, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
$goldBrush = New-Object System.Drawing.SolidBrush $gold
Draw-CenteredText $icon.Graphics $sheenWithTatweel $markFont $goldBrush 512 485
Save-Png $icon.Bitmap (Join-Path $assets "icon.png")
$icon.Graphics.Dispose()
$icon.Bitmap.Dispose()

# Adaptive foreground: transparent safe-zone mark over Android's parchment background.
$adaptive = New-Canvas 1024 $true
Draw-Seal $adaptive.Graphics 512 512 640 $true
$adaptiveMarkFont = New-Object System.Drawing.Font $arabicFamily, 350, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
Draw-CenteredText $adaptive.Graphics $sheenWithTatweel $adaptiveMarkFont $goldBrush 512 488
Save-Png $adaptive.Bitmap (Join-Path $assets "adaptive-icon.png")
$adaptive.Graphics.Dispose()
$adaptive.Bitmap.Dispose()

# Splash image: centered lockup on the same parchment field Expo uses behind it.
$splash = New-Canvas 1200 $false
Draw-Motif $splash.Graphics 1200 16
$sealPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(35, $gold)), 5
$splash.Graphics.DrawEllipse($sealPen, 350, 260, 500, 500)
$splash.Graphics.DrawEllipse($sealPen, 405, 315, 390, 390)
$sealPen.Dispose()

$warshBrush = New-Object System.Drawing.SolidBrush $ink
$dotBrush = New-Object System.Drawing.SolidBrush $sage
$latinFont = New-Object System.Drawing.Font $latinFamily, 118, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
$dotFont = New-Object System.Drawing.Font $latinFamily, 76, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
$arabicFont = New-Object System.Drawing.Font $arabicFamily, 132, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
$captionFont = New-Object System.Drawing.Font $latinFamily, 46, ([System.Drawing.FontStyle]::Regular), ([System.Drawing.GraphicsUnit]::Pixel)

Draw-CenteredText $splash.Graphics "Warsh" $latinFont $warshBrush 405 540
Draw-CenteredText $splash.Graphics $middleDot $dotFont $dotBrush 598 548
Draw-CenteredText $splash.Graphics $warshArabic $arabicFont $goldBrush 790 525
Draw-CenteredText $splash.Graphics "Where Arabic is crafted." $captionFont $dotBrush 600 705

Save-Png $splash.Bitmap (Join-Path $assets "splash.png")
$splash.Graphics.Dispose()
$splash.Bitmap.Dispose()

$resDir = Join-Path $root "android\app\src\main\res"
$iconPath = Join-Path $assets "icon.png"
$splashPath = Join-Path $assets "splash.png"
$mipmapSizes = @{
  "mipmap-mdpi" = 48
  "mipmap-hdpi" = 72
  "mipmap-xhdpi" = 96
  "mipmap-xxhdpi" = 144
  "mipmap-xxxhdpi" = 192
}

foreach ($entry in $mipmapSizes.GetEnumerator()) {
  $dir = Join-Path $resDir $entry.Key
  Save-ScaledPng $iconPath (Join-Path $dir "ic_launcher.png") $entry.Value $entry.Value
  Save-ScaledPng $iconPath (Join-Path $dir "ic_launcher_round.png") $entry.Value $entry.Value
}

Save-ScaledPng $splashPath (Join-Path $resDir "drawable\splashscreen_image.png") 900 900

$goldBrush.Dispose()
$warshBrush.Dispose()
$dotBrush.Dispose()
$markFont.Dispose()
$adaptiveMarkFont.Dispose()
$latinFont.Dispose()
$dotFont.Dispose()
$arabicFont.Dispose()
$captionFont.Dispose()
$privateFonts.Dispose()
