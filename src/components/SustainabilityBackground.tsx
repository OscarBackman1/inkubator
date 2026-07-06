import type { CSSProperties } from "react";

type GrassLayer = {
  count: number;
  bottom: number;
  durationBase: number;
  heightMax: number;
  heightMin: number;
  opacityBase: number;
  offset: number;
  widthMax: number;
  widthMin: number;
};

const grassLayers: GrassLayer[] = [
  { count: 30, bottom: -18, durationBase: 8.8, heightMin: 56, heightMax: 104, opacityBase: 0.16, offset: 0.4, widthMin: 5, widthMax: 8 },
  { count: 34, bottom: -14, durationBase: 7.8, heightMin: 76, heightMax: 138, opacityBase: 0.24, offset: 1.2, widthMin: 6, widthMax: 10 },
  { count: 38, bottom: -20, durationBase: 7.1, heightMin: 94, heightMax: 166, opacityBase: 0.34, offset: 0, widthMin: 7, widthMax: 12 }
];

const grassBlades = grassLayers.flatMap((layer, layerIndex) =>
  Array.from({ length: layer.count }, (_, index) => {
    const spread = 100 / (layer.count - 1);
    const jitter = (((index * 17 + layerIndex * 11) % 9) - 4) * 0.32;
    const left = Math.min(99.2, Math.max(0.2, index * spread + layer.offset + jitter));
    const heightRange = layer.heightMax - layer.heightMin;
    const widthRange = layer.widthMax - layer.widthMin;
    const height = layer.heightMin + ((index * 23 + layerIndex * 19) % heightRange);
    const width = layer.widthMin + ((index * 7 + layerIndex * 3) % widthRange);
    const rotate = ((index * 13 + layerIndex * 9) % 15) - 7;
    const delay = -(((index * 0.41 + layerIndex * 1.35) % 10.2));
    const duration = layer.durationBase + ((index * 0.23 + layerIndex * 0.9) % 2.6);

    return {
      bottom: `${layer.bottom}px`,
      delay: `${delay.toFixed(2)}s`,
      duration: `${duration.toFixed(2)}s`,
      height: `${height}px`,
      key: `${layerIndex}-${index}`,
      left: `${left.toFixed(2)}%`,
      opacity: layer.opacityBase + ((index % 4) * 0.025),
      rotate: `${rotate}deg`,
      width: `${width}px`
    };
  })
);

function WindLayer() {
  return (
    <svg
      className="wind-layer absolute inset-x-[-12%] bottom-[11vh] h-[28vh] min-h-[210px] sm:bottom-[14vh] sm:h-[29vh] lg:bottom-[16vh]"
      viewBox="0 0 1200 280"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="wind-edge-fade" x1="0%" x2="100%" y1="0%" y2="0%">
          <stop offset="0%" stopColor="black" />
          <stop offset="12%" stopColor="white" />
          <stop offset="88%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </linearGradient>
        <mask id="wind-fade-mask">
          <rect width="1200" height="280" fill="url(#wind-edge-fade)" />
        </mask>
      </defs>
      <g mask="url(#wind-fade-mask)">
        <path
          className="wind-current wind-current-1"
          d="M-90 78 C 110 34 260 111 430 68 C 610 24 750 91 930 60 C 1070 36 1170 52 1290 84"
        />
        <path
          className="wind-current wind-current-2"
          d="M-70 142 C 95 105 250 152 405 122 C 570 90 720 142 890 118 C 1030 98 1160 112 1280 138"
        />
        <path
          className="wind-current wind-current-3"
          d="M-120 196 C 80 166 235 210 410 182 C 580 156 740 192 930 170 C 1080 152 1180 168 1320 190"
        />
        <path
          className="wind-current wind-current-4"
          d="M-80 238 C 110 214 280 244 445 222 C 625 198 790 232 950 216 C 1095 202 1190 216 1300 232"
        />
      </g>
    </svg>
  );
}

export function SustainabilityBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#fbfaf6_0%,#f8f7f3_58%,#eef2e8_100%)]" />
      <div className="absolute left-0 right-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.7),rgba(255,255,255,0))]" />
      <div className="sustainability-landscape absolute inset-x-0 bottom-0 h-[19vh] min-h-[145px] sm:h-[24vh] lg:h-[27vh]">
        <div className="absolute inset-x-0 bottom-0 h-full bg-[linear-gradient(180deg,rgba(232,239,223,0)_0%,rgba(222,234,211,0.82)_34%,rgba(194,216,184,0.94)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-[74%] bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(31,95,74,0.08)_100%)]" />
        <div className="grass-field absolute inset-x-0 bottom-0 h-[72%]">
          {grassBlades.map((blade, index) => (
            <span
              key={blade.key}
              className="grass-blade absolute block"
              style={
                {
                  "--blade-bottom": blade.bottom,
                  "--blade-left": blade.left,
                  "--blade-height": blade.height,
                  "--blade-width": blade.width,
                  "--blade-delay": blade.delay,
                  "--blade-duration": blade.duration,
                  "--blade-opacity": blade.opacity,
                  "--blade-rotate": blade.rotate
                } as CSSProperties
              }
            />
          ))}
        </div>
        <div className="absolute inset-x-0 top-0 h-20 bg-[linear-gradient(180deg,#f8f7f3_0%,rgba(248,247,243,0)_100%)]" />
      </div>
      <WindLayer />
    </div>
  );
}
