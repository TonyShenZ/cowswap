import gql from 'graphql-tag'

export const USER_TRANSACTIONS = gql`
  query transactions($user: Bytes!) {
    mints(orderBy: timestamp, orderDirection: desc, where: { to: $user }) {
      id
      transaction {
        id
        timestamp
      }
      pair {
        id
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      to
      liquidity
      amount0
      amount1
      amountUSD
    }
    burns(orderBy: timestamp, orderDirection: desc, where: { sender: $user }) {
      id
      transaction {
        id
        timestamp
      }
      pair {
        id
        token0 {
          symbol
        }
        token1 {
          symbol
        }
      }
      sender
      to
      liquidity
      amount0
      amount1
      amountUSD
    }
    swaps(orderBy: timestamp, orderDirection: desc, where: { to: $user }) {
      id
      transaction {
        id
        timestamp
      }
      pair {
        token0 {
          symbol
        }
        token1 {
          symbol
        }
      }
      amount0In
      amount0Out
      amount1In
      amount1Out
      amountUSD
      to
    }
  }
`

export const FILTERED_TRANSACTIONS = gql`
  query ($allPairs: String!) {
    swaps(first: 30, where: { pair: $allPairs }, orderBy: timestamp, orderDirection: desc) {
      transaction {
        id
        timestamp
      }
      id
      pair {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      amount0In
      amount0Out
      amount1In
      amount1Out
      amountUSD
      to
    }
  }
`

export const BLOCK_TIME = gql`
  query ($number: Int!) {
    blocks(first: 1, orderBy: number, orderDirection: desc, where: { number: $number }) {
      number
      timestamp
    }
  }
`

// pairs 最新价格
// pairDayDatas 成交额
export const HEADER_QUOTES = gql`
  query ($allPairs: String!) {
    pairDayDatas(first: 1, where: { pairAddress: $allPairs }) {
      dailyVolumeToken0
    }
    pairs(first: 1, where: { id: $allPairs }) {
      id
      token0Price
      reserveUSD
    }
  }
`
