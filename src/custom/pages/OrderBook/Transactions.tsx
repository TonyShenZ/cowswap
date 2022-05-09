import styled from 'styled-components/macro'
import dayjs from 'dayjs'
import { CurrencyAmount } from '@uniswap/sdk-core'
import { Text } from 'rebass'
import Tabs, { Tab, TabList, TabPanel, TabPanels } from '@src/custom/components/Tabs'
import { Trans } from '@lingui/macro'
import { useActiveWeb3React } from '@src/hooks/web3'
import { getTrades } from '@src/custom/api/gnosisProtocol'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { TradeMetaData } from '@src/custom/api/gnosisProtocol/api'
import { useCurrency } from '@src/hooks/Tokens'
import { formatSmart } from '@src/custom/utils/format'
import { useTokenTransactions, useUserTransactions } from '@src/custom/api/apollo/hooks'

const TransactionsWrapper = styled.div`
  background: ${({ theme }) => theme.bg9};
`
const TableWrapper = styled.table`
  width: 100%;
  padding: 0 15px;
  thead {
    border-radius: 3px;
    tr {
      th {
        padding: 16px 0;
        border-bottom: 0;
        color: ${({ theme }) => theme.text3};
        font-size: 12px;
      }
    }
  }
  tbody {
    tr {
      & > :not(:first-child) {
        margin: 10px 0;
      }
      td {
        font-size: 12px;
      }
    }
  }
`

export default function Transactions() {
  const { account, chainId } = useActiveWeb3React()

  // const transactions = useUserTransactions(account)

  const recentTransactions = useTokenTransactions('0xf855e52ecc8b3b795ac289f85f6fd7a99883492b')

  const [trades, setTrades] = useState<TradeMetaData[]>([])
  // console.log('trades get', trades)

  const getTradesObj = useCallback(async () => {
    if (!account || !chainId) {
      return
    }
    const data = await getTrades({ owner: account, chainId })
    if (data) {
      setTrades(data)
    } else {
      setTrades([])
    }
  }, [account, chainId])

  useEffect(() => {
    getTradesObj()
  }, [getTradesObj])

  return (
    <TransactionsWrapper>
      <Tabs defaultIndex={1}>
        <TabList justify={'flex-start'}>
          <Tab>
            <Text fontSize={14} padding={'12px 0 10px'}>
              <Trans>recent transactions</Trans>
            </Text>
          </Tab>
          <Tab>
            <Text fontSize={14} padding={'12px 0 10px'}>
              <Trans>My transaction</Trans>
            </Text>
          </Tab>
        </TabList>
        <TabPanels style={{ padding: '0' }}>
          <TabPanel>
            {recentTransactions && recentTransactions.length > 0 && (
              <TableWrapper>
                <thead>
                  <tr>
                    <th align="left">
                      <Text fontSize={12}>Price ({recentTransactions[0].pair.token0.symbol})</Text>
                    </th>
                    <th align="right">
                      <Text fontSize={12}>Amount ({recentTransactions[0].pair.token1.symbol})</Text>
                    </th>
                    <th>
                      <Text fontSize={12}>Time</Text>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((item) => (
                    <tr key={item.id}>
                      <td align={'left'}>{formattedNum(item?.amount0Out)}</td>
                      <td align={'right'}>{formattedNum(item?.amount1In)}</td>
                      <td align={'center'} width={80}>
                        {dayjs(item.transaction.timestamp).format('HH:mm:ss')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </TableWrapper>
            )}
          </TabPanel>

          <TabPanel>
            <TableWrapper>
              <thead>
                <tr>
                  <th>
                    <Text fontSize={12}>Form</Text>
                  </th>
                  <th>
                    <Text fontSize={12}>To</Text>
                  </th>
                  <th>
                    <Text fontSize={12}>Time</Text>
                  </th>
                </tr>
              </thead>
              <tbody>{trades && renderTrades(trades)}</tbody>
            </TableWrapper>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </TransactionsWrapper>
  )
}

function renderTrades(trades: TradeMetaData[]) {
  return trades.map((trade) => <Activity key={trade.orderUid} activity={trade} />)
}

function Activity({ activity }: { activity: TradeMetaData }) {
  const sellToken = useCurrency(activity.sellToken)
  const buyToken = useCurrency(activity.buyToken)

  const sellAmt = useMemo(() => {
    if (!sellToken) return
    return CurrencyAmount.fromRawAmount(sellToken, activity.sellAmount)
  }, [sellToken, activity.sellAmount])

  const buyAmt = useMemo(() => {
    if (!buyToken) return
    return CurrencyAmount.fromRawAmount(buyToken, activity.buyAmount)
  }, [buyToken, activity.buyAmount])

  let orderSummary: {
    form: string
    to: string
    time: string | undefined
  }

  // eslint-disable-next-line
  orderSummary = {
    form: `${formatSmart(sellAmt)} ${sellAmt?.currency.symbol}`,
    to: `${formatSmart(buyAmt)} ${buyAmt?.currency.symbol}`,
    time: activity.blockNumber.toString(),
  }
  const { form, to, time } = orderSummary

  return (
    <tr>
      <td align={'left'}>{form}</td>
      <td align={'left'}>{to}</td>
      <td align={'left'}>{time}</td>
    </tr>
  )
}

export const formattedNum = (number: string, usd = false, acceptNegatives = false) => {
  const num = parseFloat(number)

  if (num > 500000000) {
    return num.toFixed(0)
  }

  if (num === 0) {
    return 0
  }

  if (num < 0.0001 && num > 0) {
    return '< 0.0001'
  }

  if (num > 1000) {
    return Number(num.toFixed(0)).toLocaleString()
  }

  return Number(num.toFixed(4)).toString()
}
