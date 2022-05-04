import styled from 'styled-components/macro'
import { Text } from 'rebass'
import { RowFixed } from '@src/components/Row'
import { useGpBuyAndSellOrders } from '@src/custom/api/gnosisProtocol/hooks'
import { formatEther } from '@ethersproject/units'
import { BigNumber } from '@ethersproject/bignumber'
import { formatNumber } from '@src/custom/utils'
import { useCurrency } from '@src/hooks/Tokens'
import { useSwapState } from '@src/state/swap/hooks'

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

  const inputCurrency = useCurrency(INPUT?.currencyId)
  const outputCurrency = useCurrency(OUTPUT?.currencyId)

  const buyList = useGpBuyAndSellOrders(inputCurrency?.wrapped.address, outputCurrency?.wrapped?.address)
  const sellList = useGpBuyAndSellOrders(outputCurrency?.wrapped?.address, outputCurrency?.wrapped?.address)

  return (
    <HandicapWrapper>
      <HandicapOrderWrapper>
        <OrderHeader>
          <Text>Pcice({inputCurrency?.symbol})</Text>
          <Text>Amout({outputCurrency?.symbol})</Text>
          <Text>Turnover</Text>
        </OrderHeader>
        <div id="sell">
          {sellList &&
            sellList.map((item) => (
              <OrderItem key={item.uid}>
                <Text fontSize={12}>
                  {formatNumber(formatEther(BigNumber.from(item.sellAmount).div(item.buyAmount)))}
                </Text>
                <Text fontSize={12}>{formatNumber(formatEther(BigNumber.from(item.sellAmount)))}</Text>
                <Text fontSize={12}>{formatNumber(formatEther(BigNumber.from(item.buyAmount)))}</Text>
              </OrderItem>
            ))}
        </div>

        <RowFixed gap="4px" padding={'10px 0'}>
          <Text fontSize={20} lineHeight={'23px'} marginRight={'4px'}>
            000.0
          </Text>
          <svg width="9" height="14" viewBox="0 0 9 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M4.03366 0L0 4.59104L1.00884 5.73929L3.32772 3.099V13.6582H4.73959V3.099L7.05933 5.73929L8.06731 4.59104L4.03366 0Z"
              fill="#1ED392"
            />
          </svg>
          <Text fontSize={14} marginLeft={'5px'}>
            $000.00
          </Text>
        </RowFixed>
        <div id="buy">
          {buyList &&
            buyList.map((item) => (
              <OrderItem key={item.uid}>
                <Text fontSize={12}>
                  {formatNumber(formatEther(BigNumber.from(item.buyAmount).div(item.sellAmount)))}
                </Text>
                <Text fontSize={12}>{formatNumber(formatEther(BigNumber.from(item.buyAmount)))}</Text>
                <Text fontSize={12}>{formatNumber(formatEther(BigNumber.from(item.sellAmount)))}</Text>
              </OrderItem>
            ))}
        </div>
      </HandicapOrderWrapper>
    </HandicapWrapper>
  )
}
