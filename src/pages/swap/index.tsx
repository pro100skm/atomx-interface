import { Link, Route, Routes } from 'react-router-dom';
import styled from 'styled-components';
import { ButtonGreen, ButtonRed } from '../../components/Common/Button';
import Div from '../../components/Common/Div';
import { Flex } from '../../components/Common/Flex';
import { Wrappers } from '../../components/Wrappers';
import Initiate from './initiate';
import Reply from './reply';
import { SwapType } from '../../store/swaps/interfaces/data.interface';
import SwapsList from './swaps-list';

const SelectRoleWrapper = styled(Flex)`
  display: flex;
  flex-direction: column;
  min-height: 100%;
`;

const swapType = {
  initiator: {
    swapType: SwapType.initiator,
    label: 'INITIATE SWAP',
    timeToLock: 40,
  },
  replier: {
    swapType: SwapType.replier,
    label: 'REPLY SWAP',
    timeToLock: 20,
  },
};

const SelectRole = () => {
  return (
    <Routes>
      <Route
        path='/'
        element={
          <SelectRoleWrapper>
            <Wrappers width='fit-content'>
              <Flex flexDirection='column' gap='1rem' style={{ textTransform: 'uppercase' }}>
                <Div fontSizePreset='large' fontWeightPreset='bold'>
                  Select your role
                </Div>
                <Flex gap='0.5rem' flexDirection='column' align='stretch'>
                  <ButtonGreen as={Link} to='/swap/reply' width='100%'>
                    Replier
                  </ButtonGreen>
                  <ButtonRed as={Link} to='/swap/initiate' width='100%'>
                    Initiator
                  </ButtonRed>
                </Flex>
              </Flex>
            </Wrappers>
          </SelectRoleWrapper>
        }
      />
      <Route path='/initiate' element={<Initiate {...swapType.initiator} />} />
      <Route path='/reply' element={<Reply {...swapType.replier} />} />
      <Route path='/list' element={<SwapsList />} />
    </Routes>
  );
};

export default SelectRole;
