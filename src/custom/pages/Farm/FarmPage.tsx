import { useContext, useMemo, useState, useCallback } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import { formatEther } from '@ethersproject/units'
import styled, { ThemeContext } from 'styled-components/macro'
import { format, LendBackground, LendCard, Line } from '../Lend'
import { AutoColumn } from '@src/components/Column'
import { TYPE } from '@src/theme'
import { InputComponents, replaceSource } from '.'
import { RowBetween } from '@src/components/Row'
import { InputPanelWrapper } from '../Lend/LendDepPage'
import { useCurrency } from '@src/hooks/Tokens'
import { useMultipleContractSingleData } from '@src/state/multicall/hooks'
import { Erc20__factory } from '@src/abis/types'
import { useActiveWeb3React } from '@src/hooks/web3'
import Input from '@src/components/NumericalInput'

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
const InputWrapper = styled(Input)`
  text-align: left;
  background: transparent;
`

export default function FarmPage({
  match: {
    params: { configKey, leverage },
  },
}: RouteComponentProps<{ configKey: string; leverage: string }>) {
  const theme = useContext(ThemeContext)
  const { account } = useActiveWeb3React()

  const poolInfo = useMemo(() => {
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

  const [tokensValue, setTokensValue] = useState<string[]>(['', ''])

  const handleAmountValueInput = useCallback(
    (index: number, value: string) => {
      const obj = tokensValue.concat()
      obj[index] = value
      setTokensValue(obj)
    },
    [setTokensValue, tokensValue]
  )
  // Batch query exchange rate

  return (
    <LendCard>
      <LendBackground background="rgba(132, 251, 186, 0.2)" />
      {poolInfo ? (
        <AutoColumn gap="24px">
          <TYPE.mediumHeader>
            Farm {poolInfo.name} {replaceSource(poolInfo.source)} pool
          </TYPE.mediumHeader>
          <Line opacity={0.5} />
          <RowBetween>
            {poolInfo.tokenList.map((t, i) => (
              <BalanceWrapper gap={'12px'} key={t.address}>
                <TYPE.body color={theme.text5} fontWeight={700} fontSize={14}>
                  Available Balance:{' '}
                  {tokensBalance[i]?.result ? format(formatEther(tokensBalance[i]?.result?.[0])) : '-'} {t.symbol}
                </TYPE.body>
                <SeachWrapper>
                  <RowBetween>
                    <InputWrapper
                      placeholder="0.00"
                      value={tokensValue[i]}
                      onUserInput={(v) => handleAmountValueInput(i, v)}
                    />
                    {t.symbol}
                  </RowBetween>
                </SeachWrapper>
                <TYPE.body color={theme.text5} fontWeight={700} fontSize={14}>
                  1 {t.symbol} = 1 {t.symbol}
                </TYPE.body>
              </BalanceWrapper>
            ))}
          </RowBetween>
          <div>{configKey}</div>
          <div>{leverage}</div>
        </AutoColumn>
      ) : (
        'No data'
      )}
    </LendCard>
  )
}
