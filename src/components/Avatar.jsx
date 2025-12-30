import { useEffect, useRef } from 'react'

function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n))
}

/**
 * =========================
 * SPACE FLOAT TUNING (KNOBS)
 * =========================
 * These values scale off the avatar's CURRENT rendered HEIGHT.
 * Example: 0.03 means 3% of the avatar height.
 */

// Drift strength (scaled off height)
const DRIFT_X_FACTOR = 0.2   // left/right drift strength
const DRIFT_Y_FACTOR = 1   // up/down drift strength
const SWAY_DEG_FACTOR = 0.06  // rotation sway strength (degrees per px of height)

// Clamp ranges (keeps it tasteful across very small/large sizes)
const DRIFT_X_MIN_PX = 6
const DRIFT_X_MAX_PX = 25

const DRIFT_Y_MIN_PX = 8
const DRIFT_Y_MAX_PX = 45

const SWAY_MIN_DEG = 0.4
const SWAY_MAX_DEG = 5

// Motion timing (non-matching periods = less “loop-y”)
const DRIFT_X_PERIOD_MS = 10000
const DRIFT_Y_PERIOD_MS = 17000
const SWAY_PERIOD_MS = 15000

// Phase offsets (small tweaks change the “character” of the drift)
const DRIFT_Y_PHASE = 1.1
const SWAY_PHASE = 0.4

// Hover blending (how quickly it recenters on hover)
const HOVER_BLEND_LERP = 0.08

/**
 * =========================
 * WINDOW MOUSE TILT (KNOBS)
 * =========================
 * Mouse anywhere on the window controls tilt.
 */
const PARALLAX_PERSPECTIVE_PX = 900

const PARALLAX_MAX_ROTATE_X_DEG = 24   // up/down tilt
const PARALLAX_MAX_ROTATE_Y_DEG = 30  // left/right tilt

// small "parallax slide" (scaled off avatar height)
const PARALLAX_TX_FACTOR = 0.02
const PARALLAX_TY_FACTOR = 0.015
const PARALLAX_T_MIN_PX = 2
const PARALLAX_T_MAX_PX = 18

// smoothing for mouse response (higher = snappier)
const PARALLAX_LERP = 0.12

