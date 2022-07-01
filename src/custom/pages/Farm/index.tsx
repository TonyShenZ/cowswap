import { TYPE } from '@src/custom/theme'
import { Link } from 'react-router-dom'
import styled, { ThemeContext } from 'styled-components/macro'
import { Trans } from '@lingui/macro'
import { Label, Radio } from '@rebass/forms'
import { Box, Flex, Text } from 'rebass'
import { Search } from 'react-feather'
import {
  ApyText,
  format,
  LendBackground,
  LendButtonOutlined,
  LendCard,
  LendHeader,
  LendHederWrap,
  LendItemWrapper,
  Line,
  TokenMeta,
} from '../Lend'
import Row, { AutoRow, RowBetween, RowFixed } from '@src/components/Row'
import { AutoColumn } from '@src/custom/components/SearchModal/CommonBases'
import { IconWrapper } from '@src/custom/components/AccountDetails/AccountDetailsMod'
import { ButtonFarmPrimary } from '@src/components/Button'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { darken } from 'polished'
import CommonSelect from '@src/custom/pages/Farm/CommonSelect'
import { InputPanelWrapper } from '../Lend/LendDepPage'

import { get } from '@src/custom/utils/request'

import Farms from 'constants/tokenLists/farm-default.tokenlist.json'
// import { useV2FactoryContract } from '@src/custom/hooks/useContract'
// import { useSingleCallResult } from '@src/state/multicall/hooks'
export interface VaultMeta {
  address: string
  base_token: string
  daily_borrow_interest: string
  base_price: string
  workers: {
    address: string
    farm_token: string
    pair: string
    tvl: string
    trading_fee: string
  }[]
}
export interface PoolMeta {
  name: string
  source: number
  factory: string
  configKey: string
  leverage: number
  pairAddress: string
  tokenList: TokenMeta[]
}

const RadioComponents = styled(Radio)`
  & > input[type='radio' i] {
    background-color: transparent;
  }
`
export const FarmText = styled(Text)`
  line-height: 16px;
  font-weight: 700;
`
const FarmHeader = styled(LendHeader)`
  grid-template-columns: 1fr 1fr 2fr 1fr 1fr;
  grid-gap: 40px;
`
const MyPostionsWrapper = styled.div``
const AvailableWrapper = styled.div``

const FarmItemWrapper = styled(FarmHeader)`
  padding: 0;
  align-items: center;
`
const ThroughText = styled(FarmText)`
  text-decoration: line-through;
  color: #9da1af;
`
const RadioCheckedWrapper = styled(Row)`
  width: 100%;
  & > :not(:first-child) {
    margin-left: 12px;
  }
`
const RadioWrapper = styled(Box)<{ active?: boolean }>`
  background: ${({ theme, active }) => (active ? 'linear-gradient(90deg, #57CB44 0%, #4474F0 100%)' : theme.bg9)};
  padding: 6px 12px;
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  :hover {
    background: ${({ theme, active }) => (active ? '' : darken(0.5, theme.bg9))};
  }
`
const SelectComponents = styled.select<{ width?: string }>`
  outline: none;
  border: none;
  flex: 1 1 auto;
  background: ${({ theme }) => theme.bg9};
  color: ${({ theme }) => theme.bg10};
  font-size: 14px;
  border-radius: 12px;
  width: ${({ width }) => width ?? '96px'};
  padding: 5px;
`

const LeverageNumber = styled.input`
  outline: none;
  border: none;
  flex: 1 1 auto;
  background: ${({ theme }) => theme.bg9};
  color: ${({ theme }) => theme.bg10};
  font-size: 14px;
  border-radius: 12px;
  width: ${({ width }) => width ?? '96px'};
  padding: 8px 12px;
`

const SeachWrapper = styled(InputPanelWrapper)`
  padding: 6px;
`
export const InputComponents = styled.input`
  outline: none;
  border: none;
  flex: 1 1 auto;
  width: 0;
  background: transparent;
  color: ${({ theme }) => theme.bg10};
  font-size: 14px;
  border-radius: 12px;
  width: 130px;
  padding: 0 5px;
  -webkit-appearance: textfield;

  font-weight: 700;
  ::-webkit-search-decoration {
    -webkit-appearance: none;
  }

  ::-webkit-outer-spin-button,
  ::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }

  ::placeholder {
    color: ${({ theme }) => theme.bg11};
  }
`

