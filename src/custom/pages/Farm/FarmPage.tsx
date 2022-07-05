import { useContext, useMemo, useState, useCallback, useEffect } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import { darken } from 'polished'
import { formatEther, parseEther } from '@ethersproject/units'
import { WeiPerEther, Zero } from '@ethersproject/constants'
import { defaultAbiCoder } from 'ethers/lib/utils'

import styled, { ThemeContext } from 'styled-components/macro'
import { format, LendBackground, LendCard, Line } from '../Lend'
import { AutoColumn } from '@src/components/Column'
import { TYPE } from '@src/theme'
import { FarmText, PoolMeta, replaceSource, VaultMeta } from '.'
import Row, { RowBetween } from '@src/components/Row'
import Card from '@src/components/Card'
import { InputPanelWrapper } from '../Lend/LendDepPage'
import { useMultipleContractSingleData, useSingleCallResult } from '@src/state/multicall/hooks'
import { Erc20__factory } from '@src/abis/types'
import { useActiveWeb3React } from '@src/hooks/web3'
import Input from '@src/components/NumericalInput'

import { usePairContract, useVaultContract } from '@src/custom/hooks/useContract'
import { isAddress } from '@src/custom/utils'
import { Box, Text } from 'rebass'
import LeverageSlider from '@src/custom/components/LeverageSlider'

import { ButtonOutlined, ButtonGreen } from '@src/components/Button'

import { Dots } from '@src/pages/Pool/styleds'
import { useWalletModalToggle } from '@src/custom/state/application/hooks'
import { ApprovalState, useApproveCallback } from '@src/hooks/useApproveCallback'
import { useCurrency } from '@src/hooks/Tokens'
import { useTotalSupply } from '@src/hooks/useTotalSupply'
import { CurrencyAmount } from '@uniswap/sdk-core'
import { Trans } from '@lingui/macro'
import { get } from '@src/custom/utils/request'

// import { Simulator } from './Simulator'

import Farms from 'constants/tokenLists/farm-default.tokenlist.json'

const SeachWrapper = styled(InputPanelWrapper)`
  padding: 15px 16px;
`
const BalanceWrapper = styled(AutoColumn)`
  flex: 1;
  :last-child {
    margin-left: 40px;
  }
`
const LeverageWrapper = styled(Row)`
  & > div {
    :first-child {
      flex: 1;
    }
    :last-child {
      margin-left: 40px;
    }
  }
`
const LeverageInputWrapper = styled(SeachWrapper)`
  display: flex;
  flex-direction: row;
  width: 87px;
  padding: 8px 12px;
  flex: none;
`
const InputWrapper = styled(Input)`
  width: 100%;
  text-align: left;
  background: transparent;
`
const RadioWrapper = styled(ButtonOutlined)<{ active?: boolean }>`
  background: ${({ theme, active }) => (active ? theme.bg10 : 'transparent')};
  border: 1px solid ${({ theme, active }) => (active ? 'transparent' : theme.bg11)};
  color: ${({ theme, active }) => (active ? theme.bg2 : theme.text1)};
  border-radius: 12px;
  padding: 8px;
  width: 140px;
  text-align: center;
  cursor: pointer;
  :hover {
    background: ${({ theme, active }) => (active ? '' : darken(0.5, theme.bg10))};
  }
  :not(:first-child) {
    margin-left: 12px;
  }
`
const VerticalLine = styled(Box)`
  width: 1px;
  height: 100%;
  background: ${({ theme }) => theme.bg10};
`
const SummaryCard = styled(Card)`
  width: 100%;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 12px;
  padding: 32px;
  display: flex;
`
const SummaryCardChildren = styled(AutoColumn)`
  flex: 1;
`
const ButtonWrapper = styled(Row)``

const ButtonFarm = styled(ButtonGreen)`
  padding: 8px;
  border-radius: 12px;
`
const SimulatorButton = styled(ButtonOutlined)`
  width: 240px;
  border: 1px solid ${({ theme }) => theme.primary6};
  color: ${({ theme }) => theme.primary6};
  padding: 8px;
  border-radius: 12px;
  &:focus {
    box-shadow: 0 0 0 1px ${({ theme }) => theme.primary6};
  }
  &:hover {
    box-shadow: 0 0 0 1px ${({ theme }) => theme.primary6};
    color: ${({ theme }) => theme.primary6};
  }
  &:active {
    box-shadow: 0 0 0 1px ${({ theme }) => theme.primary6};
  }
  &:disabled {
    opacity: 50%;
    cursor: auto;
  }
`
const NewAutoColumn = styled(AutoColumn)`
  width: 100%;
`

