import Column from '@src/components/Column'
import styled from 'styled-components/macro'
import { Text } from 'rebass'
import Row from '@src/components/Row'
import { useSwapState } from '@src/state/swap/hooks'
import { useCurrency } from '@src/hooks/Tokens'

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

  return (
    <TransactionHeaderWrapper>
      <div>
        {inputCurrency ? inputCurrency.symbol : '-'}/{outputCurrency ? outputCurrency.symbol : '-'}
      </div>
      <TransactionHeaderDownUp>
        <Column>
          <Text fontSize={16} lineHeight={'19px'}>
            442.9
          </Text>
          <Text fontSize={12} lineHeight={'14px'}>
            $442.90
          </Text>
        </Column>
        <Column>
          <Text fontSize={12} lineHeight={'14px'}>
            24h change
          </Text>
          <Text fontSize={14} lineHeight={'16px'}>
            $4.2703
          </Text>
        </Column>
        <Column>
          <Text fontSize={14} lineHeight={'16px'}>
            Total Liquidity
          </Text>
          <Text fontSize={14} lineHeight={'16px'}>
            $4,401,928
          </Text>
        </Column>
        <Column>
          <Text fontSize={14} lineHeight={'16px'}>
            Volume(24h)
          </Text>
          <Text fontSize={14} lineHeight={'16px'}>
            407.94k
          </Text>
        </Column>
        <Column>
          <Text fontSize={14} lineHeight={'16px'}>
            24h High
          </Text>
          <Text fontSize={14} lineHeight={'16px'}>
            445.27
          </Text>
        </Column>
        <Column>
          <Text fontSize={14} lineHeight={'16px'}>
            24h Low
          </Text>
          <Text fontSize={14} lineHeight={'16px'}>
            439.27
          </Text>
        </Column>
      </TransactionHeaderDownUp>
    </TransactionHeaderWrapper>
  )
}
