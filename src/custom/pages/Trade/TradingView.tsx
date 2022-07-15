import styled from 'styled-components/macro'

const ChartWrapper = styled.div`
  width: 100%;
  height: 100%;
  min-height: 467px;
  padding: 5px;
`
const KChartIframe = styled.iframe`
  border: none;
  width: 100%;
  overflow: hidden;
`
export default function TradingView() {
  return (
    <ChartWrapper>
      <KChartIframe
        height={'100%'}
        src="http://xxx.komtoken.com/pair/0xe0e92035077c39594793e61802a350347c320cf2"
        // src="http://localhost:3001/pair/0xe0e92035077c39594793e61802a350347c320cf2"
        title="uniswap kchart"
      />
    </ChartWrapper>
  )
}
