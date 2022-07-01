import { Text } from 'rebass'
import { useMemo } from 'react'
import styled from 'styled-components/macro'
import { Link } from 'react-router-dom'
import { TYPE } from '@src/theme'

import { useVaultContract, useTokenContract, useVaultConfigContract } from '@src/custom/hooks/useContract'
import { useSingleCallResult } from 'state/multicall/hooks'
import { formatEther } from '@ethersproject/units'
import { useActiveWeb3React } from '@src/hooks/web3'

import { ButtonOutlined } from '@src/components/Button'
import Card from '@src/components/Card'
import { AutoColumn } from '@src/components/Column'
import Row, { RowFixed } from '@src/components/Row'
import { IconWrapper } from '@src/custom/components/AccountDetails/AccountDetailsMod'

import Lends from 'constants/tokenLists/lend-default.tokenlist.json'

export interface TokenMeta {
  name: string
  symbol: string
  address: string
  chainId: number
  decimals: number
  logoURI: string
  active?: boolean
  value?: string
  disabled?: boolean
}

export const LendCard = styled(Card)`
  position: relative;
  margin: 40px 0px 120px;
  width: 1200px;

  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 32px 36px;
`
export const LendBackground = styled.div<{ background?: string }>`
  position: absolute;
  width: 771px;
  height: 267px;
  top: 350px;
  left: 50%;
  right: 50%;
  transform: translate(-50%, -50%);
  background: ${({ background }) => (background ? background : 'rgba(182, 92, 252, 0.29)')};
  filter: blur(288px);
  z-index: -1;
`
export const Line = styled(Row)`
  width: 100%;
  height: 1px;
  background: ${({ theme }) => theme.bg10};
`

export const ApyText = styled(Text)`
  width: fit-content;
  background: linear-gradient(90deg, #76ff84 0%, #ffbe15 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;

  text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
`
export const LendHeader = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 135px repeat(6, 1fr);
  grid-gap: 20px;
`
export const LendHederWrap = styled.div<{ algin?: 'start' | 'center' | 'end' }>`
  text-align: ${({ algin }) => algin ?? 'start'};
`

export const LendButtonOutlined = styled(ButtonOutlined)`
  width: 120px;
  border: 1px solid ${({ theme }) => theme.bg10};
  padding: 8px;
  &:focus {
    box-shadow: 0 0 0 1px ${({ theme }) => theme.bg10};
  }
  &:hover {
    box-shadow: 0 0 0 1px ${({ theme }) => theme.bg10};
  }
  &:active {
    box-shadow: 0 0 0 1px ${({ theme }) => theme.bg10};
  }
  &:disabled {
    opacity: 50%;
    cursor: auto;
  }
`

export const LendItemWrapper = styled(LendHeader)`
  padding: 0;
  align-items: center;
`

// const ONE_YEAR = 3600 * 24 * 365

const ONE_DAY = 3600 * 24

export default function Lend() {
  return (
    <LendCard>
      <LendBackground />
      <TYPE.mediumHeader>Active Pools ({Lends.tokens.length ?? 0})</TYPE.mediumHeader>
      <Line opacity={0.5} marginTop={32} marginBottom={24} />
      <AutoColumn gap={'lg'}>
        <LendHeader>
          <LendHederWrap algin={'center'}>Pool</LendHederWrap>
          <LendHederWrap>APY</LendHederWrap>
          <LendHederWrap>Total Supply</LendHederWrap>
          <LendHederWrap>Total Borrowed</LendHederWrap>
          <LendHederWrap>Utilization</LendHederWrap>
          <LendHederWrap>Your Balance</LendHederWrap>
        </LendHeader>
        {Lends.tokens.map((item, index) => (
          <>
            <LendItem key={index} pay={item.in} get={item.out} />
            <Line opacity={0.15} />
          </>
        ))}
      </AutoColumn>
    </LendCard>
  )
}

function LendItem({ pay, get }: { pay: TokenMeta; get: TokenMeta }) {
  const { account } = useActiveWeb3React()

  const vaultConfigContract = useVaultConfigContract()

  const payTokenContract = useTokenContract(pay.address)

  const getContract = useVaultContract(get.address)

  // Erc20 balance
  const erc20Balance = useSingleCallResult(payTokenContract, 'balanceOf', [account ?? undefined])?.result?.[0]

  // total borrowed
  const vaultDebtVal = useSingleCallResult(getContract, 'vaultDebtVal')?.result?.[0]

  // total supply
  const totalToken = useSingleCallResult(getContract, 'totalToken')?.result?.[0]

  // ratePerSec
  const ratePerSec = useSingleCallResult(vaultConfigContract, 'getInterestRate', [vaultDebtVal, erc20Balance])
    ?.result?.[0]

  // utilization
  const utilization = useMemo(() => {
    if (!vaultDebtVal || !totalToken) return
    return vaultDebtVal.mul(10000).div(totalToken).toNumber() / 100
  }, [vaultDebtVal, totalToken])

  // // apr
  // const apr = useMemo(() => {
  //   if (!erc20Balance || erc20Balance <= 0 || !ratePerSec) return
  //   // (ratePerSec * ONE_YEAR) * 10000 / erc20Balance
  //   return ratePerSec.mul(ONE_YEAR).mul(10000).div(erc20Balance)
  // }, [erc20Balance, ratePerSec])

  /**
   * APY = (1 + Periodic Rate)^周期数– 1
   */
  const apy = useMemo(() => {
    if (!ratePerSec) return
    return (parseFloat(formatEther(ratePerSec.mul(ONE_DAY))) + 1) ** 365 - 1
  }, [ratePerSec])

  return (
    <LendItemWrapper>
      <RowFixed>
        <IconWrapper size={32}>
          <img src={pay.logoURI} alt={pay.symbol} />
        </IconWrapper>
        {pay.symbol}
      </RowFixed>
      <RowFixed>
        <ApyText fontSize={20}>{apy ? `${format(apy.toString())} %` : '-'}</ApyText>
      </RowFixed>
      <RowFixed>{totalToken ? `${format(formatEther(totalToken))} ${pay.symbol}` : '-'}</RowFixed>
      <RowFixed>{vaultDebtVal ? `${format(formatEther(vaultDebtVal))} ${pay.symbol}` : '-'}</RowFixed>
      <RowFixed>{utilization ? `${format(utilization.toString())} %` : '-'}</RowFixed>
      <RowFixed>{erc20Balance ? `${format(formatEther(erc20Balance))} ${pay.symbol}` : '-'}</RowFixed>
      <AutoColumn gap="5px" justify={'center'}>
        <LendButtonOutlined as={Link} to={`/lend/dep/${pay.address}/${get.address}`}>
          Deposit
        </LendButtonOutlined>
        <LendButtonOutlined as={Link} to={`/lend/wit/${get.address}/${pay.address}`}>
          Withdraw
        </LendButtonOutlined>
      </AutoColumn>
    </LendItemWrapper>
  )
}

export function format(num: string, digits = 2) {
  const newNum = parseFloat(num).toFixed(digits)
  if (newNum) {
    const nums = newNum.split('.')
    if (nums[1] && parseInt(nums[1]) > 0) {
      return newNum
    }
    return nums[0]
  }
  return num
}