export default function Farm() {
  const theme = useContext(ThemeContext)
  const myPosition = false

  // const factoryContract = useV2FactoryContract('0x768ACbc5886a39817e1197EedeD9f075fFBe3389')
  // const pair = useSingleCallResult(factoryContract, 'getPair', [
  //   '0xf5EB09f8a4bBE663b044f2eC10dE5237007925c8',
  //   '0xAC8B36d26f704c43cA3AAC6682083786eB83cf38',
  // ])
  // 0x07Ff8D9C794Eda4D13522552B3DB676134c89623
  // 0x07Ff8D9C794Eda4D13522552B3DB676134c89623
  // console.log(pair)

  const [dexIndex, setDexIndex] = useState(0)
  const dexList = useMemo(() => ['All', 'PancakeSwap', 'HashDEX'], [])

  const handleSelectDex = useCallback(
    (idx: number) => {
      setDexIndex(idx)
    },
    [setDexIndex]
  )

  const [assetsIndex, setAssetsIndex] = useState(0)
  const assetsList = useMemo(() => ['All', 'CAKE', 'BNB'], [])

  const handleSelectAssets = useCallback(
    (idx: number) => {
      setAssetsIndex(idx)
    },
    [setAssetsIndex]
  )

  return (
    <LendCard>
      <LendBackground background="rgba(132, 251, 186, 0.2)" />
      <AutoColumn gap="32px">
        {myPosition && (
          <MyPostionsWrapper>
            <Row>
              <TYPE.mediumHeader width={'auto'}>My Positons</TYPE.mediumHeader>
              <Flex marginLeft={'25px'}>
                <Box>
                  <Label al>
                    <RadioComponents name="color" id="active" value="active" />
                    <Text>Active</Text>
                  </Label>
                </Box>
                <Box marginLeft={12} alignItems="center">
                  <Label>
                    <RadioComponents name="color" id="liquidated" value="liquidated" />
                    <Text>Liquidated</Text>
                  </Label>
                </Box>
              </Flex>
            </Row>
            <Line opacity={0.5} marginTop={32} marginBottom={24} />
            <AutoColumn gap={'lg'}>
              <LendHeader>
                <LendHederWrap algin={'center'}>
                  <FarmText>Pool</FarmText>
                </LendHederWrap>
                <LendHederWrap>
                  <FarmText>Position Value</FarmText>
                </LendHederWrap>
                <LendHederWrap>
                  <FarmText>Debt Value</FarmText>
                </LendHederWrap>
                <LendHederWrap>
                  <FarmText>Equity Value</FarmText>
                </LendHederWrap>
                <LendHederWrap>
                  <FarmText>Current APY</FarmText>
                </LendHederWrap>
                <LendHederWrap>
                  <FarmText>Safety Buffer</FarmText>
                </LendHederWrap>
              </LendHeader>
              <PositonsItem />
              <Line opacity={0.15} />
            </AutoColumn>
          </MyPostionsWrapper>
        )}
        <AvailableWrapper>
          <AutoColumn gap="24px">
            <TYPE.mediumHeader>
              {Farms.name} ({Farms.pools.length})
            </TYPE.mediumHeader>
            <RowBetween>
              <AutoColumn gap="12px">
                <RadioCheckedWrapper>
                  <FarmText color={theme.text6} fontSize={14}>
                    Dex:
                  </FarmText>
                  {dexList.map((item, idx) => (
                    <RadioWrapper
                      paddingX={idx == 0 ? 23 : 12}
                      key={item}
                      onClick={() => handleSelectDex(idx)}
                      active={idx == dexIndex}
                    >
                      <FarmText fontSize={14}>{item}</FarmText>
                    </RadioWrapper>
                  ))}
                </RadioCheckedWrapper>
                <RadioCheckedWrapper>
                  <FarmText color={theme.text6} fontSize={14}>
                    Assets:
                  </FarmText>
                  {assetsList.map((item, idx) => (
                    <RadioWrapper
                      paddingX={idx == 0 ? 23 : 12}
                      key={item}
                      onClick={() => handleSelectAssets(idx)}
                      active={idx == assetsIndex}
                    >
                      <FarmText fontSize={14}>{item}</FarmText>
                    </RadioWrapper>
                  ))}
                </RadioCheckedWrapper>
              </AutoColumn>
              <AutoRow width={'unset'} alignSelf={'flex-end'} gap="16px">
                <Flex alignItems={'center'}>
                  <FarmText color={theme.text6} fontSize={14} mr={2}>
                    Sort by:
                  </FarmText>
                  <SelectComponents>
                    <option>APR</option>
                  </SelectComponents>
                </Flex>
                <Flex alignItems={'center'}>
                  <FarmText color={theme.text6} fontSize={14} mr={2}>
                    Search:
                  </FarmText>
                  <SeachWrapper>
                    <RowBetween>
                      <Search size={12} width={15} />
                      <InputComponents placeholder="Filter by symbol" />
                    </RowBetween>
                  </SeachWrapper>
                </Flex>
              </AutoRow>
            </RowBetween>
          </AutoColumn>

          <Line opacity={0.5} marginTop={32} marginBottom={24} />
          <AutoColumn gap={'lg'}>
            <FarmHeader>
              <LendHederWrap algin={'center'}>
                <FarmText>Pool</FarmText>
              </LendHederWrap>
              <LendHederWrap>
                <FarmText>APY</FarmText>
              </LendHederWrap>
              <LendHederWrap>
                <FarmText>APR</FarmText>
              </LendHederWrap>
              <LendHederWrap>
                <FarmText>Leverage</FarmText>
              </LendHederWrap>
              <LendHederWrap></LendHederWrap>
            </FarmHeader>
            {Farms.pools.map((pool) => (
              <AvailableItem key={pool.name} pool={pool} />
            ))}
          </AutoColumn>
        </AvailableWrapper>
      </AutoColumn>
    </LendCard>
  )
}

