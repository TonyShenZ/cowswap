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

import { usePairContract, useVaultConfigContract, useVaultContract } from '@src/custom/hooks/useContract'
import { isAddress } from '@src/custom/utils'
import { Box, Text } from 'rebass'
import LeverageSlider from '@src/custom/components/LeverageSlider'

import { ButtonOutlined, ButtonGreen } from '@src/components/Button'

import { Dots } from '@src/pages/Pool/styleds'
import { useAddPopup, useWalletModalToggle } from '@src/custom/state/application/hooks'
import { ApprovalState, useApproveCallback } from '@src/hooks/useApproveCallback'
import { useCurrency } from '@src/hooks/Tokens'
import { useTotalSupply } from '@src/hooks/useTotalSupply'
import { CurrencyAmount } from '@uniswap/sdk-core'
import { Trans } from '@lingui/macro'
import { get } from '@src/custom/utils/request'

// import { Simulator } from './Simulator'

import Farms from 'constants/tokenLists/farm-default.tokenlist.json'
import { MouseoverTooltipContent } from '@src/custom/components/Tooltip'
import { StyledInfo } from '../Swap/styleds'

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
// const SimulatorButton = styled(ButtonOutlined)`
//   width: 240px;
//   border: 1px solid ${({ theme }) => theme.primary6};
//   color: ${({ theme }) => theme.primary6};
//   padding: 8px;
//   border-radius: 12px;
//   &:focus {
//     box-shadow: 0 0 0 1px ${({ theme }) => theme.primary6};
//   }
//   &:hover {
//     box-shadow: 0 0 0 1px ${({ theme }) => theme.primary6};
//     color: ${({ theme }) => theme.primary6};
//   }
//   &:active {
//     box-shadow: 0 0 0 1px ${({ theme }) => theme.primary6};
//   }
//   &:disabled {
//     opacity: 50%;
//     cursor: auto;
//   }
// `
const NewAutoColumn = styled(AutoColumn)`
  width: 100%;
`

