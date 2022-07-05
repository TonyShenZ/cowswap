import { isAddress } from '@src/custom/utils'
import { useCallback, useEffect, useState } from 'react'
import { blockClient, client, positionClient } from './client'
import { USER_TRANSACTIONS, FILTERED_TRANSACTIONS, BLOCK_TIME, HEADER_QUOTES, QUERY_POSITION } from './queries'

interface BasicData {
  token0?: {
    id: string
    name: string
    symbol: string
  }
  token1?: {
    id: string
    name: string
    symbol: string
  }
}

export interface PositionMeta {
  id: string
  worker: {
    id: string
  }
  positionId: string
  debtShare: string
}

const TOKEN_OVERRIDES: { [address: string]: { name: string; symbol: string } } = {
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': {
    name: 'Ether (Wrapped)',
    symbol: 'WBNB',
  },
  '0x1416946162b1c2c871a73b07e932d2fb6c932069': {
    name: 'Energi',
    symbol: 'NRGE',
  },
}

// override tokens with incorrect symbol or names
export function updateNameData(data: BasicData): BasicData | undefined {
  if (data?.token0?.id && Object.keys(TOKEN_OVERRIDES).includes(data.token0.id)) {
    data.token0.name = TOKEN_OVERRIDES[data.token0.id].name
    data.token0.symbol = TOKEN_OVERRIDES[data.token0.id].symbol
  }

  if (data?.token1?.id && Object.keys(TOKEN_OVERRIDES).includes(data.token1.id)) {
    data.token1.name = TOKEN_OVERRIDES[data.token1.id].name
    data.token1.symbol = TOKEN_OVERRIDES[data.token1.id].symbol
  }

  return data
}

export function useUserTransactions(account: string | null | undefined) {
  const transactions: [] | any = undefined

  useEffect(() => {
    async function fetchData(account: string) {
      try {
        const result = await client.query({
          query: USER_TRANSACTIONS,
          variables: {
            user: account,
          },
          fetchPolicy: 'no-cache',
        })
        if (result?.data) {
          console.log(result?.data)
        }
      } catch (e) {
        console.log(e)
      }
    }
    if (!transactions && account) {
      fetchData(account)
    }
  }, [account, transactions])

  return transactions || {}
}

async function getTokenTransactions(tokenAddress: string) {
  try {
    const result = await client.query({
      query: FILTERED_TRANSACTIONS,
      variables: {
        allPairs: tokenAddress,
      },
      fetchPolicy: 'cache-first',
    })
    if (result?.data) {
      const newTxns: any = []
      result?.data?.swaps.map(
        (swap: {
          amount0In: number
          amount0Out: number
          amount1In: number
          amount1Out: number
          pair: any
          transaction: { id: any; timestamp: any }
          amountUSD: any
          to: any
        }) => {
          const netToken0 = swap.amount0In - swap.amount0Out
          const netToken1 = swap.amount1In - swap.amount1Out

          const newTxn: any = {}

          if (netToken0 < 0) {
            newTxn.token0Symbol = updateNameData(swap.pair)?.token0?.symbol
            newTxn.token1Symbol = updateNameData(swap.pair)?.token1?.symbol
            newTxn.token0Amount = Math.abs(netToken0)
            newTxn.token1Amount = Math.abs(netToken1)
          } else if (netToken1 < 0) {
            newTxn.token0Symbol = updateNameData(swap.pair)?.token1?.symbol
            newTxn.token1Symbol = updateNameData(swap.pair)?.token0?.symbol
            newTxn.token0Amount = Math.abs(netToken1)
            newTxn.token1Amount = Math.abs(netToken0)
          }

          newTxn.hash = swap.transaction.id
          newTxn.timestamp = swap.transaction.timestamp
          newTxn.type = 'Swaps'

          newTxn.amountUSD = swap.amountUSD
          newTxn.account = swap.to
          return newTxns.push(newTxn)
        }
      )
      return newTxns
    }
  } catch (e) {
    console.log(e)
    return []
  }
}

export function useTokenTransactions(tokenAddress: string) {
  const [data, setData] = useState<
    Array<{
      account: string
      amountUSD: string
      hash: string
      timestamp: string
      token0Amount: number
      token0Symbol: string
      token1Amount: number
      token1Symbol: string
      type: 'Swaps'
    }>
  >([])

  const fetchApiCallback = useCallback(async (tokenAddress: string) => {
    console.log('fetchApiCallback', tokenAddress)
    setData(await getTokenTransactions(tokenAddress))
  }, [])

  useEffect(() => {
    fetchApiCallback(tokenAddress)
  }, [fetchApiCallback, tokenAddress])

  return data || []
}

export function useBlockToTime(block: number) {
  const [time, setTime] = useState<string | undefined>(undefined)
  useEffect(() => {
    async function fetchData(block: number) {
      try {
        const result = await blockClient.query({
          query: BLOCK_TIME,
          variables: {
            number: block,
          },
          fetchPolicy: 'no-cache',
        })
        if (result?.data) {
          setTime(result?.data?.blocks?.[0].timestamp)
        }
      } catch (e) {
        console.log(e)
      }
    }
    if (!time && block) {
      fetchData(block)
    }
  }, [block, time])

  return time || undefined
}

export function usePairData(pairAddress: string) {
  const [pairData, setPairData] = useState<{
    pairs: { token0Price: string; reserveUSD: string }
    pairDayDatas: string
  }>({
    pairs: {
      token0Price: '',
      reserveUSD: '',
    },
    pairDayDatas: '',
  })

  useEffect(() => {
    async function fetchData(pairAddress: string) {
      try {
        const result = await client.query({
          query: HEADER_QUOTES,
          variables: {
            allPairs: pairAddress,
          },
          fetchPolicy: 'no-cache',
        })
        if (result?.data) {
          setPairData({
            pairDayDatas: result?.data.pairDayDatas[0].dailyVolumeToken0,
            pairs: { token0Price: result?.data.pairs[0].token0Price, reserveUSD: result?.data.pairs[0].reserveUSD },
          })
        }
      } catch (e) {
        console.log(e)
      }
    }
    if (isAddress(pairAddress)) {
      fetchData(pairAddress)
    }
  }, [pairAddress])

  return pairData
}

export function MyPosition(address: string | null | undefined) {
  const [position, setPosition] = useState<PositionMeta[]>()
  useEffect(() => {
    async function fetchData(address: string) {
      try {
        const result = await positionClient.query({
          query: QUERY_POSITION,
          variables: {
            owner: address.toLocaleLowerCase(),
          },
          fetchPolicy: 'no-cache',
        })
        if (result?.data) {
          setPosition(result?.data?.positions)
        }
      } catch (e) {
        setPosition(undefined)
      }
    }
    if (!position && address) {
      fetchData(address)
    }
  }, [position, address])
  return position
}