function Avatar({ avatarLogo }) {
    const floatRef = useRef(null) // outer (space float)
    const tiltRef = useRef(null)  // inner (mouse tilt)

    const hoveringRef = useRef(false)
    const hoverBlendRef = useRef(0) // 0 = drifting, 1 = centered (hover)

    // Mouse normalized target/current in [-1, 1] space (relative to the WINDOW)
    const mouseTargetRef = useRef({ x: 0, y: 0 })
    const mouseCurrentRef = useRef({ x: 0, y: 0 })

    useEffect(() => {
        const el = floatRef.current
        const tiltEl = tiltRef.current
        if (!el || !tiltEl) return

        const reduceMotionMQ = window.matchMedia?.('(prefers-reduced-motion: reduce)')
        if (reduceMotionMQ?.matches) return

        // Only enable tilt for real mouse/trackpad
        const finePointerMQ = window.matchMedia?.('(hover: hover) and (pointer: fine)')
        const hasFinePointer = finePointerMQ?.matches ?? false

        let rafId = 0
        let size = { w: 0, h: 0 }

        // Initialize size immediately (helps before ResizeObserver fires)
        {
            const rect = el.getBoundingClientRect()
            size = { w: rect.width, h: rect.height }
        }

        // Keep size updated as the avatar responsively changes
        const ro = new ResizeObserver((entries) => {
            const rect = entries[0]?.contentRect
            if (!rect) return
            size = { w: rect.width, h: rect.height }
        })
        ro.observe(el)

        // Track mouse ANYWHERE on the window (normalized to [-1, 1])
        const onWindowMove = (e) => {
            if (!hasFinePointer) return

            // Normalize to window bounds: left=-1, right=+1, top=-1, bottom=+1
            const nx = clamp((e.clientX / window.innerWidth) * 2 - 1, -1, 1)
            const ny = clamp((e.clientY / window.innerHeight) * 2 - 1, -1, 1)

            mouseTargetRef.current.x = nx
            mouseTargetRef.current.y = ny
        }

        // If mouse leaves the window (or tab loses focus), ease back to neutral
        const onWindowBlur = () => {
            mouseTargetRef.current.x = 0
            mouseTargetRef.current.y = 0
        }
        const onWindowOut = (e) => {
            // When leaving the document/window, relatedTarget is often null
            if (e.relatedTarget == null) onWindowBlur()
        }

        if (hasFinePointer) {
            window.addEventListener('mousemove', onWindowMove, { passive: true })
            window.addEventListener('blur', onWindowBlur)
            window.addEventListener('mouseout', onWindowOut)
        }

        const start = performance.now()

        // Convert periods (ms) -> angular velocity
        const w1 = (2 * Math.PI) / DRIFT_X_PERIOD_MS
        const w2 = (2 * Math.PI) / DRIFT_Y_PERIOD_MS
        const w3 = (2 * Math.PI) / SWAY_PERIOD_MS

        const tick = (now) => {
            const t = now - start

            // Scale off rendered HEIGHT
            const base = Math.max(1, size.h)

            // Amplitudes (responsive + clamped)
            const AX = clamp(base * DRIFT_X_FACTOR, DRIFT_X_MIN_PX, DRIFT_X_MAX_PX)
            const AY = clamp(base * DRIFT_Y_FACTOR, DRIFT_Y_MIN_PX, DRIFT_Y_MAX_PX)
            const AR = clamp(base * SWAY_DEG_FACTOR, SWAY_MIN_DEG, SWAY_MAX_DEG)

            // Smoothly blend to center on hover (no snap)
            const targetBlend = hoveringRef.current ? 1 : 0
            hoverBlendRef.current += (targetBlend - hoverBlendRef.current) * HOVER_BLEND_LERP
            const blend = hoverBlendRef.current // 0..1
            const driftScale = 1 - blend

            // ---------- Space float (outer wrapper) ----------
            const x = driftScale * (AX * Math.sin(w1 * t))
            const y = driftScale * (AY * Math.sin(w2 * t + DRIFT_Y_PHASE))
            const r = driftScale * (AR * Math.sin(w3 * t + SWAY_PHASE))
            el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotate(${r.toFixed(2)}deg)`

            // ---------- Mouse tilt/parallax (inner wrapper) ----------
            if (hasFinePointer) {
                const mt = mouseTargetRef.current
                const mc = mouseCurrentRef.current

                // Smooth mouse
                mc.x += (mt.x - mc.x) * PARALLAX_LERP
                mc.y += (mt.y - mc.y) * PARALLAX_LERP

                // Parallax translate scales with avatar height
                const tMaxX = clamp(base * PARALLAX_TX_FACTOR, PARALLAX_T_MIN_PX, PARALLAX_T_MAX_PX)
                const tMaxY = clamp(base * PARALLAX_TY_FACTOR, PARALLAX_T_MIN_PX, PARALLAX_T_MAX_PX)

                const tx = driftScale * (mc.x * tMaxX)
                const ty = driftScale * (mc.y * tMaxY)

                // Rotate based on mouse (invert Y for natural feel)
                const rx = driftScale * (-mc.y * PARALLAX_MAX_ROTATE_X_DEG)
                const ry = driftScale * (mc.x * PARALLAX_MAX_ROTATE_Y_DEG)

                tiltEl.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`
            } else {
                // Touch / no-mouse: ensure it stays neutral
                tiltEl.style.transform = 'translate3d(0,0,0) rotateX(0deg) rotateY(0deg)'
            }

            rafId = requestAnimationFrame(tick)
        }

        rafId = requestAnimationFrame(tick)

        return () => {
            cancelAnimationFrame(rafId)
            ro.disconnect()

            if (hasFinePointer) {
                window.removeEventListener('mousemove', onWindowMove)
                window.removeEventListener('blur', onWindowBlur)
                window.removeEventListener('mouseout', onWindowOut)
            }
        }
    }, [])

    return (
        <div className="w-full h-full md:w-2/5 flex justify-baseline md:justify-center-safe mb-7 md:mb-0">
            {/* Outer: space float + provides perspective for inner 3D tilt */}
            <div
                ref={floatRef}
                style={{ perspective: `${PARALLAX_PERSPECTIVE_PX}px` }}
                className="
                    h-full w-full max-w-4/5 max-h-4/5 aspect-auto rounded-3xl
                    will-change-transform
                    motion-reduce:transform-none
                "
            >
                {/* Inner: mouse tilt/parallax */}
                <div
                    ref={tiltRef}
                    className="h-full w-full rounded-3xl will-change-transform [transform-style:preserve-3d]"
                >
                    <a
                        href="https://www.linkedin.com/in/underhill-jack/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block h-full w-full rounded-3xl"
                        title="View My LinkedIn"
                        data-aos="flip-up"
                        onMouseEnter={() => {
                            hoveringRef.current = true
                            mouseTargetRef.current.x = 0
                            mouseTargetRef.current.y = 0
                        }}
                        onMouseLeave={() => {
                            hoveringRef.current = false
                        }}
                    >
                        <img
                            src={avatarLogo}
                            alt="Profile Avatar"
                            draggable={false}
                            className="
                                w-full h-full rounded-3xl
                                transition-transform duration-700 ease-in-out
                                group-hover:rotate-8
                                group-hover:-translate-y-5
                                group-hover:scale-[1.05]
                                will-change-transform
                            "
                        />
                    </a>
                </div>
            </div>
        </div>
    )
}

export default Avatar