export default function FarmPage({
  match: {
    params: { configKey, leverage, positionId },
  },
}: RouteComponentProps<{ configKey: string; leverage: string; positionId: string }>) {
  const theme = useContext(ThemeContext)
  const { account } = useActiveWeb3React()
  const addPopup = useAddPopup()
  const vaultContract = useVaultContract('0xdfc169de2454CB5b925034433742956c416EE6C1', true)

  const vaultConfigContract = useVaultConfigContract()

  const minDebtSize = useSingleCallResult(vaultConfigContract, 'minDebtSize', undefined)?.result?.[0]

  // const reservePool = useSingleCallResult(vaultContract, 'reservePool', undefined)?.result?.[0]

  // total supply
  const totalToken = useSingleCallResult(vaultContract, 'totalToken')?.result?.[0]

  // total borrowed
  const vaultDebtVal = useSingleCallResult(vaultContract, 'vaultDebtVal')?.result?.[0]

  const remainingQuota = useMemo(() => {
    if (!totalToken || !vaultDebtVal) return
    return totalToken.sub(vaultDebtVal)
  }, [totalToken, vaultDebtVal])

  // const workFactor = useSingleCallResult(vaultConfigContract, 'workFactor', [
  //   '0x44B24138e620a2f24Aa82C66508F0D69337881c1',
  //   0,
  // ])?.result?.[0]

  // console.log(workFactor)

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
  // const token0AddressCallState = useSingleCallResult(pair, 'token0', undefined, NEVER_RELOAD)

  // const token0Address = token0AddressCallState?.result?.[0]
  // const token1Address = useSingleCallResult(pair, 'token1', undefined, NEVER_RELOAD)?.result?.[0]

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
    const token0Valaue = borrowTokens[0].value
    const token0Balance = tokensBalance[0].result?.[0]

    const token1Valaue = borrowTokens[1].value
    const token1Balance = tokensBalance[0].result?.[1]

    if (
      (token0Valaue && token0Balance && parseFloat(token0Valaue) <= parseFloat(formatEther(token0Balance))) ||
      (token1Valaue && token1Balance && parseFloat(token1Valaue) <= parseFloat(formatEther(token1Balance)))
    ) {
      return false
    } else {
      return true
    }
  }, [tokensBalance, borrowTokens])

  // Assets Borrowed(Debt Value)
  const debtValue = useMemo(() => {
    if (!borrowTokens || !leverageValue || !reserve0 || !reserve1) return
    // borrowed toekn
    const borrowedToken = borrowTokens.find((x) => x.active)
    // Number of tonken provided
    const providedToken = borrowTokens.find((x) => !x.active)
    const token0 = borrowTokens[0]
    const token1 = borrowTokens[1]
    if (token0?.value || token1?.value) {
      const token0Amount = parseFloat(token0.value || '0')
      const token0Average = (token0Amount * parseFloat(leverageValue)) / 2
      const token0Avg0 = token0Average % token0Amount ? token0Average % token0Amount : token0Average
      const token0Avg1 = token0Average % 0 ? token0Average % 0 : token0Average
      const token0Avg0USD = parseFloat(formatEther(reserve0)) * token0Avg0
      const token0Avg1USD = parseFloat(formatEther(reserve0)) * token0Avg1

      const token0debtTotalValue =
        (token0Amount * parseFloat(leverageValue) - token0Amount) *
        (token0.symbol == 'USDC' ? 1 : parseFloat(formatEther(reserve0)))

      const token0totalUSD = token0Avg0USD + token0Avg1USD

      const token0AssetsValue = token0totalUSD - token0Avg0USD

      const token0PositionValue =
        token1.symbol == 'USDC' ? token0Average * parseFloat(formatEther(reserve1)) : token0Average

      const token1Amount = parseFloat(token1.value || '0')
      const token1Average = (token1Amount * parseFloat(leverageValue)) / 2
      const token1Avg0 = token1Average % token1Amount ? token1Average % token1Amount : token1Average
      const token1Avg1 = token1Average % 0 ? token1Average % 0 : token1Average
      const token1Avg0USD = token1.symbol == 'USDC' ? 1 * token1Avg0 : parseFloat(formatEther(reserve0)) * token1Avg0
      const token1Avg1USD = token1.symbol == 'USDC' ? 1 * token1Avg1 : parseFloat(formatEther(reserve0)) * token1Avg1

      const token1debtTotalValue =
        (token1Amount * parseFloat(leverageValue) - token1Amount) *
        (token1.symbol == 'USDC' ? 1 : parseFloat(formatEther(reserve0)))

      const token1totalUSD = token1Avg0USD + token1Avg1USD

      const token1AssetsValue = token1totalUSD - token1Avg0USD

      const token1PositionValue =
        token1.symbol == 'USDC' ? token1Average * parseFloat(formatEther(reserve1)) : token1Average

      const debtTotalValue = token0debtTotalValue + token1debtTotalValue

      const assetsValue = token0AssetsValue + token1AssetsValue

      const positionValue = token0PositionValue + token1PositionValue

      return {
        token0Amount,
        token1Amount,
        assetsValue,
        positionValue,
        debtTotalValue,
        borrowedToken,
        providedToken,
      }
    }

    return {
      token0Amount: 0,
      token1Amount: 0,
      assetsValue: 0,
      positionValue: 0,
      debtTotalValue: 0,
      borrowedToken,
      providedToken,
    }
  }, [reserve0, reserve1, borrowTokens, leverageValue])

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
    if (!debtValue?.token0Amount || !debtValue?.token1Amount || !debtValue.debtTotalValue || !minDebtSize) return

    setPosition(true)
    vaultContract
      .work(
        positionId ? positionId : 0,
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
              [parseEther(String(debtValue.token0Amount)), parseEther(String(debtValue.token1Amount))]
            ),
          ]
        )
      )
      .then(async (res) => {
        await res
          .wait()
          .then((value) => {
            addPopup(
              {
                txn: {
                  hash: value.transactionHash,
                  success: value.status ? true : false,
                  summary: `Successfully ${positionId == '0' ? 'opened' : 'adjust'}`,
                },
              },
              value.transactionHash
            )
          })
          .finally(() => setPosition(false))
      })
      .catch((err) => {
        console.log(err)
        setPosition(false)
      })
  }, [vaultContract, minDebtSize, debtValue, positionId, addPopup])

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
            {positionId == '0' ? 'Farm' : 'Adjust'} {poolInfo.name} {replaceSource(poolInfo.source)} pool
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
                    : `1 ${t.symbol} = ${reserve0 ? format(formatEther(reserve0)) : '-'} USDC`}
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
                <FarmText>
                  Assets Supplied
                  <MouseoverTooltipContent
                    content={'Assets Supplied(Equity Value before fees)'}
                    bgColor={theme.bg1}
                    color={theme.text1}
                  >
                    <StyledInfo />
                  </MouseoverTooltipContent>
                </FarmText>
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
          {positionId == '0' ? (
            <SummaryCard>
              <NewAutoColumn gap="24px">
                {/* <TYPE.mediumHeader>{poolInfo.name} Farming Simulator</TYPE.mediumHeader> */}
                {/* <Row height={600}>
                <Simulator />
              </Row> */}
              </NewAutoColumn>
            </SummaryCard>
          ) : null}

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
            ) : debtValue ? (
              debtValue.debtTotalValue > parseFloat(formatEther(minDebtSize)) &&
              debtValue.debtTotalValue < parseFloat(formatEther(remainingQuota)) ? (
                <ButtonFarm marginRight={32} onClick={openPosition} disabled={farmButtonStatus || positioning}>
                  {farmButtonStatus ? (
                    'Insufficient wallet balance'
                  ) : positionId == '0' ? (
                    positioning ? (
                      <Dots>Farming</Dots>
                    ) : (
                      'Farm'
                    )
                  ) : positioning ? (
                    <Dots>Adjust Farming</Dots>
                  ) : (
                    'Adjust Farm'
                  )}
                </ButtonFarm>
              ) : (
                <ButtonFarm marginRight={32} disabled>
                  Debt Value must be greater than ${format(formatEther(minDebtSize))} less than $
                  {format(formatEther(remainingQuota))}
                </ButtonFarm>
              )
            ) : null}
            {/* <SimulatorButton>Simulator</SimulatorButton> */}
          </ButtonWrapper>
        </AutoColumn>
      ) : (
        'No data'
      )}
    </LendCard>
  )
}
