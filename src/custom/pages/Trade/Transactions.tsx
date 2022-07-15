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
import { useBlockToTime, useTokenTransactions } from '@src/custom/api/apollo/hooks'
import { formattedNum } from '@src/custom/utils'
import { useSwapState } from '@src/custom/state/swap/hooks'

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
const BuysellSpan = styled.span<{ colors: string }>`
  color: ${({ colors }) => colors};
`

export default function Transactions() {
  const { account, chainId } = useActiveWeb3React()

  const { INPUT } = useSwapState()

  const inputCurrency = useCurrency(INPUT?.currencyId)

  // const transactions = useUserTransactions(account)

  const recentTransactions = useTokenTransactions('0xe0e92035077c39594793e61802a350347c320cf2')

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
              <Trans>Recent transactions</Trans>
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
            <TableWrapper>
              <thead>
                <tr>
                  {/* <th>
                    <Text fontSize={12}>total</Text>
                  </th> */}
                  <th>
                    <Text fontSize={12}>Price</Text>
                  </th>
                  <th align="right">
                    <Text fontSize={12}>Amount </Text>
                  </th>
                  <th>
                    <Text fontSize={12}>Time</Text>
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions?.length > 0 &&
                  recentTransactions.map((item, index) => (
                    <tr key={item.hash + index}>
                      <td>
                        <BuysellSpan colors={inputCurrency?.symbol == item.token1Symbol ? '#E74358' : '#1ED392'}>
                          {inputCurrency?.symbol == item.token1Symbol
                            ? formattedNum(String(item.token0Amount / item.token1Amount))
                            : formattedNum(String(item.token1Amount / item.token0Amount))}
                        </BuysellSpan>
                      </td>
                      {/* <td align={'right'}>
                        <>
                          <BuysellSpan colors={inputCurrency?.symbol == item.token1Symbol ? '#E74358' : '#1ED392'}>
                            {formattedNum(item.token1Amount.toString()) + ' '} {''}
                          </BuysellSpan>
                          {item.token1Symbol}
                        </>
                      </td> */}
                      <td align={'right'}>
                        {inputCurrency?.symbol == item.token1Symbol ? (
                          <>
                            {formattedNum(item.token1Amount.toString()) + ' '}
                            {item.token1Symbol}
                          </>
                        ) : (
                          <>
                            {formattedNum(item.token0Amount.toString()) + ' '}
                            {item.token0Symbol}
                          </>
                        )}
                      </td>
                      <td align={'center'} width={80}>
                        {dayjs.unix(item.timestamp as unknown as number).format('HH:mm:ss')}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </TableWrapper>
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

  const blockTime = useBlockToTime(activity.blockNumber)

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
    time: blockTime ? dayjs.unix(blockTime as unknown as number).format('HH:mm:ss') : undefined,
  }
  const { form, to, time } = orderSummary

  return (
    <tr>
      <td align={'right'}>{form}</td>
      <td align={'right'}>{to}</td>
      <td align={'left'}>{time}</td>
    </tr>
  )
}
