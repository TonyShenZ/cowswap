import { useCallback, useContext, useState } from 'react'
import { Text } from 'rebass'
import { Trans } from '@lingui/macro'
import Row, { AutoRow, RowBetween } from '@src/components/Row'
import { RouteComponentProps } from 'react-router-dom'
import { format, LendBackground, LendCard } from '.'
import { parseEther } from '@ethersproject/units'
import { useCurrency } from '@src/hooks/Tokens'
import { useTokenBalance } from '@src/state/wallet/hooks'
import { useActiveWeb3React } from '@src/hooks/web3'
import { useVaultContract } from '@src/custom/hooks/useContract'
import { AutoColumn } from '@src/components/Column'
import { TYPE } from '@src/custom/theme/cowSwapTheme'
import styled, { ThemeContext } from 'styled-components/macro'
import { InputPanel } from '@src/custom/components/CurrencyInputPanel/CurrencyInputPanelMod'
import Input from '@src/components/NumericalInput'
import { ButtonEmpty, ButtonError, ButtonLight } from '@src/custom/components/Button'

import { useAddPopup, useWalletModalToggle } from '@src/custom/state/application/hooks'
import CurrencyLogo from '@src/custom/components/CurrencyLogo'
import { Dots } from '@src/pages/Pool/styleds'

const InputPanelWrapper = styled(InputPanel)`
  padding: 10px;
  border-radius: 12px;
  background: ${({ theme }) => theme.bg9}; ;
`
const InputWrapper = styled(Input)`
  width: 90%;
  background: transparent;
`
const ButtonLink = styled(ButtonEmpty)`
  width: auto;
  color: ${({ theme }) => theme.primary6};
`

export default function LendPage({
  match: {
    params: { getAddress, payAddress },
  },
}: RouteComponentProps<{ getAddress: string; payAddress: string }>) {
  const { account } = useActiveWeb3React()
  const theme = useContext(ThemeContext)
  const toggleWalletModal = useWalletModalToggle() // toggle wallet when disconnected

  const getVaultContract = useVaultContract(getAddress)

  const addPopup = useAddPopup()

  const getTokenCurrency = useCurrency(getAddress)
  const payTokenCurrency = useCurrency(payAddress)

  const getTokenBalance = useTokenBalance(account ?? undefined, getTokenCurrency?.wrapped ?? undefined)

  const [amountValue, setAmountValue] = useState('')

  const [confimIng, setConfimIng] = useState(false)

  const handleWithdraw = useCallback(() => {
    if (!amountValue) return
    try {
      setConfimIng(true)
      const amountToken = parseEther(amountValue)
      getVaultContract
        .withdraw(amountToken)
        .then(async (response) => {
          const { wait } = response
          await wait()
            .then((res) => {
              addPopup(
                {
                  txn: {
                    hash: res.transactionHash,
                    success: res.status ? true : false,
                    summary: `Withdraw ${amountValue} ${payTokenCurrency?.symbol} to ${amountValue} ${getTokenCurrency?.symbol}`,
                  },
                },
                res.transactionHash
              )
            })
            .finally(() => {
              setConfimIng(false)
              setAmountValue('')
            })
        })
        .catch((err) => {
          console.log(err)
          setConfimIng(false)
          setAmountValue('')
        })
    } catch (error) {
      console.error('[InvestOption]: Issue withdraw.', error)
    }
  }, [getVaultContract, amountValue, getTokenCurrency, payTokenCurrency, addPopup])

  const onUserAmountInput = useCallback(
    (num: string) => {
      setAmountValue(num)
    },
    [setAmountValue]
  )

  return (
    <LendCard>
      <LendBackground />
      <AutoColumn gap={'26px'}>
        <Row>
          <Text fontSize={24} color={theme.text1} fontWeight={700} lineHeight={'28px'}>
            Withdrawing BNB
          </Text>
          <CurrencyLogo style={{ marginLeft: '0.5rem' }} currency={getTokenCurrency} size={'32px'} />
        </Row>

        <AutoColumn gap={'12px'}>
          <TYPE.body color={theme.text5} fontWeight={700} fontSize={14}>
            Available Balance: {getTokenBalance?.toSignificant(6)} {getTokenCurrency?.wrapped?.symbol}
          </TYPE.body>

          <InputPanelWrapper hideInput={false}>
            <RowBetween>
              <InputWrapper height={48} value={amountValue} onUserInput={onUserAmountInput} />
              <ButtonLink
                onClick={() => {
                  onUserAmountInput(getTokenBalance?.toExact() ?? '0')
                }}
              >
                MAX
              </ButtonLink>
            </RowBetween>
          </InputPanelWrapper>

          <AutoRow gap={'10px'}>
            <TYPE.body color={theme.text5} fontWeight={700} fontSize={14}>
              You will receive:
            </TYPE.body>
            <TYPE.body color={theme.primary6} fontWeight={700} fontSize={14}>
              {amountValue ? `~ ${format(amountValue)} ${payTokenCurrency?.wrapped?.symbol}` : '-'}
            </TYPE.body>
          </AutoRow>
        </AutoColumn>

        <Row justify="flex-start" width={'50%'}>
          <TYPE.italic
            fontWeight={700}
            fontSize={14}
            textAlign="left"
            lineHeight={'24px'}
            color={theme.primary8}
            style={{ width: '100%' }}
          >
            {`
          The amount of ibTokens you'll receive is worth the same as the amount of tokens you deposited. There is no fee
          and you are not losing any value. Their exchange rate is not 1:1.
          `}
          </TYPE.italic>
        </Row>
        <Row justify="flex-end">
          {!account ? (
            <ButtonLight onClick={toggleWalletModal}>Connect Wallet</ButtonLight>
          ) : (
            <ButtonError
              onClick={handleWithdraw}
              width="auto"
              disabled={confimIng || !(amountValue && Number(amountValue) > 0)}
            >
              <Text fontWeight={500}>
                {confimIng ? (
                  <Dots>
                    <Trans>Confirming</Trans>
                  </Dots>
                ) : (
                  <Trans>Confirm</Trans>
                )}
              </Text>
            </ButtonError>
          )}
        </Row>
      </AutoColumn>
    </LendCard>
  )
}
