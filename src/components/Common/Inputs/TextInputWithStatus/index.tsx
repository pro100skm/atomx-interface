import { isAddress } from 'ethers/lib/utils';
import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { StyledComponentProps } from '../../../../interfaces/styled-component-props.interface';
import { IInputStatus } from '../../../../pages/swap/components/types';
import Div from '../../Div';
import { Flex } from '../../Flex';
import { TextInput } from '../TextInput';

export enum IType {
  ADDRESS = 'ADDRESS',
  NUMBER = 'NUMBER',
  TEXT = 'TEXT',
}

interface IProps {
  margin?: string;
  width?: string;
  placeholder?: string;
  currency?: string;
  label?: string;
  type: IType;
  getStatus: (status: IInputStatus) => void;
  value?: string;
  change: (v: string) => void;
  props?: StyledComponentProps;
  readOnly?: boolean;
  tooltip?: string;
}

const CurrencyWrapper = styled.div`
  right: 6px;
  padding: 12px;
  border-radius: 25px;
  color: black;
  background-color: ${({ color }) => color};
  position: absolute;
`;

export const Tooltip = styled.div`
  width: 19px;
  height: 19px;
  padding: 1px;
  border-radius: 50%;
  font-size: 13px;
  font-weight: 600;
  border: 1px solid black;
  color: black;
  cursor: help;
  margin: 0 0.2rem 0 0.2rem;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default function TextInputWithStatus({
  placeholder,
  currency,
  width,
  getStatus,
  label,
  type,
  change,
  value = '',
  props = {},
  readOnly,
  tooltip,
}: IProps) {
  const [internalValue, setInternalValue] = useState(value);
  const [status, setStatus] = useState(IInputStatus.EMPTY);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  useEffect(() => {
    getStatus(status);
  }, [status]);

  useEffect(() => {
    if (!internalValue) {
      setStatus(IInputStatus.EMPTY);
      return;
    }
    if (type === IType.NUMBER || type === IType.TEXT) {
      if (internalValue) {
        setStatus(IInputStatus.VALID);
        return;
      }
      return;
    }
    if (type === IType.ADDRESS) {
      if (isAddress(internalValue)) {
        setStatus(IInputStatus.VALID);
        return;
      } else {
        setStatus(IInputStatus.INVALID);
        return;
      }
    }
  }, [internalValue]);

  const getStatusColor = useMemo(() => {
    if (status === IInputStatus.EMPTY) {
      return 'white';
    }
    if (status === IInputStatus.INVALID) {
      return 'red';
    }
    if (status === IInputStatus.WARNING) {
      return 'yellow';
    }
    if (status === IInputStatus.VALID) {
      return 'green';
    }
  }, [status]);

  const handleChange = (v: string) => {
    setInternalValue(v);
    change(v);
  };

  return (
    <Flex flexDirection='column' gap='.3rem' align='flex-start' width={width}>
      {label && (
        <Flex justify='start'>
          <Div fontWeightPreset='bold'>{label}</Div>
          {tooltip && <Tooltip data-tooltip={tooltip}>?</Tooltip>}
        </Flex>
      )}
      <Flex position='relative' justify='flex-start' width='100%'>
        <TextInput
          padding={'6px 36px 6px 10px'}
          value={internalValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e.target.value)}
          placeholder={placeholder}
          {...props}
          type={type === IType.NUMBER ? 'number' : 'text'}
          readOnly={readOnly}
        />
        <CurrencyWrapper color={getStatusColor}>{currency}</CurrencyWrapper>
      </Flex>
    </Flex>
  );
}
