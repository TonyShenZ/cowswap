import { AutoColumn } from '@src/components/Column'
import { TYPE } from '@src/custom/theme/cowSwapTheme'
import { useCallback, useContext, useState } from 'react'
import { ThemeContext } from 'styled-components/macro'

import styled from 'styled-components/macro'
import Input from '@src/components/NumericalInput'
import { InputPanel } from '../CurrencyInputPanel/CurrencyInputPanelMod'
import { RowBetween } from '@src/components/Row'
import { ButtonEmpty } from '../Button'

const InputPanelWrapper = styled(InputPanel)`
  padding: 10px;
  border-radius: 12px;
  background: #16171a;
`
const InputWrapper = styled(Input)`
  width: 90%;
  background: transparent;
`
const ButtonLink = styled(ButtonEmpty)`
  width: auto;
`

export default function ModalHeader() {
  const theme = useContext(ThemeContext)

  const [nvalue, setValue] = useState('0')
  console.log(nvalue)

  const onUserVolInput = useCallback(
    (num: string) => {
      console.log(num)

      setValue(num)
    },
    [setValue]
  )
  return (
    <AutoColumn gap={'4px'} style={{ marginTop: '1rem' }}>
      <AutoColumn gap={'8px'}>
        <TYPE.body color={theme.text5} fontWeight={700} fontSize={14}>
          Available Balance: 3050.50 BNB
        </TYPE.body>

        <InputPanelWrapper hideInput={false}>
          <RowBetween>
            <InputWrapper height={48} value={nvalue} onUserInput={onUserVolInput} />
            <ButtonLink>MAX</ButtonLink>
          </RowBetween>
        </InputPanelWrapper>
      </AutoColumn>

      <AutoColumn justify="flex-start" gap="sm" style={{ padding: '.75rem 1rem' }}>
        <TYPE.italic fontWeight={700} fontSize={14} textAlign="left" color={theme.primary8} style={{ width: '100%' }}>
          {`
          The amount of ibTokens you'll receive is worth the same as the amount of tokens you deposited. There is no fee
          and you are not losing any value. Their exchange rate is not 1:1.
          `}
        </TYPE.italic>
      </AutoColumn>
    </AutoColumn>
  )
}
