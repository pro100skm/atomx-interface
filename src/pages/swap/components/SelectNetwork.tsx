import { ALL_SUPPORTED_CHAIN_IDS, CHAIN_INFO } from '../../../constants/chains';
import Select from '../../../components/Common/Inputs/Select';
import { ChainId } from '../../../interfaces/connection-config.interface';
import { useLocation, useNavigate } from 'react-router-dom';
import { IURLSwapParams } from './types';
import { useSwapChainInfo } from '../../../hooks/useSwapChainInfo';

export const SelectNetwork = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const urlSearchParams = new URLSearchParams(search);
  const { initiateChainId } = useSwapChainInfo();

  const handleChange = (v: ChainId) => {
    urlSearchParams.set(IURLSwapParams.sellChainId, String(v));
    navigate(`${window.location.pathname}?${urlSearchParams.toString()}`, { replace: true });
  };

  return (
    <Select
      // label='Select Network'
      value={initiateChainId}
      change={(v) => handleChange(v)}
      options={ALL_SUPPORTED_CHAIN_IDS.map((id) => ({
        label: CHAIN_INFO[id].label,
        value: id,
      }))}
    />
  );
};