export default function FarmPage({
  match: {
    params: { configKey, leverage },
  },
}: RouteComponentProps<{ configKey: string; leverage: string }>) {
  const theme = useContext(ThemeContext)
  const { account } = useActiveWeb3React()
  const vaultContract = useVaultContract('0xdfc169de2454CB5b925034433742956c416EE6C1', true)
  const toggleWalletModal = useWalletModalToggle() // toggle wallet when disconnected

  const poolInfo: PoolMeta | undefined = useMemo(() => {
    if (!configKey) return
    return Farms.pools.find((x) => x.configKey === configKey)
  }, [configKey])

  // Batch query balance
  const tokensBalance = useMultipleContractSingleData(
    poolInfo ? poolInfo.tokenList.map((p) => p.address) : [],
    Erc20__factory.createInterface(),
    'balanceOf',
    [account ?? undefined]
  )

  // Batch query exchange rate
  //   const pairContract = usePairContract(poolInfo?.pairAddress)

  // get pair contract
  const validatedAddress = isAddress(poolInfo?.pairAddress)
  const pair = usePairContract(validatedAddress ? validatedAddress : undefined)

  // get token addresses from pair contract
  //   const token0AddressCallState = useSingleCallResult(pair, 'token0', undefined, NEVER_RELOAD)
  //   console.log(token0AddressCallState)

  //   const token0Address = token0AddressCallState?.result?.[0]
  //   const token1Address = useSingleCallResult(pair, 'token1', undefined, NEVER_RELOAD)?.result?.[0]

  // get tokens
  //   const token0 = useToken(token0Address)
  //   const token1 = useToken(token1Address)

  // get liquidity token balance
  //   const liquidityToken: Token | undefined = useMemo(
  //     () => (chainId && validatedAddress ? new Token(chainId, validatedAddress, 18) : undefined),
  //     [chainId, validatedAddress]
  //   )

  // get data required for V2 pair migration
  //   const pairBalance = useTokenBalance(account ?? undefined, liquidityToken)
  //   const totalSupply = useTotalSupply(liquidityToken)
  const [reserve0Raw, reserve1Raw] = useSingleCallResult(pair, 'getReserves')?.result ?? []

  // const reserve0 = useMemo(
  //   () => (token0 && reserve0Raw ? CurrencyAmount.fromRawAmount(token0, reserve0Raw) : undefined),
  //   [token0, reserve0Raw]
  // )
  // const reserve1 = useMemo(
  //   () => (token1 && reserve1Raw ? CurrencyAmount.fromRawAmount(token1, reserve1Raw) : undefined),
  //   [token1, reserve1Raw]
  // )

  const reserve0 = useMemo(
    () => (reserve0Raw ? reserve0Raw.mul(WeiPerEther).div(reserve1Raw) : undefined),
    [reserve0Raw, reserve1Raw]
  )

  const reserve1 = useMemo(
    () => (reserve1Raw ? reserve1Raw.mul(WeiPerEther).div(reserve0Raw) : undefined),
    [reserve0Raw, reserve1Raw]
  )

  // console.log(reserve0 && formatEther(reserve0), reserve1 && formatEther(reserve1))

  const [borrowTokens, setBorrowTokens] = useState(poolInfo?.tokenList)

  const handleAmountValueInput = useCallback(
    (index: number, value: string) => {
      if (!borrowTokens) return
      const obj = borrowTokens.concat()
      obj[index].value = value
      setBorrowTokens(obj)
    },
    [borrowTokens, setBorrowTokens]
  )

  const handleBorrowTokenChange = useCallback(
    (i) => {
      if (!borrowTokens) return
      const obj = borrowTokens.concat()
      obj.map((x, idx) => {
        x.value = ''
        if (i == idx) {
          x.active = true
          return
        }
        x.active = false
      })
      setBorrowTokens(obj)
    },
    [setBorrowTokens, borrowTokens]
  )

  const [leverageValue, setLeverageValue] = useState(leverage ? leverage : '')

  const handleLeverageValueInput = useCallback(
    (v: string) => {
      if (poolInfo?.leverage && parseInt(v) > poolInfo.leverage) {
        setLeverageValue(String(poolInfo.leverage))
      } else {
        setLeverageValue(v)
      }
    },
    [setLeverageValue, poolInfo?.leverage]
  )

  // Minimum correction when out of focus
  const handleLeverageValueInputBlur = useCallback(() => {
    if (!leverageValue) handleLeverageValueInput('1.00')
  }, [leverageValue, handleLeverageValueInput])

  const farmButtonStatus = useMemo(() => {
    if (!tokensBalance[0]?.result || !borrowTokens) return true
    const providedTokenValue = borrowTokens.find((x) => !x.active)?.value
    const providedTokenBalance = tokensBalance[0].result?.[0]

    if (
      providedTokenValue &&
      providedTokenBalance &&
      parseFloat(providedTokenValue) <= parseFloat(formatEther(providedTokenBalance))
    ) {
      return false
    } else {
      return true
    }
  }, [tokensBalance, borrowTokens])

  // Assets Borrowed(Debt Value)
  const debtValue = useMemo(() => {
    if (!borrowTokens || !leverageValue || !reserve1 || !reserve0) return
    // borrowed toekn
    const borrowedToken = borrowTokens.find((x) => x.active)
    // Number of tonken provided
    const providedToken = borrowTokens.find((x) => !x.active)
    if (providedToken?.value && borrowedToken) {
      const providedTokenAmount = parseFloat(providedToken.value)
      const average = (providedTokenAmount * parseFloat(leverageValue)) / 2
      const t1 = average % providedTokenAmount ? average % providedTokenAmount : average
      const t2 = average % 0 ? average % 0 : average
      const t1USD = parseFloat(formatEther(reserve1)) * t1
      const t2USD = parseFloat(formatEther(reserve1)) * t2

      const debtTotalValue = t1USD + t2USD

      const assetsValue = debtTotalValue - t1USD

      const positionValue = average

      return {
        providedTokenAmount,
        assetsValue,
        positionValue,
        debtTotalValue,
        borrowedToken,
        providedToken,
      }
    }

    return {
      providedTokenAmount: 0,
      assetsValue: 0,
      positionValue: 0,
      debtTotalValue: 0,
      borrowedToken,
      providedToken,
    }
  }, [reserve1, reserve0, borrowTokens, leverageValue])

  const [approving, setApproving] = useState(false)
  const [positioning, setPosition] = useState(false)

  const payTokenCurrency = useCurrency(debtValue?.providedToken?.address)

  const totalSupplyOfStakingToken = useTotalSupply(payTokenCurrency?.wrapped)

  const postionCurrencyAmount = useMemo(() => {
    if (!payTokenCurrency || !totalSupplyOfStakingToken) return
    return CurrencyAmount.fromRawAmount(payTokenCurrency, totalSupplyOfStakingToken.toExact())
  }, [payTokenCurrency, totalSupplyOfStakingToken])

  const [approval, approveCallback] = useApproveCallback(postionCurrencyAmount, vaultContract?.address)

  const handleApprove = useCallback(async () => {
    if (!approveCallback) return

    try {
      setApproving(true)
      // const summary = `Approve ${payTokenCurrency?.symbol || 'token'} for Lend`
      await approveCallback()
        .then(() => setApproving(false))
        .then(() => setApproving(false))
    } catch (error) {
      console.error('[InvestOption]: Issue approving.', error)
    }
  }, [approveCallback, setApproving])

  const openPosition = useCallback(() => {
    if (!debtValue?.providedTokenAmount || !debtValue.debtTotalValue) return
    setPosition(true)
    vaultContract
      .work(
        0,
        '0x44B24138e620a2f24Aa82C66508F0D69337881c1',
        Zero,
        parseEther(String(debtValue.debtTotalValue)),
        0,
        defaultAbiCoder.encode(
          ['address', 'bytes'],
          [
            '0x7388cdd2b9F678550FBDba03F0b2289BbbDE1c34',
            defaultAbiCoder.encode(
              ['uint256', 'uint256'],
              [parseEther(String(debtValue.providedTokenAmount)), parseEther('0')]
            ),
          ]
        )
      )
      .then(async (res) => {
        await res
          .wait()
          .then(() => setPosition(false))
          .catch(() => setPosition(false))
      })
      .catch((err) => {
        console.log(err)
        setPosition(false)
      })
  }, [vaultContract, debtValue])

  // useEffect(() => {
  //   return () => {
  //     if (borrowTokens) {
  //       const obj = borrowTokens.concat()
  //       obj.map((x) => (x.value = ''))
  //       setBorrowTokens(obj)
  //     }
  //   }
  // }, [borrowTokens, setBorrowTokens])

  const [vaultList, setVaultList] = useState<VaultMeta[]>([])

  const [vaultConfig, setVaultConfig] = useState<VaultMeta>()

  const getVaultList = useCallback(async () => {
    const { result } = await get('/vault/list')
    setVaultList(result)
  }, [setVaultList])

  const poolFees = useMemo(() => {
    if (!vaultConfig) return

    const tradingFees = parseFloat(vaultConfig.workers[0].trading_fee) * 365 * 100 * parseFloat(leverageValue) ?? 1
    const tvl = vaultConfig.workers[0].tvl
    const borrowFee = -parseFloat(vaultConfig.daily_borrow_interest) * 365 * 100 * (parseFloat(leverageValue) ?? 1 - 1)
    const totalApr = tradingFees - -parseFloat(vaultConfig.daily_borrow_interest ?? '0') * 365 * 100 * 1
    const totalAprLeve = totalApr * (parseFloat(leverageValue) ?? 1 - 1)
    const dailyApr = totalAprLeve / 365
    const totalApy = ((1 + dailyApr / 100) ** 365 - 1) * 100
    const originalApy = ((1 + totalApr / 365 / 100) ** 365 - 1) * 100
    return {
      tradingFees,
      tvl,
      borrowFee: borrowFee.toString(),
      totalApr: totalAprLeve.toString(),
      dailyApr: dailyApr.toString(),
      totalApy: totalApy.toString(),
      originalApy: originalApy.toString(),
    }
  }, [vaultConfig, leverageValue])

  useEffect(() => {
    if (!borrowTokens || !vaultList) return
    const borrowedToken = borrowTokens.find((x) => x.active)
    const vault = vaultList.find((x) => x.base_token == borrowedToken?.address)
    setVaultConfig(vault)
    return () => {
      setVaultConfig(undefined)
    }
  }, [vaultList, borrowTokens, setVaultConfig])

  useEffect(() => {
    if (!poolInfo) return
    getVaultList()
  }, [poolInfo, getVaultList])

  return (
    <LendCard>
      <LendBackground background="rgba(132, 251, 186, 0.2)" />
      {poolInfo && borrowTokens ? (
        <AutoColumn gap="24px">
          <TYPE.mediumHeader>
            Farm {poolInfo.name} {replaceSource(poolInfo.source)} pool
          </TYPE.mediumHeader>
          <Line opacity={0.5} />
          <RowBetween>
            {borrowTokens.map((t, i) => (
              <BalanceWrapper gap={'12px'} key={t.address}>
                <TYPE.body color={theme.text5} fontWeight={700} fontSize={14}>
                  Available Balance:{' '}
                  {tokensBalance[i]?.result ? format(formatEther(tokensBalance[i]?.result?.[0])) : '-'} {t.symbol}
                </TYPE.body>
                <SeachWrapper>
                  <RowBetween>
                    <InputWrapper
                      disabled={t.active}
                      placeholder="0.00"
                      value={t.value ?? ''}
                      onUserInput={(v) => handleAmountValueInput(i, v)}
                    />
                    {t.symbol}
                  </RowBetween>
                </SeachWrapper>
                <TYPE.body color={theme.text5} fontWeight={700} fontSize={14}>
                  {t.symbol == 'USDC'
                    ? `1 ${t.symbol} = 1 ${t.symbol}`
                    : `1 ${t.symbol} = ${reserve1 ? format(formatEther(reserve1)) : '-'} USDC`}
                </TYPE.body>
              </BalanceWrapper>
            ))}
          </RowBetween>
          <AutoColumn gap="32px">
            <AutoColumn gap="12px">
              <TYPE.body fontWeight={700} fontSize={14}>
                Leverage
              </TYPE.body>
              <LeverageWrapper>
                <LeverageSlider
                  max={poolInfo?.leverage}
                  value={leverageValue ? parseFloat(leverageValue) : undefined}
                  defaultValue={leverage ? parseFloat(leverage) : undefined}
                  change={handleLeverageValueInput}
                />
                <LeverageInputWrapper>
                  <InputWrapper
                    placeholder="1.00"
                    fontSize={'14px'}
                    value={leverageValue}
                    onUserInput={handleLeverageValueInput}
                    onBlur={handleLeverageValueInputBlur}
                  />
                  x
                </LeverageInputWrapper>
              </LeverageWrapper>
            </AutoColumn>
            <AutoColumn gap="12px">
              <TYPE.body fontWeight={700} fontSize={14}>
                Asset to borrow
              </TYPE.body>
              <Row>
                {borrowTokens.map((t, i) => (
                  <RadioWrapper
                    key={i}
                    active={t.active}
                    onClick={() => handleBorrowTokenChange(i)}
                    disabled={t.disabled}
                  >
                    <Text fontWeight={600}>{t.symbol}</Text>
                  </RadioWrapper>
                ))}
              </Row>
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
                Please keep in mind that when you leverage above 2x, 
                you will have a slight short on the borrowed asset. Check more details with simulator.
                `}
                </TYPE.italic>
              </Row>
            </AutoColumn>
            <Line opacity={0.5} />
          </AutoColumn>
          <SummaryCard>
            <SummaryCardChildren gap="16px">
              <RowBetween>
                <FarmText>Yield Farm APR</FarmText>
                <FarmText></FarmText>
              </RowBetween>
              <RowBetween>
                <FarmText>Trading Fees APR(7-day avg.)</FarmText>
                <FarmText>{poolFees?.tradingFees ? `${poolFees.tradingFees.toFixed(6)} %` : '-'}</FarmText>
              </RowBetween>
              <RowBetween>
                <FarmText>Borrowing Interest APR</FarmText>
                <FarmText>{poolFees?.borrowFee ? `${format(poolFees.borrowFee)} %` : '-'}</FarmText>
              </RowBetween>
              <RowBetween>
                <FarmText>Total APR</FarmText>
                <FarmText>{poolFees?.totalApr ? `${format(poolFees.totalApr)} %` : '-'}</FarmText>
              </RowBetween>
              <RowBetween>
                <FarmText>Total APY</FarmText>
                <FarmText>{poolFees?.totalApy ? `${format(poolFees.totalApy)} %` : '-'}</FarmText>
              </RowBetween>
              <RowBetween>
                <FarmText>Long</FarmText>
                <FarmText></FarmText>
              </RowBetween>
              <RowBetween>
                <FarmText>Short</FarmText>
                <FarmText></FarmText>
              </RowBetween>
            </SummaryCardChildren>
            <VerticalLine opacity={0.5} marginX={18} />
            <SummaryCardChildren gap="16px">
              <FarmText fontSize={24}>Summary</FarmText>
              <RowBetween>
                <FarmText>Assets Supplied(Equity Value before fees)</FarmText>
                <FarmText>
                  {borrowTokens[0].value ? borrowTokens[0].value : '0'} {borrowTokens[0].symbol} +{' '}
                  {borrowTokens[1].value ? borrowTokens[1].value : '0'} {borrowTokens[1].symbol}
                </FarmText>
              </RowBetween>
              <RowBetween>
                <FarmText>Assets Borrowed(Debt Value)</FarmText>
                <FarmText>
                  {debtValue?.debtTotalValue
                    ? `${format(String(debtValue.debtTotalValue))} ${debtValue.borrowedToken?.symbol}`
                    : '-'}
                </FarmText>
              </RowBetween>
              <RowBetween>
                <FarmText>Price Impact and Trading Fees</FarmText>
                <FarmText>-</FarmText>
              </RowBetween>
              <RowBetween>
                <FarmText>Total Assets in Position Value</FarmText>
                <FarmText>
                  {format(String(debtValue?.assetsValue))} {debtValue?.borrowedToken?.symbol} +{' '}
                  {format(String(debtValue?.positionValue))} {debtValue?.providedToken?.symbol}
                </FarmText>
              </RowBetween>
              <RowBetween>
                <FarmText color={theme.bg11}>Share of Pool (Biswap)</FarmText>
                <FarmText color={theme.bg11}></FarmText>
              </RowBetween>
            </SummaryCardChildren>
          </SummaryCard>
          <SummaryCard>
            <NewAutoColumn gap="24px">
              <TYPE.mediumHeader>{poolInfo.name} Farming Simulator</TYPE.mediumHeader>
              {/* <Row height={600}>
                <Simulator />
              </Row> */}
            </NewAutoColumn>
          </SummaryCard>
          <ButtonWrapper>
            {!account ? (
              <ButtonFarm marginRight={32} onClick={toggleWalletModal}>
                Connect Wallet
              </ButtonFarm>
            ) : approval === ApprovalState.NOT_APPROVED || approval === ApprovalState.PENDING ? (
              <ButtonFarm
                marginRight={32}
                onClick={handleApprove}
                disabled={approval === ApprovalState.PENDING || approving}
              >
                {approval === ApprovalState.PENDING || approving ? (
                  <Dots>
                    <Trans>Approving {payTokenCurrency?.wrapped?.symbol}</Trans>
                  </Dots>
                ) : (
                  <Trans>Approve {payTokenCurrency?.wrapped?.symbol}</Trans>
                )}
              </ButtonFarm>
            ) : (
              <ButtonFarm marginRight={32} onClick={openPosition} disabled={farmButtonStatus || positioning}>
                {positioning ? <Dots>Farming</Dots> : 'Farm'}
              </ButtonFarm>
            )}
            <SimulatorButton>Simulator</SimulatorButton>
          </ButtonWrapper>
        </AutoColumn>
      ) : (
        'No data'
      )}
    </LendCard>
  )
}
