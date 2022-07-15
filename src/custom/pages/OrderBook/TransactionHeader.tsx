import Column from '@src/components/Column'
import styled from 'styled-components/macro'
import { Text, Box } from 'rebass'
import Row, { RowFixed } from '@src/components/Row'
import { Field } from 'state/swap/actions'
import { useSwapActionHandlers, useSwapState } from '@src/state/swap/hooks'
import { useCurrency } from '@src/hooks/Tokens'
import { useCallback, useMemo, useState } from 'react'
import { usePairData } from '@src/custom/api/apollo/hooks'
import { formattedNum } from '@src/custom/utils'
import { ChevronDown } from 'react-feather'
import { CurrencySearchModal } from '@src/custom/components/CurrencyInputPanelNew'
import { Currency } from '@uniswap/sdk-core'
import { TYPE } from '@src/custom/theme'

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
const CurrencySelectArea = styled(RowFixed)`
  background: transparent;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
  :hover {
    background: ${({ theme }) => theme.bg2};
  }
`

export default function TransactionHeader() {
  const { INPUT, OUTPUT } = useSwapState()
  const { onCurrencySelection } = useSwapActionHandlers()

  const inputCurrency = useCurrency(INPUT?.currencyId)
  const outputCurrency = useCurrency(OUTPUT?.currencyId)

  const pairAddress = useMemo(() => {
    if (inputCurrency && inputCurrency?.symbol?.indexOf('BNB') !== -1) {
      return '0xe0e92035077c39594793e61802a350347c320cf2'
    }
    return '0xf855e52ecc8b3b795ac289f85f6fd7a99883492b'
  }, [inputCurrency])

  const pairData = usePairData(pairAddress)

  const [{ modalOpen, tradeType, selectedCurrency, otherSelectedCurrency }, setSearchModalOption] = useState<{
    modalOpen: boolean
    tradeType: Field
    selectedCurrency?: Currency | null | undefined
    otherSelectedCurrency?: Currency | null | undefined
  }>({
    modalOpen: false,
    tradeType: Field.INPUT,
  })

  const handleDismissSearch = useCallback(() => {
    setSearchModalOption({
      modalOpen: false,
      tradeType,
    })
  }, [setSearchModalOption, tradeType])

  const selectToken = useCallback(
    (type: Field) => {
      setSearchModalOption({
        modalOpen: true,
        tradeType: type,
        selectedCurrency: type == Field.INPUT ? inputCurrency : outputCurrency,
        otherSelectedCurrency: type == Field.OUTPUT ? outputCurrency : inputCurrency,
      })
    },
    [setSearchModalOption, inputCurrency, outputCurrency]
  )

  const handleSelect = useCallback(
    (inputCurrency) => onCurrencySelection(tradeType, inputCurrency),
    [onCurrencySelection, tradeType]
  )

  return (
    <>
      <CurrencySearchModal
        isOpen={modalOpen}
        onDismiss={handleDismissSearch}
        onCurrencySelect={handleSelect}
        selectedCurrency={selectedCurrency}
        otherSelectedCurrency={otherSelectedCurrency}
        showCommonBases
      />
      <TransactionHeaderWrapper>
        <RowFixed>
          <CurrencySelectArea onClick={() => selectToken(Field.INPUT)}>
            {inputCurrency ? inputCurrency.symbol : '-'} <ChevronDown />
          </CurrencySelectArea>
          <Box paddingX={'10px'}>/</Box>
          <CurrencySelectArea onClick={() => selectToken(Field.OUTPUT)}>
            {outputCurrency ? outputCurrency.symbol : '-'} <ChevronDown />
          </CurrencySelectArea>
        </RowFixed>
        <TransactionHeaderDownUp>
          <Column>
            <TYPE.main fontSize={16} lineHeight={'19px'} color="primary6">
              {pairData.pairs ? formattedNum(pairData.pairs.token0Price) : '-'}
            </TYPE.main>
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
        </TransactionHeaderDownUp>
      </TransactionHeaderWrapper>
    </>
  )
}
