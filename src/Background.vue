<script setup lang="ts">
// Vous pouvez ajouter votre logique TypeScript ici
</script>

<template>
</template>

<style>
/* Suppression de "scoped" car les styles affectent html/body globalement */

/* =========================================================
   Scanlines CSS + Outrun background
   Author: you
   Version: 1.1
   ========================================================= */

:root {
  /* Couleurs */
  --c1: hsl(219, 79%, 66%);
  --c2: hsl(319, 100%, 60%);
  --c3: hsl(266, 49%, 25%);
  --c4: hsl(60, 82%, 58%);
  --c5: hsl(0, 67%, 55%);
  --c6: hsl(213, 96%, 11%);
  --c2hsl: 319, 100%, 60%;

  /* Variables scanlines */
  --scan-width: 2px;
  --scan-color: rgba(0, 0, 0, 0.35);
  --scan-opacity: 0.8;
  --scan-fps: 60;
  --scan-z-index: 9999;
}

/* @property pour l'animation outrun */
@property --outrun {
  syntax: "<number>";
  initial-value: 0;
  inherits: false;
}

/* Animations */
@keyframes scanline-move {
  0%   { transform: translate3d(0, 500vh, 0); }
  100% { transform: translate3d(0, -500vh, 0); }
}

@keyframes scanlines-flicker {
  0%   { background-position: 100%; }
  100% { background-position: 0 80%; }
}

@keyframes outrun {
  to { --outrun: 1; }
}

/* Application GLOBALE */
html, body {
  height: 100%;
}

body {
  position: relative;
}

/* Barre mobile (highlight) */
body::before {
  content: "";
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  height: var(--scan-width);
  background: var(--scan-color);
  opacity: var(--scan-opacity);
  animation: scanline-move 6s linear infinite;
  z-index: calc(var(--scan-z-index) + 1);
  pointer-events: none;
  will-change: transform;
}

/* Trame statique (lignes) */
body::after {
  content: "";
  position: fixed;
  inset: 0;
  z-index: var(--scan-z-index);
  background: linear-gradient(to bottom, transparent 50%, var(--scan-color) 51%);
  background-size: 100% calc(var(--scan-width) * 2);
  animation: scanlines-flicker 1s steps(var(--scan-fps)) infinite;
  pointer-events: none;
  will-change: background-position;
}

/* Accessibilité */
@media (prefers-reduced-motion: reduce) {
  body::before,
  body::after {
    animation: none !important;
  }
}

/* Schéma sombre/clair auto */
@media (prefers-color-scheme: light) {
  :root {
    --scan-color: rgba(0, 0, 0, 0.35);
  }
}

/* Fallback for browsers without @property */
@supports not (background: paint(something)) {
  :root {
    --outrun: 0;
  }
}

/* ---------- Outrun background ---------- */
html {
  height: 100vh;
}