function AvailableItem({ pool }: { pool: PoolMeta }) {
  const [leverage, setLeverage] = useState(pool.leverage)

  const [vaultConfig, setVaultConfig] = useState([])

  const [proposal, setProposal] = useState<VaultMeta>()

  const handleProposal = useCallback(
    (vault: VaultMeta) => {
      setProposal(vault)
    },
    [setProposal]
  )

  const getVaultList = useCallback(async () => {
    const { result } = await get('/vault/list')
    setVaultConfig(result)
    setProposal(result[0])
  }, [setVaultConfig])

  // Minimum correction when out of focus
  const handleLeverageValueInputBlur = useCallback(() => {
    if (!leverage) setLeverage(1)
  }, [leverage, setLeverage])

  const poolFees = useMemo(() => {
    if (!proposal) return
    const tradingFees = parseFloat(proposal.workers[0].trading_fee) * 365 * 100 * leverage ?? 1
    const tvl = proposal.workers[0].tvl
    const totalApr = tradingFees - -parseFloat(proposal.daily_borrow_interest ?? '0') * 365 * 100 * 1
    const totalAprLeve = totalApr * (leverage ?? 1 - 1)
    const dailyApr = totalAprLeve / 365
    const totalApy = ((1 + dailyApr / 100) ** 365 - 1) * 100
    const originalApy = ((1 + totalApr / 365 / 100) ** 365 - 1) * 100
    return {
      tradingFees,
      tvl,
      totalApr: totalAprLeve.toString(),
      dailyApr: dailyApr.toString(),
      totalApy: totalApy.toString(),
      originalApy: originalApy.toString(),
    }
  }, [leverage, proposal])

  useEffect(() => {
    getVaultList()
  }, [getVaultList])

  return (
    <FarmItemWrapper>
      <RowFixed>
        <IconWrapper size={32}>{/* <img src={pay.logoURI} alt={pay.symbol} /> */}</IconWrapper>
        <AutoColumn gap="8px">
          <FarmText>{pool.name}</FarmText>
          <FarmText fontSize={14}>{replaceSource(pool.source)}</FarmText>
          <FarmText fontSize={14}>TVL ${poolFees?.tvl ? format(poolFees.tvl) : '-'}</FarmText>
        </AutoColumn>
      </RowFixed>
      <RowFixed>
        <AutoColumn gap="8px">
          <ApyText fontSize={20}>{poolFees?.totalApy ? `${format(poolFees?.totalApy)} %` : '-'}</ApyText>
          <ThroughText fontSize={14}>{poolFees?.originalApy ? `${format(poolFees?.originalApy)} %` : '-'} </ThroughText>
        </AutoColumn>
      </RowFixed>

      <AutoColumn gap="8px" style={{ width: '100%' }}>
        <RowBetween>
          <FarmText fontSize={14}>Yield Farming:</FarmText>
          <FarmText fontSize={14}>0%</FarmText>
        </RowBetween>
        <RowBetween>
          <FarmText fontSize={14}>Trading Fees:</FarmText>
          <FarmText fontSize={14}>{poolFees?.tradingFees ? `${poolFees.tradingFees.toFixed(6)} %` : '-'}</FarmText>
        </RowBetween>
        <RowBetween>
          <FarmText fontSize={14}>Borrowing Income:</FarmText>
          {vaultConfig && vaultConfig.length > 0 && proposal ? (
            <CommonSelect proposals={vaultConfig} leverage={leverage} proposal={proposal} onSelect={handleProposal} />
          ) : null}
        </RowBetween>
        <RowBetween>
          <FarmText fontSize={14}>Total APR:</FarmText>
          <ApyText fontSize={14}>{poolFees?.totalApr ? `${format(poolFees.totalApr)} %` : '-'}</ApyText>
        </RowBetween>
        <RowBetween>
          <FarmText fontSize={14}>Daily APR:</FarmText>
          <FarmText fontSize={14}>{poolFees?.dailyApr ? `${format(poolFees.dailyApr, 4)} %` : '-'}</FarmText>
        </RowBetween>
      </AutoColumn>

      <RowFixed>
        <LeverageNumber
          type="number"
          id="leverageInput"
          min={1}
          max={pool.leverage}
          value={leverage}
          onBlur={handleLeverageValueInputBlur}
          onChange={(l) => {
            setLeverage(parseInt(l.target.value))
          }}
        />
      </RowFixed>
      <AutoColumn gap="5px" justify={'center'}>
        <ButtonFarmPrimary padding={'8px'} width={'120px'} as={Link} to={`/farm/${pool.configKey}/${leverage}`}>
          Farm
        </ButtonFarmPrimary>
      </AutoColumn>
    </FarmItemWrapper>
  )
}

