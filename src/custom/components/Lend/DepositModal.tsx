import { Trans } from '@lingui/macro'
import { ReactNode, useCallback } from 'react'
import TransactionConfirmationModal, {
  ConfirmationModalContent,
  TransactionErrorContent,
} from '../TransactionConfirmationModal/TransactionConfirmationUniversalModal'

import ModalFooter from './ModalFooter'
import ModalHeader from './ModalHeader'

export default function DepositModal({
  onConfirm,
  onDismiss,
  errorMessage,
  isOpen,
  attemptingTxn,
  txHash,
}: {
  onConfirm: () => void
  onDismiss: () => void
  errorMessage: ReactNode | undefined
  isOpen: boolean
  attemptingTxn: boolean
  txHash: string | undefined
}) {
  const modalHeader = useCallback(() => <ModalHeader />, [])

  const modalBottom = useCallback(
    () => <ModalFooter onConfirm={onConfirm} disabledConfirm={false} swapErrorMessage={errorMessage} />,
    [onConfirm, errorMessage]
  )
  // text to show while loading
  const pendingText = <Trans>Cancel of order </Trans>

  const confirmationContent = useCallback(
    () =>
      errorMessage ? (
        <TransactionErrorContent onDismiss={onDismiss} message={errorMessage} />
      ) : (
        <ConfirmationModalContent
          title={'Depositing'}
          onDismiss={onDismiss}
          topContent={modalHeader}
          bottomContent={modalBottom}
        />
      ),
    [onDismiss, modalBottom, modalHeader, errorMessage]
  )

  return (
    <TransactionConfirmationModal
      isOpen={isOpen}
      onDismiss={onDismiss}
      attemptingTxn={attemptingTxn}
      hash={txHash}
      content={confirmationContent}
      pendingText={pendingText}
      // currencyToAdd={trade?.outputAmount.currency}
    />
  )
}
