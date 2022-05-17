import { ChartProperties } from '@src/custom/pages/OrderBook/styleds'
import { useCallback, useContext, useEffect, useRef } from 'react'
import styled, { ThemeContext } from 'styled-components/macro'
import binanceAPI from '../../api/binanceSer'

type Props = { chartProperties: ChartProperties }

const TradingViewChartWrapper = styled.div`
  padding: 0 10px;
  height: 467px;
`
export default function TradingViewChart({ chartProperties }: Props) {
  const theme = useContext(ThemeContext)
  const mounting = useRef(true)
  const tradingViewWidget = useRef<any>()
  const chartObject = useRef<any>()

  const bfAPI = new binanceAPI({ debug: true })
  const widgetOptions = {
    container_id: 'chart_container',
    datafeed: bfAPI,
    library_path: '/charting_library/',
    toolbar_bg: theme.bg9,
    disabled_features,
    overrides: {
      'paneProperties.background': theme.bg9,
      // 'paneProperties.vertGridProperties.color': theme.bg9,
      // 'paneProperties.horzGridProperties.color': theme.bg9,
    },
    ...chartProperties,
  }

  const chartReady = useCallback(() => {
    if (!tradingViewWidget.current) return
    tradingViewWidget.current.onChartReady(() => {
      chartObject.current = tradingViewWidget.current.activeChart()
    })
  }, [tradingViewWidget])

  useEffect(() => {
    if (mounting.current) {
      mounting.current = false
      return
    }
    if (!tradingViewWidget) return
  }, [])

  useEffect(() => {
    // @ts-ignore
    tradingViewWidget.current = window.tvWidget = new window.TradingView.widget(widgetOptions)
    chartReady()

    return () => {
      console.log('销毁')
    }
  }, [])

  return <TradingViewChartWrapper id="chart_container" />
}

const disabled_features = [
  // 'use_localstorage_for_settings',
  'volume_force_overlay',
  'header_compare',
  //"header_symbol_search",
  //"header_resolutions",
  'header_interval_dialog_button',
  //"show_interval_dialog_on_key_press",
  'caption_buttons_text_if_possible',
  'header_undo_redo',
  'header_screenshot',
  'header_chart_type',
  'display_market_stauts',
  'study_templates',
  'left_toolbar',
  //  "go_to_date",
  'items_favoriting',
  'header_indicators',
  'header_fullscreen_button',
  'header_settings',
  'header_saveload',

  // 'volume_force_overlay',
  // 'create_volume_indicator_by_default',
  // 'create_volume_indicator_by_default_once',
]
