import Column from '@src/components/Column'
import styled from 'styled-components/macro'
import { Text } from 'rebass'
import Row from '@src/components/Row'
import { useSwapState } from '@src/state/swap/hooks'
import { useCurrency } from '@src/hooks/Tokens'
import { useMemo } from 'react'
import { usePairData } from '@src/custom/api/apollo/hooks'
import { formattedNum } from '@src/custom/utils'

const TransactionHeaderWrapper = styled(Row)`
  display: grid;
  grid-template-columns: 200px 1fr;
  grid-gap: 5px;
  background: ${({ theme }) => theme.bg9};
  padding: 18px 16px;
`

const TransactionHeaderDownUp = styled.div`
  width: fit-content;
  display: grid;
  grid-template-columns: repeat(6, auto);
  grid-column-gap: 32px;
`

export default function TransactionHeader() {
  const { INPUT, OUTPUT } = useSwapState()

  const inputCurrency = useCurrency(INPUT?.currencyId)
  const outputCurrency = useCurrency(OUTPUT?.currencyId)

  const pairAddress = useMemo(() => {
    if (inputCurrency && inputCurrency?.symbol?.indexOf('BNB') !== -1) {
      return '0xe0e92035077c39594793e61802a350347c320cf2'
    }
    return '0xf855e52ecc8b3b795ac289f85f6fd7a99883492b'
  }, [inputCurrency])

  const pairData = usePairData(pairAddress)

  return (
    <TransactionHeaderWrapper>
      <div>
        {inputCurrency ? inputCurrency.symbol : '-'}/{outputCurrency ? outputCurrency.symbol : '-'}
      </div>
      <TransactionHeaderDownUp>
        <Column>
          <Text fontSize={16} lineHeight={'19px'}>
            {pairData.pairs ? formattedNum(pairData.pairs.token0Price) : '-'}
          </Text>
          <Text fontSize={12} lineHeight={'14px'}>
            $ {pairData.pairs ? formattedNum(pairData.pairs.token0Price) : '-'}
          </Text>
        </Column>
        <Column>
          <Text fontSize={12} lineHeight={'14px'}>
            24h change
          </Text>
          <Text fontSize={14} lineHeight={'16px'}>
            $ -
          </Text>
        </Column>
        <Column>
          <Text fontSize={14} lineHeight={'16px'}>
            Total Liquidity
          </Text>
          <Text fontSize={14} lineHeight={'16px'}>
            $ {pairData.pairs ? formattedNum(pairData.pairs.reserveUSD) : '-'}
          </Text>
        </Column>
        <Column>
          <Text fontSize={14} lineHeight={'16px'}>
            Volume(24h)
          </Text>
          <Text fontSize={14} lineHeight={'16px'}>
            {pairData.pairDayDatas ? formattedNum(pairData.pairDayDatas) : '-'}
          </Text>
        </Column>
        <Column>
          <Text fontSize={14} lineHeight={'16px'}>
            24h High
          </Text>
          <Text fontSize={14} lineHeight={'16px'}>
            -
          </Text>
        </Column>
        <Column>
          <Text fontSize={14} lineHeight={'16px'}>
            24h Low
          </Text>
          <Text fontSize={14} lineHeight={'16px'}>
            -
          </Text>
        </Column>
      </TransactionHeaderDownUp>
    </TransactionHeaderWrapper>
  )
}