html::before {
  --mtn2: url(img/bas-montagne.png);
  --mtn: url(img/montagne.png);

  content: "";
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100vh;
  z-index: -1;
  pointer-events: none;
  filter: brightness(1.125);
  animation: outrun 0.6s linear infinite;

  --lgDepth: url("data:image/svg+xml;utf8,<svg width='1808' height='230' xmlns='http://www.w3.org/2000/svg'><path d='M904 -46 L-3616 230 M904 -46 L-3254.4 230 M904 -46 L-2892.8 230 M904 -46 L-2531.2000000000003 230 M904 -46 L-2169.6000000000004 230 M904 -46 L-1808 230 M904 -46 L-1446.4 230 M904 -46 L-1084.8000000000002 230 M904 -46 L-723.2 230 M904 -46 L-361.6 230 M904 -46 L0 230 M904 -46 L361.6 230 M904 -46 L723.2 230 M904 -46 L1084.8000000000002 230 M904 -46 L1446.4 230 M904 -46 L1808 230 M904 -46 L2169.6000000000004 230 M904 -46 L2531.2000000000003 230 M904 -46 L2892.8 230 M904 -46 L3254.4 230 M904 -46 L3616 230 M904 -46 L3977.6000000000004 230 M904 -46 L4339.200000000001 230 M904 -46 L4700.8 230 M904 -46 L5062.400000000001 230 M904 -46 L5424 230' stroke='cornflowerblue' stroke-width='2' vector-effect='non-scaling-stroke'/></svg>")
    left bottom / 100% 40% no-repeat;

  --outrun: 0;
  --pos: var(--outrun, 0);
  --distance: 0.5%;
  --hor: 60%;

  /* precomputed lines */
  --l0: calc(var(--hor) + 0 * 0 * var(--distance) + (((0 + 1) * (0 + 1) * var(--distance) - 0 * 0 * var(--distance)) * var(--pos)));
  --l1: calc(var(--hor) + 1 * 1 * var(--distance) + (((1 + 1) * (1 + 1) * var(--distance) - 1 * 1 * var(--distance)) * var(--pos)));
  --l2: calc(var(--hor) + 2 * 2 * var(--distance) + (((2 + 1) * (2 + 1) * var(--distance) - 2 * 2 * var(--distance)) * var(--pos)));
  --l3: calc(var(--hor) + 3 * 3 * var(--distance) + (((3 + 1) * (3 + 1) * var(--distance) - 3 * 3 * var(--distance)) * var(--pos)));
  --l4: calc(var(--hor) + 4 * 4 * var(--distance) + (((4 + 1) * (4 + 1) * var(--distance) - 4 * 4 * var(--distance)) * var(--pos)));
  --l5: calc(var(--hor) + 5 * 5 * var(--distance) + (((5 + 1) * (5 + 1) * var(--distance) - 5 * 5 * var(--distance)) * var(--pos)));
  --l6: calc(var(--hor) + 6 * 6 * var(--distance) + (((6 + 1) * (6 + 1) * var(--distance) - 6 * 6 * var(--distance)) * var(--pos)));
  --l7: calc(var(--hor) + 7 * 7 * var(--distance) + (((7 + 1) * (7 + 1) * var(--distance) - 7 * 7 * var(--distance)) * var(--pos)));
  --l8: calc(var(--hor) + 8 * 8 * var(--distance) + (((8 + 1) * (8 + 1) * var(--distance) - 8 * 8 * var(--distance)) * var(--pos)));
  --l9: calc(var(--hor) + 9 * 9 * var(--distance) + (((9 + 1) * (9 + 1) * var(--distance) - 9 * 9 * var(--distance)) * var(--pos)));

  --lgh: linear-gradient(transparent 0 var(--hor), var(--c1) var(--hor) calc(var(--hor) + 2px), transparent calc(var(--hor) + 2px));
  --lg0: linear-gradient(transparent 0 var(--l0), var(--c1) var(--l0) calc(var(--l0) + 2px), transparent calc(var(--l0) + 2px));
  --lg1: linear-gradient(transparent 0 var(--l1), var(--c1) var(--l1) calc(var(--l1) + 2px), transparent calc(var(--l1) + 2px));
  --lg2: linear-gradient(transparent 0 var(--l2), var(--c1) var(--l2) calc(var(--l2) + 2px), transparent calc(var(--l2) + 2px));
  --lg3: linear-gradient(transparent 0 var(--l3), var(--c1) var(--l3) calc(var(--l3) + 2px), transparent calc(var(--l3) + 2px));
  --lg4: linear-gradient(transparent 0 var(--l4), var(--c1) var(--l4) calc(var(--l4) + 2px), transparent calc(var(--l4) + 2px));
  --lg5: linear-gradient(transparent 0 var(--l5), var(--c1) var(--l5) calc(var(--l5) + 2px), transparent calc(var(--l5) + 2px));
  --lg6: linear-gradient(transparent 0 var(--l6), var(--c1) var(--l6) calc(var(--l6) + 2px), transparent calc(var(--l6) + 2px));
  --lg7: linear-gradient(transparent 0 var(--l7), var(--c1) var(--l7) calc(var(--l7) + 2px), transparent calc(var(--l7) + 2px));
  --lg8: linear-gradient(transparent 0 var(--l8), var(--c1) var(--l8) calc(var(--l8) + 2px), transparent calc(var(--l8) + 2px));
  --lg9: linear-gradient(transparent 0 var(--l9), var(--c1) var(--l9) calc(var(--l9) + 2px), transparent calc(var(--l9) + 2px));

  background:
    var(--lgDepth),
    var(--lgh),
    var(--lg0),
    var(--lg1),
    var(--lg2),
    var(--lg3),
    var(--lg4),
    var(--lg5),
    var(--lg6),
    var(--lg7),
    var(--lg8),
    var(--lg9),
    var(--mtn) center 60% / min(75vh, 75vw) no-repeat,
    var(--mtn2) center 60% / min(75vh, 75vw) repeat-x,
    linear-gradient(transparent 20%, var(--c5) 60%, var(--c3) 60% 70%, hsla(var(--c2hsl), 0.75), transparent 150%),
    radial-gradient(circle at center, transparent min(45vh, 45vw), hsla(var(--c2hsl), 0.75) min(65vh, 65vw), var(--c3) 120%),
    radial-gradient(circle at center, var(--c4) min(45vh, 45vw), transparent min(45vh, 45vw)),
    linear-gradient(var(--c5) 60%, var(--c3) 60%, var(--c2) 150%);
}
</style>
