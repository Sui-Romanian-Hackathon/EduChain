"use client"

import { useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useCurrentAccount, useSuiClient, useSuiClientQuery } from "@mysten/dapp-kit"
import { APP_CONFIG } from "./config"
import { fetchBackendEvents, type BackendEventRow } from "./backend"
import { parseU64, structType } from "./sui"

type ChainEvent = {
	type: string
	parsedJson?: any
	timestampMs?: string
}

export type VoteView = {
	proposalId: number
	choice: 0 | 1
	votedAtMs?: number
	opinion?: string
}

export function useVotes(limit = 500) {
	const client = useSuiClient()
	const account = useCurrentAccount()
	const enabled = Boolean(account?.address && APP_CONFIG.packageId)

	const eventType = useMemo(() => (APP_CONFIG.packageId ? structType("educhain", "VoteCast") : ""), [])

	const backend = useQuery<{ data: BackendEventRow[]; nextCursor: string | null }>({
		queryKey: ["backend-events", "votes", eventType, limit, account?.address, APP_CONFIG.backendUrl],
		enabled: enabled && Boolean(APP_CONFIG.backendUrl) && Boolean(eventType),
		queryFn: () => fetchBackendEvents({ eventType, limit }),
		staleTime: 10_000,
		retry: false,
		refetchOnWindowFocus: false,
		retryOnMount: false,
		throwOnError: false
	})

	const chain = useSuiClientQuery(
		"queryEvents",
		{
			query: { MoveEventType: eventType },
			limit,
			order: "descending"
		},
		{ enabled: enabled && Boolean(eventType) }
	)

	const rawEvents: ChainEvent[] | null = useMemo(() => {
		if (APP_CONFIG.backendUrl && backend.data && !backend.error) {
			const rows = backend.data.data ?? []
			return rows.map((r: BackendEventRow) => ({
				type: r.eventType ?? eventType,
				parsedJson: r.parsedJson ?? {},
				timestampMs: r.timestampMs != null ? String(r.timestampMs) : undefined
			}))
		}
		return (chain.data?.data ?? []) as any
	}, [backend.data, backend.error, chain.data, eventType])

	const isLoading = APP_CONFIG.backendUrl && !backend.error ? backend.isPending : chain.isPending
	const error = chain.error as any

	const [votes, setVotes] = useState<VoteView[]>([])

	useEffect(() => {
		const addr = account?.address
		if (!addr || !rawEvents?.length) {
			setVotes([])
			return
		}

		const byProposal = new Map<number, VoteView>()
		for (const e of rawEvents) {
			const pj = e.parsedJson ?? {}
			const voter = pj.voter ? String(pj.voter) : null
			if (!voter || voter !== addr) continue
			const proposalId = parseU64(pj.proposal_id)
			if (proposalId == null) continue
			if (byProposal.has(proposalId)) continue
			const choiceNum = parseU64(pj.choice)
			const choice: 0 | 1 = choiceNum === 0 ? 0 : 1
			const votedAtMs = e.timestampMs ? Number(e.timestampMs) : undefined
			byProposal.set(proposalId, { proposalId, choice, votedAtMs })
		}

		const list = [...byProposal.values()].sort((a, b) => (b.votedAtMs ?? 0) - (a.votedAtMs ?? 0))
		setVotes(list)
	}, [account?.address, rawEvents])

	void client

	const votedProposalIds = useMemo(() => {
		const s = new Set<number>()
		for (const v of votes) s.add(v.proposalId)
		return s
	}, [votes])

	const votedChoiceByProposalId = useMemo(() => {
		const m = new Map<number, 0 | 1>()
		for (const v of votes) m.set(v.proposalId, v.choice)
		return m
	}, [votes])

	return {
		votes,
		votedProposalIds,
		votedChoiceByProposalId,
		loading: isLoading,
		error,
		refetch: chain.refetch,
		source: APP_CONFIG.backendUrl && backend.data && !backend.error ? "backend" : "chain"
	} as const
}
