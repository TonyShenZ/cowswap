import { useCallback, useContext, useEffect, useMemo, useState } from 'react'

import styled, { ThemeContext } from 'styled-components/macro'
import { Text } from 'rebass'
import Column from 'components/Column'
import Row from 'components/Row'
import { ButtonDropRise } from 'components/Button'
import column from 'components/Column'
import { format } from '../../Lend'
import { VaultMeta } from '..'
import { useCurrency } from '@src/hooks/Tokens'
import CurrencyLogo from '@src/components/CurrencyLogo'
import { Currency } from '@uniswap/sdk-core'

interface OptionProps {
  proposals: Array<VaultMeta>
  activeAddress: string
  leverage: number
  tokenCurrency: Currency | undefined | null
  isOpen: boolean
  afterSelect: () => void
  onSelect: (vault: VaultMeta) => void
}

const MidItem = styled(Row)<{ active?: boolean }>`
  padding: 5px 12px;
  cursor: ${({ disabled }) => !disabled && 'pointer'};
  pointer-events: ${({ disabled }) => disabled && 'none'};
  color: ${({ theme, active }) => (active ? theme.text3 : theme.text1)};
  :hover {
    color: ${({ theme }) => theme.text3};
  }
  opacity: ${({ disabled, selected }) => (disabled || selected ? 0.5 : 1)};
`

const ContentWrapper = styled(Column)`
  width: 100%;
  flex: 1;
  padding: 4px 0;
  position: relative;
  border-radius: 12px;
  background: ${({ theme }) => theme.bg9};
`
const ActionDropDown = styled(ButtonDropRise)`
  background: ${({ theme }) => theme.bg9};
  color: ${({ theme }) => theme.bg10};
  padding: 8px 12px;
  font-size: 14px;
  border-radius: 12px;
  :hover,
  :active,
  :focus {
    outline: 0px;
    box-shadow: none;
    background: ${({ theme }) => theme.bg9};
    color: ${({ theme }) => theme.bg10};
  }
`
const SelectColumn = styled(column)`
  position: relative;
`
const OptionsWrapper = styled(Row)`
  top: 40px;
  position: absolute;
  z-index: 2;
`
const ProposalText = styled(Text)`
  text-overflow: clip;
  white-space: nowrap;
  overflow: hidden;
  font-size: 14px;
  display: flex;
  justify-content: flex-start;
`
const OptionText = styled(Text)`
  text-overflow: clip;
  white-space: nowrap;
  overflow: hidden;
  font-size: 14px;
`

const SelectContainer = styled.div`
  flex: 1;
`
const Separator = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${({ theme }) => theme.bg9};
`
export default function CommonSelect({
  proposals,
  proposal,
  leverage,
  onSelect,
}: {
  proposals: Array<VaultMeta>
  proposal: VaultMeta
  leverage: number
  onSelect: (vault: VaultMeta) => void
}) {
  const theme = useContext(ThemeContext)
  const tokenCurrency = useCurrency(proposal.base_token)
  const [open, setOpen] = useState(false)

  const borrowFee = useMemo(() => {
    if (!proposal.daily_borrow_interest) return '0'
    const v = -parseFloat(proposal.daily_borrow_interest) * 365 * 100 * (leverage ?? 1 - 1)
    return v.toString()
  }, [proposal, leverage])

  function clickSelect() {
    open ? setOpen(false) : setOpen(true)
  }
  function handleBlur() {
    setTimeout(() => {
      setOpen(false)
    }, 300)
  }
  const afterSelect = useCallback(() => {
    setOpen(false)
  }, [])
  return (
    <SelectColumn>
      <SelectContainer border-color={theme.text2}>
        <ActionDropDown down={!open} onClick={clickSelect} onBlur={handleBlur}>
          <CurrencyLogo size={'16px'} currency={tokenCurrency} />
          <ProposalText color={theme.text1} marginX={'8px'}>
            {tokenCurrency?.symbol}
          </ProposalText>
          <ProposalText color={theme.text1}>{format(borrowFee)} %</ProposalText>
        </ActionDropDown>
      </SelectContainer>
      <SelectOptions
        proposals={proposals}
        activeAddress={proposal.address}
        leverage={leverage}
        tokenCurrency={tokenCurrency}
        isOpen={open}
        afterSelect={afterSelect}
        onSelect={onSelect}
      />
    </SelectColumn>
  )
}

export function SelectOptions({
  proposals,
  activeAddress,
  leverage,
  tokenCurrency,
  isOpen,
  afterSelect,
  onSelect,
}: OptionProps) {
  //const theme = useContext(ThemeContext)
  const [overflow, setOverflow] = useState('hidden')

  const handleClick = useCallback(
    (vault: VaultMeta) => {
      onSelect(vault)
      afterSelect()
    },
    [afterSelect, onSelect]
  )

  useEffect(() => {
    isOpen ? setOverflow('visible') : setOverflow('hidden')
  }, [isOpen])
  return (
    <>
      {isOpen && (
        <OptionsWrapper overflow={overflow}>
          <ContentWrapper>
            {proposals.map((p) => (
              <>
                <MidItem key={p.address} active={p.address == activeAddress} onClick={() => handleClick(p)}>
                  <CurrencyLogo size={'16px'} currency={tokenCurrency} />
                  <OptionText fontWeight={500} marginX={'8px'}>
                    {tokenCurrency?.symbol}
                  </OptionText>
                  <OptionText>
                    {format(String(-parseFloat(p.daily_borrow_interest ?? '0') * 365 * 100 * (leverage ?? 1 - 1)))} %
                  </OptionText>
                </MidItem>
                <Separator />
              </>
            ))}
          </ContentWrapper>
        </OptionsWrapper>
      )}
    </>
  )
}
