import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { client } from './client'
import { USER_TRANSACTIONS, FILTERED_TRANSACTIONS } from './queries'

const TokenDataContext = createContext<any>(null)

export function useTokenDataContext() {
  return useContext(TokenDataContext)
}

export function useUserTransactions(account: string | null | undefined) {
  const transactions: [] | any = undefined

  useEffect(() => {
    async function fetchData(account: string) {
      try {
        const result = await client.query({
          query: USER_TRANSACTIONS,
          variables: {
            user: '0xadBba1EF326A33FDB754f14e62A96D5278b942Bd',
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
        allPairs: [tokenAddress],
      },
      fetchPolicy: 'cache-first',
    })
    if (result?.data) {
      console.log(result?.data)
      return result.data.swaps
    }
  } catch (e) {
    console.log(e)
    return []
  }
}
export function useTokenTransactions(tokenAddress: string) {
  const [data, setData] = useState<
    Array<{
      id: string
      amount0Out: string
      amount1In: string
      pair: {
        token0: { symbol: string }
        token1: { symbol: string }
      }
      transaction: {
        timestamp: string
      }
    }>
  >([])

  const fetchApiCallback = useCallback(async () => {
    const result = await getTokenTransactions(tokenAddress)
    setData(result)
  }, [])

  useEffect(() => {
    fetchApiCallback()
  }, [fetchApiCallback])

  return data || []
}
