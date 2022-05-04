import styled from 'styled-components/macro'

const ChartWrapper = styled.div`
  width: 100%;
  height: 100%;
  min-height: 467px;
`
const KChartIframe = styled.iframe`
  border: none;
  width: 100%;
  height: 100%;
`
export default function TradingView() {
  return (
    <ChartWrapper>
      <KChartIframe
        src="https://xxx.komtoken.com/pair/0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc"
        title="uniswap kchart"
      />
    </ChartWrapper>
  )
}
