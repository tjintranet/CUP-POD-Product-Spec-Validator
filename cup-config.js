// Configuration object for CUP validator
const CONFIG = {
    VALID_BINDINGS: new Set([
        'Cased',
        'Limp'
    ]),
    VALID_PAPERS: new Set([
        'CUP MunkenPure 80 gsm',
        'Navigator 80 gsm',
        'Clairjet 90 gsm',
        'Magno Matt 90 gsm'
    ]),
    VALID_COLOURS: new Set([
        'Mono',
        'Colour'
    ]),
    VALID_ROUTES: new Set([
        'Standard',
        'Premium'
    ]),
    VALID_TRIM_SIZES: new Set([
        '140x216',
        '152x229',
        '156x234',
        '170x244',
        '189x246',
        '178x254',
        '203x254',
        '216x280'
    ]),
    // Paper-specific compatibility rules
    PAPER_COMPATIBILITY: {
        'CUP MunkenPure 80 gsm': {
            allowedColours: new Set(['Mono']),
            allowedRoutes: new Set(['Standard'])
        },
        'Navigator 80 gsm': {
            allowedColours: new Set(['Mono']),
            allowedRoutes: new Set(['Standard'])
        },
        'Clairjet 90 gsm': {
            allowedColours: new Set(['Colour']),
            allowedRoutes: new Set(['Standard'])
        },
        'Magno Matt 90 gsm': {
            allowedColours: new Set(['Mono', 'Colour']),
            allowedRoutes: new Set(['Premium'])
        }
    },
    // Extent rounding thresholds
    EXTENT_NARROW_WIDTH_THRESHOLD: 156,
    EXTENT_NARROW_DIVISOR: 6,
    EXTENT_WIDE_DIVISOR: 4
};
