import styled from 'styled-components/macro'
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
          <TabPanel></TabPanel>
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
