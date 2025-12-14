/* eslint-disable @next/next/no-before-interactive-script-outside-document */
"use client"

import { useEffect } from "react"

type Point = { x: number; y: number }

function randomPerimeterPoint(): Point {
	// Pick a random point on the rectangle perimeter (in percentages).
	const side = Math.floor(Math.random() * 4) // 0 top, 1 right, 2 bottom, 3 left
	const t = Math.random() * 100
	switch (side) {
		case 0:
			return { x: t, y: 0 }
		case 1:
			return { x: 100, y: t }
		case 2:
			return { x: t, y: 100 }
		default:
			return { x: 0, y: t }
	}
}

function setVar(name: string, value: number) {
	document.documentElement.style.setProperty(name, `${value.toFixed(2)}%`)
}

export function PerimeterGradientAnimator() {
	useEffect(() => {
		// Respect reduced motion.
		const media = window.matchMedia?.("(prefers-reduced-motion: reduce)")
		if (media?.matches) return

		// Initialize with current CSS defaults (don’t force set here).
		const tick = () => {
			const a = randomPerimeterPoint()
			const b = randomPerimeterPoint()
			const c = randomPerimeterPoint()

			setVar("--blob1x", a.x)
			setVar("--blob1y", a.y)
			setVar("--blob2x", b.x)
			setVar("--blob2y", b.y)
			setVar("--blob3x", c.x)
			setVar("--blob3y", c.y)
		}

		// First move soon after mount, then periodically.
		const start = window.setTimeout(tick, 250)
		const interval = window.setInterval(tick, 4500)

		return () => {
			window.clearTimeout(start)
			window.clearInterval(interval)
		}
	}, [])

	return null
}


