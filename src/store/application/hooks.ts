import { useCallback, useMemo } from 'react';
import { DEFAULT_TXN_DISMISS_MS } from '../../constants/misc';
import useActiveWeb3React from '../../hooks/useActiveWeb3React';
import { AppState, useAppDispatch, useAppSelector } from '../index';
import {
  addPopup,
  ApplicationModal,
  ApplicationState,
  PopupContent,
  removePopup,
  setOpenModal,
} from './reducer';

export function useApplication(): ApplicationState {
  return useAppSelector((state: AppState) => state.application);
}

export function useBlockNumber(): number | undefined {
  const { chainId } = useActiveWeb3React();

  return useAppSelector((state: AppState) => state.application.blockNumber[chainId ?? -1]);
}

export function useModalOpen(modal: ApplicationModal): boolean {
  const openModal = useAppSelector((state: AppState) => state.application.openModal);
  return openModal === modal;
}

export function useToggleModal(modal: ApplicationModal): () => void {
  const open = useModalOpen(modal);
  const dispatch = useAppDispatch();
  return useCallback(() => dispatch(setOpenModal(open ? null : modal)), [dispatch, modal, open]);
}

export function useWalletModalToggle(): () => void {
  return useToggleModal(ApplicationModal.WALLET);
}

export function useToggleSettingsMenu(): () => void {
  return useToggleModal(ApplicationModal.SETTINGS);
}

export function useShowClaimPopup(): boolean {
  return useModalOpen(ApplicationModal.CLAIM_POPUP);
}

export function useToggleShowClaimPopup(): () => void {
  return useToggleModal(ApplicationModal.CLAIM_POPUP);
}

export function useToggleSelfClaimModal(): () => void {
  return useToggleModal(ApplicationModal.SELF_CLAIM);
}

export function useToggleDelegateModal(): () => void {
  return useToggleModal(ApplicationModal.DELEGATE);
}

export function useToggleVoteModal(): () => void {
  return useToggleModal(ApplicationModal.VOTE);
}

export function useTogglePrivacyPolicy(): () => void {
  return useToggleModal(ApplicationModal.PRIVACY_POLICY);
}

export function useManagePresaleModalToggle(): () => void {
  return useToggleModal(ApplicationModal.MANAGE_PRESALE);
}
export function useShareModalToggle(): () => void {
  return useToggleModal(ApplicationModal.SHARE);
}

export function useValidateAndConfirmToggleModal(): () => void {
  return useToggleModal(ApplicationModal.VALIDATE_AND_CONFIRM);
}

// returns a function that allows adding a popup
export function useAddPopup(): (
  content: PopupContent,
  key?: string,
  removeAfterMs?: number,
) => void {
  const dispatch = useAppDispatch();

  return useCallback(
    (content: PopupContent, key?: string, removeAfterMs?: number) => {
      dispatch(addPopup({ content, key, removeAfterMs: removeAfterMs ?? DEFAULT_TXN_DISMISS_MS }));
    },
    [dispatch],
  );
}

// returns a function that allows removing a popup via its key
export function useRemovePopup(): (key: string) => void {
  const dispatch = useAppDispatch();
  return useCallback(
    (key: string) => {
      dispatch(removePopup({ key }));
    },
    [dispatch],
  );
}

// get the list of active popups
export function useActivePopups(): AppState['application']['popupList'] {
  const list = useAppSelector((state: AppState) => state.application.popupList);
  return useMemo(() => list.filter((item) => item.show), [list]);
}
