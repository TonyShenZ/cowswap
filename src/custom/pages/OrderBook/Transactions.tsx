import styled from 'styled-components/macro'
import { Text } from 'rebass'
import Tabs, { Tab, TabList, TabPanel, TabPanels } from '@src/custom/components/Tabs'
import { Trans } from '@lingui/macro'
import { hasTrades } from '@src/custom/utils/trade'
import { retry, RetryOptions } from 'utils/retry'
import { useActiveWeb3React } from '@src/hooks/web3'
import { getTrades } from '@src/custom/api/gnosisProtocol'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useReferralAddress, useResetReferralAddress } from '@src/custom/state/affiliate/hooks'
import useRecentActivity from '@src/custom/hooks/useRecentActivity'
import { OrderStatus } from '@src/custom/state/orders/actions'
import { useHistory } from 'react-router-dom'

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
type AffiliateStatus = 'NOT_CONNECTED' | 'OWN_LINK' | 'ACTIVE' | 'UNSUPPORTED_NETWORK'
const DEFAULT_RETRY_OPTIONS: RetryOptions = { n: 3, minWait: 1000, maxWait: 3000 }

export default function Transactions() {
  const { account, chainId } = useActiveWeb3React()
  const getTradesObj = useCallback(() => {
    if (!account || !chainId) {
      return
    }
    getTrades({ owner: account, chainId }).then((res) => console.log(res))
  }, [account, chainId])

  useEffect(() => {
    getTradesObj()
  }, [])

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
                    <Text fontSize={12}>From</Text>
                  </th>
                  <th>
                    <Text fontSize={12}>To</Text>
                  </th>
                  <th>
                    <Text fontSize={12}>Price</Text>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td align={'left'}>1</td>
                  <td align={'left'}>2</td>
                  <td align={'left'}>3</td>
                </tr>
              </tbody>
            </TableWrapper>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </TransactionsWrapper>
  )
}
