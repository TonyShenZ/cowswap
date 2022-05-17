import styled from 'styled-components/macro'
import dayjs from 'dayjs'
import { Text } from 'rebass'
import { CurrencyAmount } from '@uniswap/sdk-core'
import Tabs, { Tab, TabList, TabPanels as TabComponents } from '@src/custom/components/Tabs'
import { Trans } from '@lingui/macro'
import useRecentActivity, {
  ActivityDescriptors,
  TransactionAndOrder,
  useMultipleActivityDescriptors,
} from 'hooks/useRecentActivity'

import { supportedChainId } from 'utils/supportedChainId'
import { useCallback, useMemo, useState } from 'react'
import { OrderStatus } from '@src/custom/state/orders/actions'
import { useActiveWeb3React } from '@src/hooks/web3'
import { useWalletInfo } from '@src/custom/hooks/useWalletInfo'
import { ActivityDerivedState, getActivityDerivedState } from '@src/custom/components/AccountDetails/Transaction'
import { DEFAULT_PRECISION } from '@src/custom/constants'
import { formatSmart } from '@src/custom/utils/format'
import { getExecutionPrice, getLimitPrice } from '@src/custom/state/orders/utils'
import { StatusDetails } from '@src/custom/components/AccountDetails/Transaction/StatusDetails'
import { StatusLabelBelow } from '@src/custom/components/AccountDetails/Transaction/styled'
import { LinkStyledButton } from '@src/theme'
import { CancellationModal } from '@src/custom/components/AccountDetails/Transaction/CancelationModal'

const EntrustsWrapper = styled.div`
  margin-top: 5px;
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

const TabPanels = styled(TabComponents)`
  height: 300px;
  overflow: hidden;
  overflow-y: auto;
