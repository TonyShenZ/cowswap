import LimitModalFooterMod, { LimitModalFooterProps } from './LimitModalFooterMod'
import { RowBetween, RowFixed } from 'components/Row'
import styled from 'styled-components/macro'

const Wrapper = styled.div`
  ${RowBetween} > div,
  ${RowFixed} > div {
    color: ${({ theme }) => theme.text1};
  }
`

export default function LimitModalFooter(props: LimitModalFooterProps) {
  return (
    <Wrapper>
      <LimitModalFooterMod {...props} />
    </Wrapper>
  )
}
