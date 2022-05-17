import styled from 'styled-components/macro'
import { Info } from 'react-feather'
import AppBody from 'pages/AppBody'
import Column, { AutoColumn } from '@src/components/Column'

export interface ChartProperties {
  locale: string
  debug: boolean
  fullscreen: boolean
  symbol: string
  interval: string
  theme: string
  allow_symbol_change: boolean
  timezone: string
  autosize: boolean
  toolbar_bg?: string
  disabled_features?: string[]
  overrides?: Record<string, unknown>
}

export const StyledInfo = styled(Info)`
  opacity: 0.4;
  color: ${({ theme }) => theme.text1};
  height: 16px;
  width: 16px;
  :hover {
    opacity: 0.8;
  }
`

export const OrderBookWrapper = styled(Column)`
  background: ${({ theme }) => theme.bg2};
`

export const StyledAppBody = styled(AppBody)`
  max-width: unset;
  padding: 10px 0px;
  border: unset;
  background: ${({ theme }) => theme.bg9};
`

export const TransactionContent = styled.div`
  display: grid;
  grid-template-columns: auto 1fr 316px;
  grid-gap: 5px;
  margin-top: 5px;
`

export const OrderWrapper = styled.div`
  width: 100%;
  background: ${({ theme }) => theme.bg9};
`

export const MarkerOrderWrapper = styled(AutoColumn)`
  background: ${({ theme }) => theme.bg9};
`

export const Input = styled.input<{ error?: boolean }>`
  font-size: 1.2rem;
  outline: none;
  border: 2px solid ${({ theme }) => theme.blueShade2};
  border-radius: 20px;
  flex: 1 1 auto;
  width: 0;
  max-width: 250px;
  background-color: ${({ theme }) => theme.blueShade};
  transition: color 300ms ${({ error }) => (error ? 'step-end' : 'step-start')};
  color: ${({ error, theme }) => (error ? theme.red1 : theme.text1)};
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
  ::placeholder {
    color: ${({ theme }) => theme.text4};
  }
  padding: 1rem 1rem 0.75rem 1rem;

  -webkit-appearance: textfield;

  ::-webkit-search-decoration {
    -webkit-appearance: none;
  }

  ::-webkit-outer-spin-button,
  ::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }

  ::placeholder {
    color: ${({ theme }) => theme.text4};
  }
`
