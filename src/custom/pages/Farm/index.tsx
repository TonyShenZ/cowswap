import { TYPE } from '@src/custom/theme'
import { Link } from 'react-router-dom'
import styled, { ThemeContext } from 'styled-components/macro'
import { Trans } from '@lingui/macro'
import { useV2FactoryContract } from '@src/custom/hooks/useContract'
import { Label, Radio } from '@rebass/forms'
import { Box, Flex, Text } from 'rebass'
import { Search } from 'react-feather'
import {
  ApyText,
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

import Farms from 'constants/tokenLists/farm-default.tokenlist.json'
import { InputPanelWrapper } from '../Lend/LendDepPage'
// import { useSingleCallResult } from '@src/state/multicall/hooks'

interface PoolMeta {
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
const FarmText = styled(Text)`
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
    color: #9da1af;
  }
`

export default function Farm() {
  const theme = useContext(ThemeContext)
  const myPosition = false

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
  // const factoryContract = useV2FactoryContract(pool.factory)
  // console.log(factoryContract)

  // const getPair = useSingleCallResult(
  //   factoryContract,
  //   'getPair',
  //   pool.pair.map((x) => x.address)
  // )
  // console.log(pool.pair.map((x) => x.address))

  // console.log(getPair)

  const [leverage, setLeverage] = useState(pool.leverage)

  const [select, setSelect] = useState(1)
  const [proposal, setProposal] = useState(pool.tokenList[select])
  const handleProposal = (index: number) => {
    if (select === index) return
    setSelect(index)
    setProposal(pool.tokenList[index])
  }

  return (
    <FarmItemWrapper>
      <RowFixed>
        <IconWrapper size={32}>{/* <img src={pay.logoURI} alt={pay.symbol} /> */}</IconWrapper>
        <AutoColumn gap="8px">
          <FarmText>{pool.name}</FarmText>
          <FarmText fontSize={14}>{replaceSource(pool.source)}</FarmText>
          <FarmText fontSize={14}>TVL $8.26M</FarmText>
        </AutoColumn>
      </RowFixed>
      <RowFixed>
        <AutoColumn gap="8px">
          <ApyText fontSize={20}>30.12%</ApyText>
          <ThroughText fontSize={14}>15.12%</ThroughText>
        </AutoColumn>
      </RowFixed>

      <AutoColumn gap="8px" style={{ width: '100%' }}>
        <RowBetween>
          <FarmText fontSize={14}>Yield Farming:</FarmText>
          <FarmText fontSize={14}>0%</FarmText>
        </RowBetween>
        <RowBetween>
          <FarmText fontSize={14}>Trading Fees:</FarmText>
          <FarmText fontSize={14}>7.35%</FarmText>
        </RowBetween>
        <RowBetween>
          <FarmText fontSize={14}>Borrowing Income:</FarmText>
          {/* <div>
            <SelectComponents width="153px" onChange={(s) => console.log(s.target.value)}>
              {pool.pair.map((t) => (
                <option key={t.address} value={t.address}>
                  <IconWrapper size={32}></IconWrapper>
                  {t.symbol}
                </option>
              ))}
            </SelectComponents>
          </div> */}
          <CommonSelect proposals={pool.tokenList} proposal={proposal} onSelect={handleProposal} />
        </RowBetween>
        <RowBetween>
          <FarmText fontSize={14}>Total APR:</FarmText>
          <ApyText fontSize={14}>7.87%</ApyText>
        </RowBetween>
        <RowBetween>
          <FarmText fontSize={14}>Daily APR:</FarmText>
          <FarmText fontSize={14}>0.0197%</FarmText>
        </RowBetween>
      </AutoColumn>

      <RowFixed>
        <LeverageNumber
          type="number"
          id="leverageInput"
          min={1}
          max={leverage}
          value={leverage}
          onChange={(l) => setLeverage(parseInt(l.target.value))}
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
