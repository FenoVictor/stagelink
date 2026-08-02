<?php
/**
 * Génère les favicons PNG et l'OG image pour StageLink.
 * Usage: php generate-assets.php
 */

$publicDir = __DIR__;

// === Favicon SVG ===
$svgContent = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
  <rect width="32" height="32" rx="8" fill="#0369A1"/>
  <path d="M16 8L24 14V24H8V14L16 8Z" fill="white" opacity="0.9"/>
  <path d="M16 12L20 15V20H12V15L16 12Z" fill="#0EA5E9"/>
</svg>';

file_put_contents("$publicDir/favicon.svg", $svgContent);
echo "favicon.svg OK\n";

// === Favicons PNG via GD ===
function createFaviconPng(int $size, string $path): void {
    $img = imagecreatetruecolor($size, $size);
    imagesavealpha($img, true);
    $transparent = imagecolorallocatealpha($img, 0, 0, 0, 127);
    imagefill($img, 0, 0, $transparent);

    // Fond bleu arrondi
    $blue = imagecolorallocate($img, 3, 105, 161); // #0369A1
    $white = imagecolorallocate($img, 255, 255, 255);
    $lightBlue = imagecolorallocate($img, 14, 165, 233); // #0EA5E9

    // Fond arrondi
    $r = (int)($size * 0.25);
    imagefilledrectangle($img, $r, 0, $size - $r, $size, $blue);
    imagefilledrectangle($img, 0, $r, $size, $size - $r, $blue);
    imagefilledellipse($img, $r, $r, $r * 2, $r * 2, $blue);
    imagefilledellipse($img, $size - $r, $r, $r * 2, $r * 2, $blue);
    imagefilledellipse($img, $r, $size - $r, $r * 2, $r * 2, $blue);
    imagefilledellipse($img, $size - $r, $size - $r, $r * 2, $r * 2, $blue);

    // Triangle maison (simplifié)
    $cx = $size / 2;
    $topY = $size * 0.25;
    $botY = $size * 0.75;
    $leftX = $size * 0.25;
    $rightX = $size * 0.75;
    $midTopY = $size * 0.38;

    $pts = [(int)$cx, (int)$topY, (int)$rightX, (int)$midTopY, (int)$rightX, (int)$botY, (int)$leftX, (int)$botY, (int)$leftX, (int)$midTopY];
    imagefilledpolygon($img, $pts, imagecolorallocatealpha($img, 255, 255, 255, 20));

    // Carré intérieur
    $insetL = (int)($size * 0.35);
    $insetR = (int)($size * 0.65);
    $insetT = (int)($size * 0.45);
    $insetB = (int)($size * 0.65);
    imagefilledrectangle($img, $insetL, $insetT, $insetR, $insetB, $lightBlue);

    imagepng($img, $path);
    imagedestroy($img);
}

createFaviconPng(16, "$publicDir/favicon-16x16.png");
echo "favicon-16x16.png OK\n";
createFaviconPng(32, "$publicDir/favicon-32x32.png");
echo "favicon-32x32.png OK\n";
createFaviconPng(180, "$publicDir/apple-touch-icon.png");
echo "apple-touch-icon.png OK\n";
createFaviconPng(192, "$publicDir/icon-192.png");
echo "icon-192.png OK\n";
createFaviconPng(512, "$publicDir/icon-512.png");
echo "icon-512.png OK\n";
createFaviconPng(512, "$publicDir/icon-maskable.png");
echo "icon-maskable.png OK\n";

// === OG Image (1200x630) ===
$ogW = 1200;
$ogH = 630;
$img = imagecreatetruecolor($ogW, $ogH);

// Fond gradient approximatif (top: #0c4a6e → bottom: #0369A1)
for ($y = 0; $y < $ogH; $y++) {
    $ratio = $y / $ogH;
    $r = (int)(12 + $ratio * (3 - 12));
    $g = (int)(74 + $ratio * (105 - 74));
    $b = (int)(110 + $ratio * (161 - 110));
    $color = imagecolorallocate($img, $r, $g, $b);
    imageline($img, 0, $y, $ogW, $y, $color);
}

// Zone blanche centrale
$white = imagecolorallocate($img, 255, 255, 255);
$padX = 120;
$padY = 80;
imagefilledrectangle($img, $padX, $padY, $ogW - $padX, $ogH - $padY, $white);

// Ombre douce
for ($i = 0; $i < 8; $i++) {
    $shadow = imagecolorallocatealpha($img, 0, 0, 0, 120 - $i * 15);
    imagerectangle($img, $padX + $i, $padY + $i, $ogW - $padX + $i, $ogH - $padY + $i, $shadow);
}
imagefilledrectangle($img, $padX, $padY, $ogW - $padX, $ogH - $padY, $white);

// Logo dans la zone blanche
$logoSize = 80;
$logoX = ($ogW - $logoSize) / 2;
$logoY = 130;

// Fond logo bleu
$blue = imagecolorallocate($img, 3, 105, 161);
$lr = 16;
$lx = (int)$logoX;
$ly = (int)$logoY;
imagefilledrectangle($img, $lx + $lr, $ly, $lx + $logoSize - $lr, $ly + $logoSize, $blue);
imagefilledrectangle($img, $lx, $ly + $lr, $lx + $logoSize, $ly + $logoSize - $lr, $blue);
imagefilledellipse($img, $lx + $lr, $ly + $lr, $lr * 2, $lr * 2, $blue);
imagefilledellipse($img, $lx + $logoSize - $lr, $ly + $lr, $lr * 2, $lr * 2, $blue);
imagefilledellipse($img, $lx + $lr, $ly + $logoSize - $lr, $lr * 2, $lr * 2, $blue);
imagefilledellipse($img, $lx + $logoSize - $lr, $ly + $logoSize - $lr, $lr * 2, $lr * 2, $blue);

// Texte titre
$dark = imagecolorallocate($img, 30, 41, 59); // #1e293b
$gray = imagecolorallocate($img, 100, 116, 139); // #64748b
$primaryText = imagecolorallocate($img, 3, 105, 161);

// Charger une police par défaut (GD built-in)
$fontLarge = 5; // gd built-in large
$fontMedium = 4;

$title = "StageLink";
$subtitle = "Trouvez votre stage a Madagascar";
$desc = "Connectez-vous aux entreprises. Postulez en ligne.";

// Centrer le titre
$titleW = imagefontwidth($fontLarge) * strlen($title);
$titleX = ($ogW - $titleW) / 2;
imagestring($img, $fontLarge, (int)$titleX, 260, $title, $primaryText);

// Centrer le sous-titre
$subW = imagefontwidth($fontMedium) * strlen($subtitle);
$subX = ($ogW - $subW) / 2;
imagestring($img, $fontMedium, (int)$subX, 310, $subtitle, $dark);

// Centrer la description
$descW = imagefontwidth($fontMedium) * strlen($desc);
$descX = ($ogW - $descW) / 2;
imagestring($img, $fontMedium, (int)$descX, 360, $desc, $gray);

// URL en bas
$url = "stagelink-ten.vercel.app";
$urlW = imagefontwidth($fontMedium) * strlen($url);
$urlX = ($ogW - $urlW) / 2;
imagestring($img, $fontMedium, (int)$urlX, 440, $url, $gray);

imagepng($img, "$publicDir/og-image.png");
imagedestroy($img);
echo "og-image.png OK\n";

echo "\n=== Tous les assets SEO générés ===\n";