function PositonsItem() {
  return (
    <LendItemWrapper>
      <RowFixed>
        <IconWrapper size={32}>{/* <img src={pay.logoURI} alt={pay.symbol} /> */}</IconWrapper>
        <AutoColumn>
          <FarmText>BNB-USDT</FarmText>
          <FarmText fontSize={14}> Pancake Swap</FarmText>
        </AutoColumn>
      </RowFixed>
      <RowFixed>
        <FarmText>320.12 USDT</FarmText>
      </RowFixed>
      <RowFixed>
        <FarmText>320.12 USDT</FarmText>
      </RowFixed>
      <RowFixed>
        <FarmText>320.12 USDT</FarmText>
      </RowFixed>
      <RowFixed>
        <FarmText>32.92%</FarmText>
      </RowFixed>
      <RowFixed>
        <FarmText>9%</FarmText>
      </RowFixed>
      <AutoColumn gap="5px" justify={'center'}>
        <ButtonFarmPrimary padding={'8px'} width={'120px'}>
          Adjust
        </ButtonFarmPrimary>
        <LendButtonOutlined>Close</LendButtonOutlined>
      </AutoColumn>
    </LendItemWrapper>
  )
}

export function replaceSource(sourceKey: number) {
  switch (sourceKey) {
    case 1:
      return <Trans>Pancake Swap</Trans>
    default:
      return <Trans>HashDEX</Trans>
  }
}
