import { Trans } from '@lingui/macro'

import ConfirmLimitModalMod from './ConfirmLimitModalMod'
import TradeGp from 'state/swap/TradeGp'
import { formatMax, formatSmart } from 'utils/format'
import { AMOUNT_PRECISION } from 'constants/index'

export * from './ConfirmLimitModalMod'

function PendingText(props: { trade: TradeGp | undefined }): JSX.Element {
  const { trade } = props
  const inputAmount = trade?.inputAmount
  const inputSymbol = inputAmount?.currency?.symbol
  const outputAmount = trade?.outputAmountWithoutFee
  const outputSymbol = outputAmount?.currency?.symbol

  return (
    <Trans>
      Swapping{' '}
      <span title={`${formatMax(inputAmount, inputAmount?.currency.decimals)} ${inputSymbol}`}>
        {formatSmart(inputAmount, AMOUNT_PRECISION)} {inputSymbol}
      </span>{' '}
      for{' '}
      <span title={`${formatMax(outputAmount, outputAmount?.currency.decimals)} ${outputSymbol}`}>
        {formatSmart(outputAmount, AMOUNT_PRECISION)} {outputSymbol}
      </span>
    </Trans>
  )
}

export default function ConfirmLimitModal(
  props: Omit<Parameters<typeof ConfirmLimitModalMod>[0], 'PendingTextComponent'>
) {
  return <ConfirmLimitModalMod {...props} PendingTextComponent={PendingText} />
}
