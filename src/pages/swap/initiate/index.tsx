import { SwapType } from '../../../store/swaps/interfaces/data.interface';
import { Form } from '../components/Form';

interface IProps {
  swapType: SwapType;
  label: string;
  timeToLock: number;
}

const Initiate = (props: IProps) => {
  return <Form {...props} />;
};

export default Initiate;
