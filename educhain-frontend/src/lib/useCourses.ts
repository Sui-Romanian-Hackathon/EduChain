"use client"

import { useEffect, useMemo, useState } from "react"
import { useSuiClient, useSuiClientQuery } from "@mysten/dapp-kit"
import { useQuery } from "@tanstack/react-query"
import { APP_CONFIG } from "./config"
import { extractFields, parseU64, structType } from "./sui"
import type { Course } from "./types"
import { fetchBackendEvents, type BackendEventRow } from "./backend"

type ChainEvent = {
	type: string
	parsedJson?: any
	timestampMs?: string
}

export function useCourses(limit = 50) {
	const client = useSuiClient()
	const enabled = Boolean(APP_CONFIG.packageId)

	const eventType = useMemo(() => (APP_CONFIG.packageId ? structType("educhain", "CourseCreated") : ""), [])

	const backend = useQuery<{ data: BackendEventRow[]; nextCursor: string | null }>({
		queryKey: ["backend-events", "courses", eventType, limit, APP_CONFIG.backendUrl],
		enabled: enabled && Boolean(APP_CONFIG.backendUrl) && Boolean(eventType),
		queryFn: () => fetchBackendEvents({ eventType, limit }),
		staleTime: 10_000,
		retry: false, // Don't retry on connection errors
		refetchOnWindowFocus: false, // Don't refetch on window focus if backend is down
		retryOnMount: false, // Don't retry when component mounts if it failed before
		throwOnError: false // Don't throw errors - we handle them gracefully
	})

	// Always enable chain query as fallback, but prioritize backend if available and working
	const chain = useSuiClientQuery(
		"queryEvents",
		{
			query: { MoveEventType: eventType },
			limit,
			order: "descending"
		},
		{ enabled: enabled && Boolean(eventType) }
	)

	const [courses, setCourses] = useState<Course[]>([])
	const [loadingObjects, setLoadingObjects] = useState(false)

	const rawEvents: ChainEvent[] | null = useMemo(() => {
		// Use backend if available and successful, otherwise fall back to chain
		if (APP_CONFIG.backendUrl && backend.data && !backend.error) {
			const rows = backend.data.data ?? []
			return rows.map((r: BackendEventRow) => ({
				type: r.eventType ?? eventType,
				parsedJson: r.parsedJson ?? {},
				timestampMs: r.timestampMs != null ? String(r.timestampMs) : undefined
			}))
		}
		// Fall back to chain data
		const data = chain.data?.data ?? []
		return data as any
	}, [backend.data, backend.error, chain.data, eventType])

	// Use backend loading state only if backend is configured and not errored
	// Otherwise use chain loading state
	const isLoading = (APP_CONFIG.backendUrl && !backend.error ? backend.isPending : chain.isPending) || loadingObjects

	// Only show chain errors (backend errors are silently ignored since we fall back)
	const error = chain.error as any

	useEffect(() => {
		let cancelled = false

		async function hydrate() {
			if (!rawEvents?.length) {
				setCourses([])
				return
			}

			setLoadingObjects(true)
			try {
				const baseList: Course[] = rawEvents
					.map((e) => {
						const pj = e.parsedJson ?? {}
						const id = parseU64(pj.course_id) ?? null
						const objectId = pj.course_object_id ?? pj.course_object ?? pj.course_id_object ?? null
						const createdAtMs = e.timestampMs ? Number(e.timestampMs) : undefined
						if (id == null || !objectId) return null
						return { id, objectId: String(objectId), createdAtMs }
					})
					.filter(Boolean) as Course[]

				const unique = new Map<string, Course>()
				for (const c of baseList) unique.set(c.objectId, c)

				const objectIds = [...unique.values()].map((c) => c.objectId)
				const fetched = await Promise.all(
					objectIds.map((id) => client.getObject({ id, options: { showContent: true, showType: true } }).catch(() => null))
				)

				const enriched: Course[] = [...unique.values()].map((c) => {
					const obj = fetched.find((o) => o?.data?.objectId === c.objectId)
					const fields = extractFields(obj)
					return {
						...c,
						title: fields?.title ? String(fields.title) : c.title,
						contentUri: fields?.content_uri ? String(fields.content_uri) : c.contentUri
					}
				})

				if (!cancelled) setCourses(enriched)
			} finally {
				if (!cancelled) setLoadingObjects(false)
			}
		}

		hydrate()
		return () => {
			cancelled = true
		}
	}, [client, rawEvents])

	return {
		courses,
		loading: isLoading,
		error,
		source: APP_CONFIG.backendUrl && backend.data && !backend.error ? "backend" : "chain"
	} as const
}