`

const isPending = (data: TransactionAndOrder) =>
  data.status === OrderStatus.PENDING || data.status === OrderStatus.PRESIGNATURE_PENDING

const isConfirmed = (data: TransactionAndOrder) =>
  data.status === OrderStatus.FULFILLED || data.status === OrderStatus.EXPIRED || data.status === OrderStatus.CANCELLED

export default function Entrusts() {
  const { chainId: connectedChainId } = useActiveWeb3React()
  const chainId = supportedChainId(connectedChainId)

  const allRecentActivity = useRecentActivity()

  const [defaultIndex, setdefaultIndex] = useState(0)

  const { pendingActivity, confirmedActivity } = useMemo(() => {
    // Separate the array into 2: PENDING and FULFILLED(or CONFIRMED)+EXPIRED
    const pendingActivity = allRecentActivity.filter(isPending).map((data) => data.id)
    const confirmedActivity = allRecentActivity.filter(isConfirmed).map((data) => data.id)

    return {
      pendingActivity,
      confirmedActivity,
    }
  }, [allRecentActivity])

  const handleOrderSelect = useCallback(
    (i) => {
      setdefaultIndex(i)
    },
    [setdefaultIndex]
  )

  const pendActivities = useMultipleActivityDescriptors({ chainId, ids: pendingActivity }) || []
  const historyActivity = useMultipleActivityDescriptors({ chainId, ids: confirmedActivity }) || []

  return (
    <EntrustsWrapper>
      <Tabs defaultIndex={defaultIndex} onChange={handleOrderSelect}>
        <TabList justify={'start'}>
          <Tab>
            <Text fontSize={14} padding={'12px 0 10px'}>
              <Trans>Open Order</Trans>
            </Text>
          </Tab>
          <Tab>
            <Text fontSize={14} padding={'12px 0 10px'}>
              <Trans>Order history</Trans>
            </Text>
          </Tab>
        </TabList>
        <TabPanels style={{ padding: '0' }}>
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
                  <Text fontSize={12}>Time</Text>
                </th>
                <th>
                  <Text fontSize={12}>Price</Text>
                </th>
                <th>
                  <Text fontSize={12}>Side</Text>
                </th>
                <th>
                  <Text fontSize={12}>Status</Text>
                </th>
              </tr>
            </thead>
            <tbody>{defaultIndex ? renderActivities(historyActivity) : renderActivities(pendActivities)}</tbody>
          </TableWrapper>
        </TabPanels>
      </Tabs>
    </EntrustsWrapper>
  )
}

function renderActivities(activities: ActivityDescriptors[]) {
  return activities
    .filter((x) => x.summary?.indexOf('Approve') == -1)
    .map((activity) => <Activity key={activity.id} activity={activity} />)
}

function Activity({ activity: activityData }: { activity: ActivityDescriptors }) {
  const { chainId } = useActiveWeb3React()
  const { allowsOffchainSigning, gnosisSafeInfo } = useWalletInfo()

  // Get some derived information about the activity. It helps to simplify the rendering of the sub-components
  const activityDerivedState = useMemo(
    () => getActivityDerivedState({ chainId, activityData, allowsOffchainSigning, gnosisSafeInfo }),
    [chainId, activityData, allowsOffchainSigning, gnosisSafeInfo]
  )

  if (!activityDerivedState || !chainId) return null
  const { activityLinkUrl } = activityDerivedState
  const hasLink = activityLinkUrl !== null

  const creationTimeEnhanced = activityDerivedState?.enhancedTransaction?.addedTime
  const creationTimeOrder = activityDerivedState?.order?.creationTime
  const creationTimeFull = creationTimeEnhanced
    ? new Date(creationTimeEnhanced)
    : creationTimeOrder
    ? new Date(Date.parse(creationTimeOrder))
    : undefined

  const timeFormatOptionHM: Intl.DateTimeFormatOptions = {
    timeStyle: 'short',
  }

  // Hour:Minute
  const creationTime = creationTimeFull?.toLocaleString(undefined, timeFormatOptionHM)

  return (
    <ActivityDetails
      chainId={chainId}
      activityDerivedState={activityDerivedState}
      activityLinkUrl={activityLinkUrl ?? undefined}
      disableMouseActions={!hasLink}
      creationTime={creationTime && creationTime}
    />
  )
}

interface OrderSummaryType {
  from: string | undefined
  to: string | undefined
  limitPrice: string | undefined
  executionPrice?: string | undefined
  validTo: string | undefined
  fulfillmentTime?: string | undefined
  kind?: string
}

const DEFAULT_ORDER_SUMMARY = {
  from: '',
  to: '',
  limitPrice: '',
  validTo: '',
}

function ActivityDetails(props: {
  chainId: number
  activityDerivedState: ActivityDerivedState
  activityLinkUrl: string | undefined
  disableMouseActions: boolean | undefined
  creationTime?: string | undefined
}) {
  const [showCancelModal, setShowCancelModal] = useState(false)
  const { activityDerivedState, chainId } = props
  const { id, isOrder, summary, order, enhancedTransaction, isCancellable } = activityDerivedState

  if (!order && !enhancedTransaction) return null

  // Order Summary default object
  let orderSummary: OrderSummaryType
  if (order) {
    const { inputToken, sellAmount, feeAmount, outputToken, buyAmount, validTo, kind, fulfillmentTime } = order

    const sellAmt = CurrencyAmount.fromRawAmount(inputToken, sellAmount.toString())
    const feeAmt = CurrencyAmount.fromRawAmount(inputToken, feeAmount.toString())
    const outputAmount = CurrencyAmount.fromRawAmount(outputToken, buyAmount.toString())
    const sellTokenDecimals = order?.inputToken?.decimals ?? DEFAULT_PRECISION
    const buyTokenDecimals = order?.outputToken?.decimals ?? DEFAULT_PRECISION

    const limitPrice = formatSmart(
      getLimitPrice({
        buyAmount: order.buyAmount.toString(),
        sellAmount: order.sellAmount.toString(),
        buyTokenDecimals,
        sellTokenDecimals,
        inverted: true, // TODO: handle invert price
      })
    )

    let executionPrice: string | undefined
    if (order.apiAdditionalInfo && order.status === OrderStatus.FULFILLED) {
      const { executedSellAmountBeforeFees, executedBuyAmount } = order.apiAdditionalInfo
      executionPrice = formatSmart(
        getExecutionPrice({
          executedSellAmountBeforeFees,
          executedBuyAmount,
          buyTokenDecimals,
          sellTokenDecimals,
          inverted: true, // TODO: Handle invert price
        })
      )
    }

    const getPriceFormat = (price: string): string => {
      return `${price} ${sellAmt.currency.symbol} per ${outputAmount.currency.symbol}`
    }

    const DateFormatOptions: Intl.DateTimeFormatOptions = {
      dateStyle: 'medium',
      timeStyle: 'short',
    }

    orderSummary = {
      ...DEFAULT_ORDER_SUMMARY,
      from: `${formatSmart(sellAmt.add(feeAmt))} ${sellAmt.currency.symbol}`,
      to: `${formatSmart(outputAmount)} ${outputAmount.currency.symbol}`,
      limitPrice: limitPrice && getPriceFormat(limitPrice),
      executionPrice: executionPrice && getPriceFormat(executionPrice),
      validTo: validTo ? dayjs.unix(validTo as number).format('YYYY-MM-DD HH:mm') : undefined,
      // validTo? new Date((validTo as number) * 1000).toLocaleString(undefined, DateFormatOptions) : undefined
      fulfillmentTime: fulfillmentTime
        ? new Date(fulfillmentTime).toLocaleString(undefined, DateFormatOptions)
        : undefined,
      kind: kind.toString(),
    }
  } else {
    orderSummary = DEFAULT_ORDER_SUMMARY
  }

  const { kind, from, to, limitPrice, validTo } = orderSummary

  const activityName = isOrder ? `${kind} order` : 'Transaction'

  const onCancelClick = () => setShowCancelModal(true)
  const onDismiss = () => setShowCancelModal(false)

  return (
    <tr>
      <td align={'center'}>{from}</td>
      <td align={'center'}>{to}</td>
      <td align={'center'}>{validTo}</td>
      <td align={'center'}>{limitPrice}</td>
      <td align={'center'}>{activityName}</td>
      <td align={'center'}>
        {isCancellable ? (
          <StatusLabelBelow>
            {/* Cancel order */}
            <LinkStyledButton onClick={onCancelClick}>Cancel order</LinkStyledButton>
            {showCancelModal && (
              <CancellationModal
                chainId={chainId}
                orderId={id}
                summary={summary}
                isOpen={showCancelModal}
                onDismiss={onDismiss}
              />
            )}
          </StatusLabelBelow>
        ) : (
          <StatusDetails chainId={chainId} activityDerivedState={activityDerivedState} />
        )}
      </td>
    </tr>
  )
}
