import { useMemo } from 'react'
import styled from 'styled-components/macro'
import { Slider, SliderMarker } from '@reach/slider'
import '@reach/slider/styles.css'
import { Text } from 'rebass'

const SliderWrapper = styled(Slider)`
  cursor: pointer;
  & > [data-reach-slider-track] {
    background: rgb(255 255 255 / 50%);
    & > [data-reach-slider-range] {
      background: #fff;
    }
    & > [data-reach-slider-handle] {
      background: #fff;
    }
  }
`
const SliderMarkerWrapper = styled(SliderMarker)`
  &[data-reach-slider-marker] {
    background: #212326;
    transform-origin: center;
    border-radius: 50%;
    border: 1px solid ${({ theme }) => theme.bg10};
    &[data-orientation='horizontal'] {
      width: 0.75rem;
      height: 0.75rem;
    }
  }
`
const MarketSpan = styled(Text)`
  position: absolute;
  top: 15px;
  left: -9px;
`
export default function LeverageSlider({
  max,
  value,
  defaultValue,
  change,
}: {
  max: number
  value: number | undefined
  defaultValue?: number
  change: (i: any) => void
}) {
  const markers = useMemo(() => {
    // eslint-disable-next-line prefer-const
    let m: number[] = []
    if (!max) return m
    for (let index = 1; index <= max; index += 0.5) {
      m.push(index)
    }
    return m
  }, [max])

  return (
    <SliderWrapper min={1} max={max} step={0.01} defaultValue={defaultValue} value={value} onChange={change}>
      {markers.map((x) => (
        <SliderMarkerWrapper value={x} key={x}>
          <MarketSpan fontSize={14}>{x.toFixed(2)}</MarketSpan>
        </SliderMarkerWrapper>
      ))}
    </SliderWrapper>
  )
}
