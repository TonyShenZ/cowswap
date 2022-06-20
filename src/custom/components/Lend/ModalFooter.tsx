import { Trans } from '@lingui/macro'
import { ReactNode } from 'react'
import { Text } from 'rebass'

import { ButtonError } from '../Button'
import { SwapCallbackError } from '@src/components/swap/styleds'
import { AutoRow } from '@src/components/Row'

export default function SwapModalFooter({
  onConfirm,
  swapErrorMessage,
  disabledConfirm,
}: {
  onConfirm: () => void
  swapErrorMessage: ReactNode | undefined
  disabledConfirm: boolean
}) {
  return (
    <>
      <AutoRow>
        <ButtonError
          onClick={onConfirm}
          disabled={disabledConfirm}
          style={{ margin: '10px 0 0 0' }}
          id="confirm-or-send"
        >
          <Text fontSize={20} fontWeight={500}>
            <Trans>Confirm</Trans>
          </Text>
        </ButtonError>

        {swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
      </AutoRow>
    </>
  )
}
