import { useCallback, useContext, useEffect, useState } from 'react'

import styled, { ThemeContext } from 'styled-components/macro'
import { Text } from 'rebass'
import Column from 'components/Column'
import Row from 'components/Row'
import { ButtonDropRise } from 'components/Button'
import column from 'components/Column'
import { TokenMeta } from '../../Lend'
import { IconWrapper } from '@src/custom/components/AccountDetails/AccountDetailsMod'

interface OptionProps {
  proposals: Array<TokenMeta>
  proposal: TokenMeta
  isOpen: boolean
  afterSelect: () => void
  onSelect: (id: number) => void
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
  width: 130px;
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
  onSelect,
}: {
  proposals: Array<TokenMeta>
  proposal: TokenMeta
  onSelect: (index: number) => void
}) {
  const theme = useContext(ThemeContext)
  const [open, setOpen] = useState(false)
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
          <ProposalText color={theme.text1}>
            <IconWrapper size={16}>
              <img src={proposal.logoURI} alt={proposal.symbol} />
            </IconWrapper>
            {proposal.symbol}
          </ProposalText>
        </ActionDropDown>
      </SelectContainer>
      <SelectOptions
        proposals={proposals}
        proposal={proposal}
        isOpen={open}
        afterSelect={afterSelect}
        onSelect={onSelect}
      />
    </SelectColumn>
  )
}

export function SelectOptions({ proposals, proposal, isOpen, afterSelect, onSelect }: OptionProps) {
  //const theme = useContext(ThemeContext)
  const [overflow, setOverflow] = useState('hidden')
  const handleClick = useCallback(
    (id: number) => {
      onSelect(id)
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
            {proposals.map((p, index) => (
              <>
                <MidItem key={index} active={p.address == proposal.address} onClick={() => handleClick(index)}>
                  <IconWrapper size={16}>
                    <img src={p.logoURI} alt={p.symbol} />
                  </IconWrapper>
                  <OptionText fontWeight={500}>{p.symbol}</OptionText>
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
