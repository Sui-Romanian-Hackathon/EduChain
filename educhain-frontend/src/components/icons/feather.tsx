import * as React from "react"

export type FeatherIconProps = Omit<React.SVGProps<SVGSVGElement>, "color"> & {
	size?: number
	color?: string
	strokeWidth?: number
}

function baseSvgProps(props: FeatherIconProps) {
	const { size = 24, color = "currentColor", strokeWidth = 2, ...rest } = props
	return {
		width: size,
		height: size,
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: color,
		strokeWidth,
		strokeLinecap: "round" as const,
		strokeLinejoin: "round" as const,
		...rest
	}
}

// Feather icon set (https://feathericons.com/)

export function IconBookOpen(props: FeatherIconProps) {
	return (
		<svg {...baseSvgProps(props)}>
			<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
			<path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
		</svg>
	)
}

export function IconClipboard(props: FeatherIconProps) {
	return (
		<svg {...baseSvgProps(props)}>
			<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
			<rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
		</svg>
	)
}

export function IconUser(props: FeatherIconProps) {
	return (
		<svg {...baseSvgProps(props)}>
			<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
			<circle cx="12" cy="7" r="4" />
		</svg>
	)
}

export function IconSettings(props: FeatherIconProps) {
	return (
		<svg {...baseSvgProps(props)}>
			<circle cx="12" cy="12" r="3" />
			<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82 1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
		</svg>
	)
}

export function IconChevronDown(props: FeatherIconProps) {
	return (
		<svg {...baseSvgProps(props)}>
			<polyline points="6 9 12 15 18 9" />
		</svg>
	)
}

export function IconCopy(props: FeatherIconProps) {
	return (
		<svg {...baseSvgProps(props)}>
			<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
			<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
		</svg>
	)
}

export function IconLogOut(props: FeatherIconProps) {
	return (
		<svg {...baseSvgProps(props)}>
			<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
			<polyline points="16 17 21 12 16 7" />
			<line x1="21" y1="12" x2="9" y2="12" />
		</svg>
	)
}

export function IconPlusCircle(props: FeatherIconProps) {
	return (
		<svg {...baseSvgProps(props)}>
			<circle cx="12" cy="12" r="10" />
			<line x1="12" y1="8" x2="12" y2="16" />
			<line x1="8" y1="12" x2="16" y2="12" />
		</svg>
	)
}

export function IconSearch(props: FeatherIconProps) {
	return (
		<svg {...baseSvgProps(props)}>
			<circle cx="11" cy="11" r="8" />
			<line x1="21" y1="21" x2="16.65" y2="16.65" />
		</svg>
	)
}

export function IconArrowRight(props: FeatherIconProps) {
	return (
		<svg {...baseSvgProps(props)}>
			<line x1="5" y1="12" x2="19" y2="12" />
			<polyline points="12 5 19 12 12 19" />
		</svg>
	)
}

export function IconExternalLink(props: FeatherIconProps) {
	return (
		<svg {...baseSvgProps(props)}>
			<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
			<polyline points="15 3 21 3 21 9" />
			<line x1="10" y1="14" x2="21" y2="3" />
		</svg>
	)
}

export function IconRefreshCw(props: FeatherIconProps) {
	return (
		<svg {...baseSvgProps(props)}>
			<polyline points="23 4 23 10 17 10" />
			<polyline points="1 20 1 14 7 14" />
			<path d="M3.51 9a9 9 0 0 1 14.13-3.36L23 10" />
			<path d="M1 14l5.36 5.36A9 9 0 0 0 20.49 15" />
		</svg>
	)
}

export function IconCheckCircle(props: FeatherIconProps) {
	return (
		<svg {...baseSvgProps(props)}>
			<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
			<polyline points="22 4 12 14.01 9 11.01" />
		</svg>
	)
}

export function IconThumbsUp(props: FeatherIconProps) {
	return (
		<svg {...baseSvgProps(props)}>
			<path d="M14 9V5a3 3 0 0 0-3-3l-1 7" />
			<path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
			<path d="M7 10h10a2 2 0 0 1 2 2l-1 7a2 2 0 0 1-2 2H7V10z" />
		</svg>
	)
}

export function IconThumbsDown(props: FeatherIconProps) {
	return (
		<svg {...baseSvgProps(props)}>
			<path d="M10 15v4a3 3 0 0 0 3 3l1-7" />
			<path d="M17 2h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" />
			<path d="M17 14H7a2 2 0 0 1-2-2l1-7a2 2 0 0 1 2-2h9v11z" />
		</svg>
	)
}

export function IconAward(props: FeatherIconProps) {
	return (
		<svg {...baseSvgProps(props)}>
			<circle cx="12" cy="8" r="7" />
			<polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
		</svg>
	)
}

export function IconFileText(props: FeatherIconProps) {
	return (
		<svg {...baseSvgProps(props)}>
			<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
			<polyline points="14 2 14 8 20 8" />
			<line x1="16" y1="13" x2="8" y2="13" />
			<line x1="16" y1="17" x2="8" y2="17" />
		</svg>
	)
}

export function IconDroplet(props: FeatherIconProps) {
	return (
		<svg {...baseSvgProps(props)}>
			<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
		</svg>
	)
}

export function IconSun(props: FeatherIconProps) {
	return (
		<svg {...baseSvgProps(props)}>
			<circle cx="12" cy="12" r="5" />
			<line x1="12" y1="1" x2="12" y2="3" />
			<line x1="12" y1="21" x2="12" y2="23" />
			<line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
			<line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
			<line x1="1" y1="12" x2="3" y2="12" />
			<line x1="21" y1="12" x2="23" y2="12" />
			<line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
			<line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
		</svg>
	)
}

export function IconMoon(props: FeatherIconProps) {
	return (
		<svg {...baseSvgProps(props)}>
			<path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
		</svg>
	)
}


