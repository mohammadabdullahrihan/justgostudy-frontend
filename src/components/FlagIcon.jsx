const FlagIcon = ({ languageId, className = 'w-full h-full', ...props }) => {
  const normalizedId = languageId?.toLowerCase() || '';

  // Return standard SVGs clipped in a mask for consistent round/square presentation
  switch (normalizedId) {
    case 'uk':
    case 'gb':
    case 'united kingdom':
    case 'british':
    case 'english':
      return (
        <svg viewBox="0 0 512 512" className={className} {...props}>
          <mask id="circle-mask-en">
            <circle cx="256" cy="256" r="256" fill="white" />
          </mask>
          <g mask="url(#circle-mask-en)">
            {/* Blue background */}
            <rect width="512" height="512" fill="#012169" />
            {/* White saltire */}
            <path d="M0 0 L512 512 M512 0 L0 512" stroke="#ffffff" strokeWidth="60" />
            {/* Red saltire */}
            <path d="M0 0 L512 512" stroke="#c8102e" strokeWidth="36" />
            <path d="M512 0 L0 512" stroke="#c8102e" strokeWidth="36" />
            {/* White cross */}
            <path d="M256 0 V512 M0 256 H512" stroke="#ffffff" strokeWidth="100" />
            {/* Red cross */}
            <path d="M256 0 V512 M0 256 H512" stroke="#c8102e" strokeWidth="60" />
          </g>
        </svg>
      );

    case 'spanish':
    case 'es':
    case 'spain':
      return (
        <svg viewBox="0 0 512 512" className={className} {...props}>
          <mask id="circle-mask-es">
            <circle cx="256" cy="256" r="256" fill="white" />
          </mask>
          <g mask="url(#circle-mask-es)">
            {/* Red top band */}
            <rect width="512" height="128" fill="#c8102e" />
            {/* Yellow middle band */}
            <rect y="128" width="512" height="256" fill="#ffc400" />
            {/* Red bottom band */}
            <rect y="384" width="512" height="128" fill="#c8102e" />
            {/* Simplified coat of arms */}
            <g transform="translate(120, 200)">
              <rect x="0" y="0" width="50" height="70" rx="10" fill="#c8102e" stroke="#ffffff" strokeWidth="8" />
              <rect x="15" y="10" width="20" height="50" fill="#ffc400" />
              <circle cx="25" cy="-15" r="18" fill="none" stroke="#c8102e" strokeWidth="10" />
              <path d="M5 -15 L45 -15" stroke="#c8102e" strokeWidth="8" />
            </g>
          </g>
        </svg>
      );

    case 'french':
    case 'fr':
    case 'france':
      return (
        <svg viewBox="0 0 512 512" className={className} {...props}>
          <mask id="circle-mask-fr">
            <circle cx="256" cy="256" r="256" fill="white" />
          </mask>
          <g mask="url(#circle-mask-fr)">
            <rect width="170.6" height="512" fill="#00209f" />
            <rect x="170.6" width="170.6" height="512" fill="#ffffff" />
            <rect x="341.2" width="170.8" height="512" fill="#e1000f" />
          </g>
        </svg>
      );

    case 'german':
    case 'de':
    case 'deutsch':
    case 'germany':
      return (
        <svg viewBox="0 0 512 512" className={className} {...props}>
          <mask id="circle-mask-de">
            <circle cx="256" cy="256" r="256" fill="white" />
          </mask>
          <g mask="url(#circle-mask-de)">
            <rect width="512" height="170.6" fill="#000000" />
            <rect y="170.6" width="512" height="170.6" fill="#dd0000" />
            <rect y="341.2" width="512" height="170.8" fill="#ffce00" />
          </g>
        </svg>
      );

    case 'greece':
    case 'gr':
      return (
        <svg viewBox="0 0 512 512" className={className} {...props}>
          <mask id="circle-mask-gr">
            <circle cx="256" cy="256" r="256" fill="white" />
          </mask>
          <g mask="url(#circle-mask-gr)">
            {/* 9 alternating blue/white stripes */}
            <rect width="512" height="512" fill="#0d5eaf" />
            <g fill="#ffffff">
              {[...Array(4)].map((_, i) => (
                <rect key={i} y={(i * 2 + 1) * (512 / 9)} width="512" height={512 / 9} />
              ))}
            </g>
            {/* White canton with blue cross */}
            <rect width="228" height="228" fill="#0d5eaf" />
            <rect x="86" width="56" height="228" fill="#ffffff" />
            <rect y="86" width="228" height="56" fill="#ffffff" />
          </g>
        </svg>
      );

    case 'ireland':
    case 'ie':
    case 'irish':
    case 'republic of ireland':
      return (
        <svg viewBox="0 0 512 512" className={className} {...props}>
          <mask id="circle-mask-ie">
            <circle cx="256" cy="256" r="256" fill="white" />
          </mask>
          <g mask="url(#circle-mask-ie)">
            {/* Green vertical stripe */}
            <rect width="170.6" height="512" fill="#009639" />
            {/* White vertical stripe */}
            <rect x="170.6" width="170.6" height="512" fill="#ffffff" />
            {/* Orange vertical stripe */}
            <rect x="341.2" width="170.8" height="512" fill="#ff7900" />
          </g>
        </svg>
      );

    case 'japanese':
    case 'jp':
    case 'japan':
      return (
        <svg viewBox="0 0 512 512" className={className} {...props}>
          <mask id="circle-mask-jp">
            <circle cx="256" cy="256" r="256" fill="white" />
          </mask>
          <g mask="url(#circle-mask-jp)">
            <rect width="512" height="512" fill="#ffffff" />
            <circle cx="256" cy="256" r="130" fill="#bc002d" />
          </g>
        </svg>
      );

    case 'usa':
    case 'us':
    case 'united states':
    case 'united states of america':
      return (
        <svg viewBox="0 0 512 512" className={className} {...props}>
          <mask id="circle-mask-us">
            <circle cx="256" cy="256" r="256" fill="white" />
          </mask>
          <g mask="url(#circle-mask-us)">
            {/* 13 Stripes */}
            <rect width="512" height="512" fill="#ffffff" />
            <g fill="#b22234">
              {[...Array(7)].map((_, i) => (
                <rect key={i} y={i * (512 / 6.5)} width="512" height={512 / 13} />
              ))}
            </g>
            {/* Blue Canton */}
            <rect width="204.8" height="275.7" fill="#3c3b6e" />
            {/* Simplified stars (dots) */}
            <g fill="#ffffff">
              {[...Array(5)].map((_, r) => (
                [...Array(6)].map((_, c) => (
                  <circle key={`${r}-${c}`} cx={20 + c * 33} cy={25 + r * 55} r="5" />
                ))
              ))}
            </g>
          </g>
        </svg>
      );

    case 'canada':
    case 'ca':
      return (
        <svg viewBox="0 0 512 512" className={className} {...props}>
          <mask id="circle-mask-ca">
            <circle cx="256" cy="256" r="256" fill="white" />
          </mask>
          <g mask="url(#circle-mask-ca)">
            <rect width="128" height="512" fill="#ff0000" />
            <rect x="128" width="256" height="512" fill="#ffffff" />
            <rect x="384" width="128" height="512" fill="#ff0000" />
            {/* Simplified Maple Leaf */}
            <path d="M256 160 L276 210 L326 210 L286 245 L306 295 L256 265 L206 295 L226 245 L186 210 L236 210 Z" fill="#ff0000" />
            <rect x="246" y="260" width="20" height="60" fill="#ff0000" />
          </g>
        </svg>
      );

    case 'australia':
    case 'au':
    case 'aus':
      return (
        <svg viewBox="0 0 512 512" className={className} {...props}>
          <mask id="circle-mask-au">
            <circle cx="256" cy="256" r="256" fill="white" />
          </mask>
          <g mask="url(#circle-mask-au)">
            <rect width="512" height="512" fill="#00008b" />
            {/* Simplified Union Jack in canton */}
            <g transform="scale(0.5)">
              <rect width="512" height="512" fill="#012169" />
              <path d="M0 0 L512 512 M512 0 L0 512" stroke="#ffffff" strokeWidth="60" />
              <path d="M0 0 L512 512 M512 0 L0 512" stroke="#c8102e" strokeWidth="36" />
              <path d="M256 0 V512 M0 256 H512" stroke="#ffffff" strokeWidth="100" />
              <path d="M256 0 V512 M0 256 H512" stroke="#c8102e" strokeWidth="60" />
            </g>
            {/* Simplified stars */}
            <g fill="#ffffff">
              <polygon points="384,100 394,130 424,130 400,150 410,180 384,160 358,180 368,150 344,130 374,130" />
              <polygon points="384,380 394,410 424,410 400,430 410,460 384,440 358,460 368,430 344,410 374,410" />
              <polygon points="128,380 138,410 168,410 144,430 154,460 128,440 102,460 112,430 88,410 118,410" />
              <polygon points="460,256 470,286 500,286 476,306 486,336 460,316 434,336 444,306 420,286 450,286" />
            </g>
          </g>
        </svg>
      );

    case 'korean':
    case 'kr':
    case 'south korea':
      return (
        <svg viewBox="0 0 512 512" className={className} {...props}>
          <mask id="circle-mask-kr">
            <circle cx="256" cy="256" r="256" fill="white" />
          </mask>
          <g mask="url(#circle-mask-kr)">
            {/* White background */}
            <rect width="512" height="512" fill="#ffffff" />

            {/* Taegeuk in center */}
            <path d="M256 156 A 100 100 0 0 1 256 356 A 50 50 0 0 1 256 256 A 50 50 0 0 0 256 156 Z" fill="#cd2e3a" />
            <path d="M256 356 A 100 100 0 0 1 256 156 A 50 50 0 0 0 256 256 A 50 50 0 0 1 256 356 Z" fill="#0047a0" />

            {/* Trigrams in corners */}
            <g stroke="#000000" strokeWidth="14" fill="none" strokeLinecap="round">
              {/* Geon (Top-Left) */}
              <path d="M140 180 L180 140 M130 170 L170 130 M120 160 L160 120" />
              {/* Gam (Top-Right) */}
              <path d="M372 180 L332 140 M362 170 L342 150 M382 170 L362 190 M352 160 L312 120" />
              {/* Ri (Bottom-Left) */}
              <path d="M140 332 L180 372 M120 352 L140 372 M160 332 L180 352 M120 372 L160 412" />
              {/* Gon (Bottom-Right) */}
              <path d="M372 332 L352 352 M342 362 L332 372 M382 342 L362 362 M352 372 L332 392 M392 352 L372 372 M362 382 L342 402" />
            </g>
          </g>
        </svg>
      );

    case 'singapore':
    case 'sg':
      return (
        <svg viewBox="0 0 512 512" className={className} {...props}>
          <mask id="circle-mask-sg">
            <circle cx="256" cy="256" r="256" fill="white" />
          </mask>
          <g mask="url(#circle-mask-sg)">
            <rect width="512" height="256" fill="#ed2939" />
            <rect y="256" width="512" height="256" fill="#ffffff" />
            <circle cx="150" cy="150" r="65" fill="#ffffff" />
            <circle cx="175" cy="150" r="55" fill="#ed2939" />
            <polygon points="230,90 240,120 272,120 246,138 256,168 230,150 204,168 214,138 188,120 220,120" fill="#ffffff" />
            <polygon points="230,150 236,168 254,168 240,180 246,198 230,188 214,198 220,180 206,168 224,168" fill="#ffffff" />
            <polygon points="270,150 276,168 294,168 280,180 286,198 270,188 254,198 260,180 246,168 264,168" fill="#ffffff" />
            <polygon points="150,190 156,208 174,208 160,220 166,238 150,228 134,238 140,220 126,208 144,208" fill="#ffffff" />
            <polygon points="310,190 316,208 334,208 320,220 326,238 310,228 294,238 300,220 286,208 304,208" fill="#ffffff" />
          </g>
        </svg>
      );

    case 'arabic':
    case 'sa':
    case 'saudi arabia':
      return (
        <svg viewBox="0 0 512 512" className={className} {...props}>
          <mask id="circle-mask-sa">
            <circle cx="256" cy="256" r="256" fill="white" />
          </mask>
          <g mask="url(#circle-mask-sa)">
            {/* Green background */}
            <rect width="512" height="512" fill="#006C35" />

            {/* Stylized White Arabic calligraphy/Shahada */}
            <path d="M130 260 C 180 220, 220 220, 256 260 C 290 220, 330 220, 382 260" fill="none" stroke="#ffffff" strokeWidth="18" strokeLinecap="round" />
            <path d="M160 210 V 265 M200 200 V 265 M240 210 V 265 M280 200 V 265 M320 210 V 265 M360 200 V 265" stroke="#ffffff" strokeWidth="10" strokeLinecap="round" />

            {/* White sword */}
            <path d="M140 340 H372" stroke="#ffffff" strokeWidth="14" strokeLinecap="round" />
            <path d="M170 320 V360" stroke="#ffffff" strokeWidth="10" strokeLinecap="round" />
          </g>
        </svg>
      );

    case 'chinese':
    case 'cn':
    case 'china':
      return (
        <svg viewBox="0 0 512 512" className={className} {...props}>
          <mask id="circle-mask-cn">
            <circle cx="256" cy="256" r="256" fill="white" />
          </mask>
          <g mask="url(#circle-mask-cn)">
            {/* Red background */}
            <rect width="512" height="512" fill="#ee1c25" />
            {/* Big star */}
            <polygon points="120,75 135,120 180,120 144,147 158,192 120,165 82,192 96,147 60,120 105,120" fill="#ffde00" />
            {/* Small stars */}
            <g fill="#ffde00" transform="scale(0.5)">
              <polygon points="410,50 415,65 430,65 418,74 422,89 410,80 398,89 402,74 390,65 405,65" transform="rotate(10, 410, 70)" />
              <polygon points="460,120 465,135 480,135 468,144 472,159 460,150 448,159 452,144 440,135 455,135" transform="rotate(30, 460, 140)" />
              <polygon points="460,210 465,225 480,225 468,234 472,249 460,240 448,249 452,234 440,225 455,225" transform="rotate(5, 460, 230)" />
              <polygon points="410,270 415,285 430,285 418,294 422,309 410,300 398,309 402,294 390,285 405,285" transform="rotate(-15, 410, 290)" />
            </g>
          </g>
        </svg>
      );

    case 'hindi':
    case 'in':
    case 'india':
      return (
        <svg viewBox="0 0 512 512" className={className} {...props}>
          <mask id="circle-mask-in">
            <circle cx="256" cy="256" r="256" fill="white" />
          </mask>
          <g mask="url(#circle-mask-in)">
            {/* Saffron band */}
            <rect width="512" height="170.6" fill="#ff9933" />
            {/* White band */}
            <rect y="170.6" width="512" height="170.6" fill="#ffffff" />
            {/* Green band */}
            <rect y="341.2" width="512" height="170.8" fill="#138808" />
            {/* Ashoka Chakra */}
            <circle cx="256" cy="256" r="55" fill="none" stroke="#000080" strokeWidth="8" />
            <circle cx="256" cy="256" r="12" fill="#000080" />
            {/* Chakra spokes */}
            <g stroke="#000080" strokeWidth="4">
              <line x1="256" y1="201" x2="256" y2="311" />
              <line x1="201" y1="256" x2="311" y2="256" />
              <line x1="217" y1="217" x2="295" y2="295" />
              <line x1="217" y1="295" x2="295" y2="217" />
              <line x1="234" y1="204" x2="278" y2="308" />
              <line x1="204" y1="234" x2="308" y2="278" />
              <line x1="204" y1="278" x2="308" y2="234" />
              <line x1="234" y1="308" x2="278" y2="204" />
            </g>
          </g>
        </svg>
      );

    case 'bangla':
    case 'bd':
    case 'bangladesh':
      return (
        <svg viewBox="0 0 512 512" className={className} {...props}>
          <mask id="circle-mask-bd">
            <circle cx="256" cy="256" r="256" fill="white" />
          </mask>
          <g mask="url(#circle-mask-bd)">
            <rect width="512" height="512" fill="#006a4e" />
            <circle cx="236" cy="256" r="145" fill="#f42a41" />
          </g>
        </svg>
      );

    case 'russian':
    case 'ru':
    case 'russia':
      return (
        <svg viewBox="0 0 512 512" className={className} {...props}>
          <mask id="circle-mask-ru">
            <circle cx="256" cy="256" r="256" fill="white" />
          </mask>
          <g mask="url(#circle-mask-ru)">
            <rect width="512" height="170.6" fill="#ffffff" />
            <rect y="170.6" width="512" height="170.6" fill="#0039a6" />
            <rect y="341.2" width="512" height="170.8" fill="#d52b1e" />
          </g>
        </svg>
      );

    case 'portuguese':
    case 'pt':
    case 'portugal':
      return (
        <svg viewBox="0 0 512 512" className={className} {...props}>
          <mask id="circle-mask-pt">
            <circle cx="256" cy="256" r="256" fill="white" />
          </mask>
          <g mask="url(#circle-mask-pt)">
            <rect width="512" height="512" fill="#ff0000" />
            <rect width="205" height="512" fill="#006600" />
            <circle cx="205" cy="256" r="55" fill="#ffcc00" stroke="#ffffff" strokeWidth="6" />
          </g>
        </svg>
      );

    case 'italian':
    case 'it':
    case 'italy':
      return (
        <svg viewBox="0 0 512 512" className={className} {...props}>
          <mask id="circle-mask-it">
            <circle cx="256" cy="256" r="256" fill="white" />
          </mask>
          <g mask="url(#circle-mask-it)">
            <rect width="170.6" height="512" fill="#009246" />
            <rect x="170.6" width="170.6" height="512" fill="#ffffff" />
            <rect x="341.2" width="170.8" height="512" fill="#ce2b37" />
          </g>
        </svg>
      );

    case 'urdu':
    case 'pk':
    case 'pakistan':
      return (
        <svg viewBox="0 0 512 512" className={className} {...props}>
          <mask id="circle-mask-pk">
            <circle cx="256" cy="256" r="256" fill="white" />
          </mask>
          <g mask="url(#circle-mask-pk)">
            <rect width="512" height="512" fill="#01411c" />
            <rect width="128" height="512" fill="#ffffff" />
            <circle cx="300" cy="220" r="70" fill="#ffffff" />
            <circle cx="325" cy="200" r="58" fill="#01411c" />
            <polygon points="380,150 391,182 425,182 397,202 408,234 380,214 352,234 363,202 335,182 369,182" fill="#ffffff" />
          </g>
        </svg>
      );

    case 'turkish':
    case 'tr':
    case 'turkey':
      return (
        <svg viewBox="0 0 512 512" className={className} {...props}>
          <mask id="circle-mask-tr">
            <circle cx="256" cy="256" r="256" fill="white" />
          </mask>
          <g mask="url(#circle-mask-tr)">
            <rect width="512" height="512" fill="#e30a17" />
            <circle cx="220" cy="256" r="80" fill="#ffffff" />
            <circle cx="245" cy="256" r="65" fill="#e30a17" />
            <polygon points="320,220 332,255 368,255 339,276 350,311 320,290 290,311 301,276 272,255 308,255" fill="#ffffff" />
          </g>
        </svg>
      );

    case 'malay':
    case 'my':
    case 'malaysia':
      return (
        <svg viewBox="0 0 512 512" className={className} {...props}>
          <mask id="circle-mask-my">
            <circle cx="256" cy="256" r="256" fill="white" />
          </mask>
          <g mask="url(#circle-mask-my)">
            <rect width="512" height="512" fill="#ffffff" />
            <g fill="#cc0001">
              {[...Array(7)].map((_, i) => (
                <rect key={i} y={i * (512 / 6.5)} width="512" height={512 / 13} />
              ))}
            </g>
            <rect width="290" height="290" fill="#010066" />
            <circle cx="145" cy="145" r="80" fill="#ffcc00" />
            <circle cx="175" cy="145" r="68" fill="#010066" />
            <polygon points="220,110 230,140 262,140 236,158 246,188 220,170 194,188 204,158 178,140 210,140" fill="#ffcc00" />
          </g>
        </svg>
      );

    case 'thai':
    case 'th':
    case 'thailand':
      return (
        <svg viewBox="0 0 512 512" className={className} {...props}>
          <mask id="circle-mask-th">
            <circle cx="256" cy="256" r="256" fill="white" />
          </mask>
          <g mask="url(#circle-mask-th)">
            <rect width="512" height="512" fill="#ffffff" />
            <rect y="0" width="512" height="85.3" fill="#a51931" />
            <rect y="85.3" width="512" height="85.3" fill="#f4f5f8" />
            <rect y="170.6" width="512" height="170.8" fill="#2d2a4a" />
            <rect y="341.4" width="512" height="85.3" fill="#f4f5f8" />
            <rect y="426.7" width="512" height="85.3" fill="#a51931" />
          </g>
        </svg>
      );

    case 'vietnamese':
    case 'vn':
    case 'vietnam':
      return (
        <svg viewBox="0 0 512 512" className={className} {...props}>
          <mask id="circle-mask-vn">
            <circle cx="256" cy="256" r="256" fill="white" />
          </mask>
          <g mask="url(#circle-mask-vn)">
            <rect width="512" height="512" fill="#da251d" />
            <polygon points="256,140 285,225 375,225 302,278 330,363 256,310 182,363 210,278 137,225 227,225" fill="#ffff00" />
          </g>
        </svg>
      );

    case 'persian':
    case 'ir':
    case 'iran':
      return (
        <svg viewBox="0 0 512 512" className={className} {...props}>
          <mask id="circle-mask-ir">
            <circle cx="256" cy="256" r="256" fill="white" />
          </mask>
          <g mask="url(#circle-mask-ir)">
            <rect width="512" height="170.6" fill="#239f40" />
            <rect y="170.6" width="512" height="170.6" fill="#ffffff" />
            <rect y="341.2" width="512" height="170.8" fill="#da0000" />
          </g>
        </svg>
      );

    case 'dutch':
    case 'nl':
    case 'netherlands':
      return (
        <svg viewBox="0 0 512 512" className={className} {...props}>
          <mask id="circle-mask-nl">
            <circle cx="256" cy="256" r="256" fill="white" />
          </mask>
          <g mask="url(#circle-mask-nl)">
            <rect width="512" height="170.6" fill="#ae1c28" />
            <rect y="170.6" width="512" height="170.6" fill="#ffffff" />
            <rect y="341.2" width="512" height="170.8" fill="#21468b" />
          </g>
        </svg>
      );

    case 'swahili':
    case 'tz':
    case 'tanzania':
      return (
        <svg viewBox="0 0 512 512" className={className} {...props}>
          <mask id="circle-mask-tz">
            <circle cx="256" cy="256" r="256" fill="white" />
          </mask>
          <g mask="url(#circle-mask-tz)">
            {/* Green upper-left / blue lower-right, split by a black-on-gold diagonal band */}
            <rect width="512" height="512" fill="#1eb53a" />
            <polygon points="512,0 512,512 0,512" fill="#00a3dd" />
            <polygon points="0,472 0,512 512,40 512,0" fill="#fcd116" />
            <polygon points="0,492 0,512 512,20 512,0" fill="#000000" />
          </g>
        </svg>
      );

    case 'finland':
    case 'fi':
      return (
        <svg viewBox="0 0 512 512" className={className} {...props}>
          <mask id="circle-mask-fi">
            <circle cx="256" cy="256" r="256" fill="white" />
          </mask>
          <g mask="url(#circle-mask-fi)">
            {/* White field, offset Nordic cross */}
            <rect width="512" height="512" fill="#ffffff" />
            <rect x="180" width="90" height="512" fill="#003580" />
            <rect y="211" width="512" height="90" fill="#003580" />
          </g>
        </svg>
      );

    case 'hungary':
    case 'hu':
      return (
        <svg viewBox="0 0 512 512" className={className} {...props}>
          <mask id="circle-mask-hu">
            <circle cx="256" cy="256" r="256" fill="white" />
          </mask>
          <g mask="url(#circle-mask-hu)">
            <rect width="512" height="170.6" fill="#ce2939" />
            <rect y="170.6" width="512" height="170.6" fill="#ffffff" />
            <rect y="341.2" width="512" height="170.8" fill="#477050" />
          </g>
        </svg>
      );

    case 'newzealand':
    case 'nz':
      return (
        <svg viewBox="0 0 512 512" className={className} {...props}>
          <mask id="circle-mask-nz">
            <circle cx="256" cy="256" r="256" fill="white" />
          </mask>
          <g mask="url(#circle-mask-nz)">
            <rect width="512" height="512" fill="#00247d" />
            {/* Simplified Union Jack in canton */}
            <g transform="scale(0.5)">
              <rect width="512" height="512" fill="#012169" />
              <path d="M0 0 L512 512 M512 0 L0 512" stroke="#ffffff" strokeWidth="60" />
              <path d="M0 0 L512 512 M512 0 L0 512" stroke="#c8102e" strokeWidth="36" />
              <path d="M256 0 V512 M0 256 H512" stroke="#ffffff" strokeWidth="100" />
              <path d="M256 0 V512 M0 256 H512" stroke="#c8102e" strokeWidth="60" />
            </g>
            {/* Southern Cross, 4 red stars, white-bordered */}
            <g fill="#cc142b" stroke="#ffffff" strokeWidth="4">
              <polygon points="392,90 400,112 424,112 405,126 412,148 392,134 372,148 379,126 360,112 384,112" />
              <polygon points="432,190 440,212 464,212 445,226 452,248 432,234 412,248 419,226 400,212 424,212" />
              <polygon points="392,320 400,342 424,342 405,356 412,378 392,364 372,378 379,356 360,342 384,342" />
              <polygon points="330,250 337,270 358,270 341,282 347,302 330,290 313,302 319,282 302,270 323,270" />
            </g>
          </g>
        </svg>
      );

    case 'poland':
    case 'pl':
      return (
        <svg viewBox="0 0 512 512" className={className} {...props}>
          <mask id="circle-mask-pl">
            <circle cx="256" cy="256" r="256" fill="white" />
          </mask>
          <g mask="url(#circle-mask-pl)">
            <rect width="512" height="256" fill="#ffffff" />
            <rect y="256" width="512" height="256" fill="#dc143c" />
          </g>
        </svg>
      );

    case 'switzerland':
    case 'ch':
      return (
        <svg viewBox="0 0 512 512" className={className} {...props}>
          <mask id="circle-mask-ch">
            <circle cx="256" cy="256" r="256" fill="white" />
          </mask>
          <g mask="url(#circle-mask-ch)">
            <rect width="512" height="512" fill="#d52b1e" />
            <rect x="216" y="126" width="80" height="260" fill="#ffffff" />
            <rect x="126" y="216" width="260" height="80" fill="#ffffff" />
          </g>
        </svg>
      );

    case 'uae':
    case 'ae':
      return (
        <svg viewBox="0 0 512 512" className={className} {...props}>
          <mask id="circle-mask-ae">
            <circle cx="256" cy="256" r="256" fill="white" />
          </mask>
          <g mask="url(#circle-mask-ae)">
            <rect width="512" height="170.6" fill="#00732f" />
            <rect y="170.6" width="512" height="170.6" fill="#ffffff" />
            <rect y="341.2" width="512" height="170.8" fill="#000000" />
            <rect width="153.6" height="512" fill="#ff0000" />
          </g>
        </svg>
      );

    default:
      // Return a default beautiful globe or generic icon if no match
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
  }
};

export default FlagIcon;
