import styled from 'styled-components/macro'
import { CurrencyAmount } from '@uniswap/sdk-core'
import { Text } from 'rebass'
import { RowFixed } from '@src/components/Row'
import { getBuyAndSellOrders, OrderMetaData } from '@src/custom/api/gnosisProtocol'
import { useCurrency } from '@src/hooks/Tokens'
import { useSwapState } from '@src/state/swap/hooks'
import { useCallback, useMemo, useState } from 'react'
import { useActiveWeb3React } from '@src/hooks/web3'
import useInterval from '@src/hooks/useInterval'
import { formatSmart } from '@src/custom/utils/format'
import { getLimitPrice } from '@src/custom/state/orders/utils'
import { usePairData } from '@src/custom/api/apollo/hooks'
import { formattedNum } from '@src/custom/utils'

const HandicapWrapper = styled.div`
  background: ${({ theme }) => theme.bg9};
`
const HandicapOrderWrapper = styled.div`
  width: 100%;
  height: 100%;
  padding: 0 15px;
  #buy,
  #sell {
    min-height: calc((100% - 43px) / 2);
  }
`
const OrderItem = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
`
const OrderHeader = styled(OrderItem)`
  padding: 16px 0;
  border-bottom: 0;
  color: ${({ theme }) => theme.text3};
  font-size: 12px;
  font-weight: bold;
`
export default function Handicap() {
  const { INPUT, OUTPUT } = useSwapState()
  const { chainId } = useActiveWeb3React()

  const inputCurrency = useCurrency(INPUT?.currencyId)
  const outputCurrency = useCurrency(OUTPUT?.currencyId)

  const pairAddress = useMemo(() => {
    if (inputCurrency && inputCurrency?.symbol?.indexOf('BNB') !== -1) {
      return '0xe0e92035077c39594793e61802a350347c320cf2'
    }
    return '0xf855e52ecc8b3b795ac289f85f6fd7a99883492b'
  }, [inputCurrency])

  const pairData = usePairData(pairAddress)

  const [{ sellList, buyList }, setList] = useState<{ sellList: OrderMetaData[]; buyList: OrderMetaData[] }>({
    sellList: [],
    buyList: [],
  })

  const getList = useCallback(async () => {
    if (!INPUT?.currencyId || !OUTPUT?.currencyId || !chainId) return

    const sell = await getBuyAndSellOrders(chainId, INPUT?.currencyId, OUTPUT?.currencyId)
    const buy = await getBuyAndSellOrders(chainId, OUTPUT?.currencyId, INPUT?.currencyId)

    setList({
      sellList: sell,
      buyList: buy,
    })
  }, [chainId, INPUT, OUTPUT, setList])

  useInterval(getList, !INPUT?.currencyId || !OUTPUT?.currencyId || !chainId ? null : 5000)

  return (
    <HandicapWrapper>
      <HandicapOrderWrapper>
        <OrderHeader>
          <Text>Pcice({outputCurrency?.symbol})</Text>
          <Text>Amout({inputCurrency?.symbol})</Text>
          <Text>Total</Text>
        </OrderHeader>
        <div id="sell">{sellList && sellList.map((item) => <CompileOrderItem key={item.uid} order={item} />)}</div>

        <RowFixed gap="4px" padding={'10px 0'}>
          <Text fontSize={20} lineHeight={'23px'} marginRight={'4px'}>
            {pairData.pairs ? formattedNum(pairData.pairs.token0Price) : '-'}
          </Text>
          <svg width="9" height="14" viewBox="0 0 9 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M4.03366 0L0 4.59104L1.00884 5.73929L3.32772 3.099V13.6582H4.73959V3.099L7.05933 5.73929L8.06731 4.59104L4.03366 0Z"
              fill="#1ED392"
            />
          </svg>
          <Text fontSize={14} marginLeft={'5px'}>
            ${formattedNum(pairData.pairs.token0Price)}
          </Text>
        </RowFixed>
        <div id="buy">{buyList && buyList.map((item) => <CompileBuyOrderItem key={item.uid} order={item} />)}</div>
      </HandicapOrderWrapper>
    </HandicapWrapper>
  )
}

function CompileOrderItem({ order }: { order: OrderMetaData }) {
  const sell = useCurrency(order.sellToken)
  const buy = useCurrency(order.buyToken)
  if (!sell || !buy) return null

  const sellAmt = CurrencyAmount.fromRawAmount(sell, order.sellAmount.toString())
  const buyAmt = CurrencyAmount.fromRawAmount(buy, order.buyAmount.toString())

  const limitPrice = formatSmart(
    getLimitPrice({
      buyAmount: order.sellAmount.toString(),
      sellAmount: order.buyAmount.toString(),
      buyTokenDecimals: sell.decimals,
      sellTokenDecimals: buy.decimals,
      inverted: true, // TODO: handle invert price
    })
  )
  return (
    <OrderItem>
      <Text fontSize={12} color="#E74358">
        {limitPrice}
      </Text>
      <Text fontSize={12}>{sellAmt.toSignificant(3)}</Text>
      <Text fontSize={12}>{buyAmt.toSignificant(3)}</Text>
    </OrderItem>
  )
}

function CompileBuyOrderItem({ order }: { order: OrderMetaData }) {
  const token0 = useCurrency(order.buyToken)
  const token1 = useCurrency(order.sellToken)
  if (!token0 || !token1) return null

  const token0Amt = CurrencyAmount.fromRawAmount(token0, order.sellAmount.toString())
  const token1Amt = CurrencyAmount.fromRawAmount(token1, order.buyAmount.toString())

  const limitPrice = formatSmart(
    getLimitPrice({
      buyAmount: token1Amt.toExact(),
      sellAmount: token0Amt.toExact(),
      buyTokenDecimals: token1.decimals,
      sellTokenDecimals: token0.decimals,
      inverted: true, // TODO: handle invert price
    })
  )
  return (
    <OrderItem>
      <Text fontSize={12} color="#1ED392">
        {limitPrice}
      </Text>
      <Text fontSize={12}>{token1Amt.toSignificant(3)}</Text>
      <Text fontSize={12}>{token0Amt.toSignificant(3)}</Text>
    </OrderItem>
  )
}
