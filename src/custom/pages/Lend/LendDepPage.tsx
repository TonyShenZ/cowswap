import { useCallback, useContext, useMemo, useState } from 'react'
import { Text } from 'rebass'
import Row, { AutoRow, RowBetween } from '@src/components/Row'
import { RouteComponentProps } from 'react-router-dom'
import { LendBackground, LendCard } from '.'
import { parseEther } from '@ethersproject/units'
import { ApprovalState, useApproveCallback } from '@src/hooks/useApproveCallback'

import { Dots } from '@src/pages/Pool/styleds'
import { Trans } from '@lingui/macro'
import { useCurrency } from '@src/hooks/Tokens'
import { useTokenBalance } from '@src/state/wallet/hooks'
import { useActiveWeb3React } from '@src/hooks/web3'
import { CurrencyAmount } from '@uniswap/sdk-core'
import { useVaultContract } from '@src/custom/hooks/useContract'
import { AutoColumn } from '@src/components/Column'
import { TYPE } from '@src/custom/theme/cowSwapTheme'
import styled, { ThemeContext } from 'styled-components/macro'
import { InputPanel } from '@src/custom/components/CurrencyInputPanel/CurrencyInputPanelMod'
import Input from '@src/components/NumericalInput'
import { ButtonEmpty, ButtonError, ButtonGreen, ButtonLight } from '@src/custom/components/Button'
import { useWalletModalToggle } from '@src/custom/state/application/hooks'
import { TransactionType } from '@src/state/transactions/actions'
import { useTotalSupply } from '@src/hooks/useTotalSupply'
import CurrencyLogo from '@src/custom/components/CurrencyLogo'
import { useTransactionAdder } from '@src/state/transactions/hooks'

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
  color: ${({ theme }) => theme.primary6};
`

export default function LendPage({
  match: {
    params: { address },
  },
}: RouteComponentProps<{ address: string }>) {
  const { account } = useActiveWeb3React()
  const theme = useContext(ThemeContext)
  const toggleWalletModal = useWalletModalToggle() // toggle wallet when disconnected

  const vaultContract = useVaultContract()

  const tokenCurrency = useCurrency(address)
  const totalSupplyOfStakingToken = useTotalSupply(tokenCurrency?.wrapped)

  const tokenBalance = useTokenBalance(account ?? undefined, tokenCurrency?.wrapped ?? undefined)
  const tokenAmount = useMemo(() => {
    if (!tokenCurrency || !totalSupplyOfStakingToken) return
    return CurrencyAmount.fromRawAmount(tokenCurrency, totalSupplyOfStakingToken.toExact())
  }, [tokenCurrency, totalSupplyOfStakingToken])

  const [approval, approveCallback] = useApproveCallback(tokenAmount, vaultContract?.address)

  const addTransaction = useTransactionAdder()

  const [amountValue, setAmountValue] = useState('')

  const [approving, setApproving] = useState(false)
  const [confimIng, setConfimIng] = useState(false)

  const handleApprove = useCallback(async () => {
    if (!approveCallback) return

    try {
      setApproving(true)
      // const summary = `Approve ${tokenCurrency?.symbol || 'token'} for Lend`
      await approveCallback()
    } catch (error) {
      console.error('[InvestOption]: Issue approving.', error)
    } finally {
      setApproving(false)
    }
  }, [approveCallback, setApproving])

  const handleDeposit = useCallback(() => {
    if (!amountValue || !account) return
    try {
      setConfimIng(true)
      const amountToken = parseEther(amountValue)
      vaultContract
        .deposit(amountToken)
        .then((response) => {
          addTransaction(response, {
            type: TransactionType.DEPOSITING,
            tokenAddress: account,
          })
          // debugger
          // addTransaction({
          //   hash: response.hash,
          //   summary: `Deposit ${amountValue} ${tokenCurrency?.symbol}`,
          // })
        })
        .finally(() => setConfimIng(false))
    } catch (error) {
      console.error('[InvestOption]: Issue deposit.', error)
    }
  }, [vaultContract, amountValue, account, tokenCurrency, setConfimIng, addTransaction])

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
            Depositing BNB
          </Text>
          <CurrencyLogo style={{ marginLeft: '0.5rem' }} currency={tokenCurrency} size={'32px'} />
        </Row>

        <AutoColumn gap={'12px'}>
          <TYPE.body color={theme.text5} fontWeight={700} fontSize={14}>
            Available Balance: {tokenBalance?.toSignificant(3)} {tokenCurrency?.wrapped?.symbol}
          </TYPE.body>

          <InputPanelWrapper hideInput={false}>
            <RowBetween>
              <InputWrapper height={48} value={amountValue} onUserInput={onUserAmountInput} />
              <ButtonLink
                onClick={() => {
                  onUserAmountInput(tokenBalance?.toExact() ?? '0')
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
              ~1230 hBNB
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
          ) : approval === ApprovalState.NOT_APPROVED || approval === ApprovalState.PENDING ? (
            <ButtonGreen onClick={handleApprove} disabled={approval === ApprovalState.PENDING || approving}>
              {approval === ApprovalState.PENDING || approving ? (
                <Dots>
                  <Trans>Approving {tokenCurrency?.wrapped?.symbol}</Trans>
                </Dots>
              ) : (
                <Trans>Approve {tokenCurrency?.wrapped?.symbol}</Trans>
              )}
            </ButtonGreen>
          ) : (
            <ButtonError
              onClick={handleDeposit}
              width="auto"
              disabled={approval !== ApprovalState.APPROVED || confimIng || !(amountValue && Number(amountValue) > 0)}
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
