import React from 'react';
import { generate } from '@wcj/generate-password';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { ButtonOutlined } from '../../../components/Common/Button';
import Div from '../../../components/Common/Div';
import { Flex } from '../../../components/Common/Flex';
import Copyable from '../../../components/Copyable';
import { Tooltip } from '../../../components/Common/Inputs/TextInputWithStatus';

interface IProps {
  change: (v: string) => void;
  getSecretKey: (v: string) => void;
}

export function GenerateHash({ change, getSecretKey }: IProps) {
  const [secretKey, setSecretKey] = useState('');
  const [publicHash, setPublicHash] = useState('');

  const generateHex = () => {
    const secret = generate({ length: 32, numeric: true, lowerCase: true, special: false });
    const bytes = ethers.utils.toUtf8Bytes(secret);
    const hex = ethers.utils.hexlify(bytes);
    setSecretKey(hex);
    setPublicHash(ethers.utils.sha256(hex));
  };

  useEffect(() => {
    generateHex();
  }, []);

  useEffect(() => {
    if (!publicHash) return;
    change(publicHash);
  }, [publicHash]);

  useEffect(() => {
    if (!secretKey) return;
    getSecretKey(secretKey);
  }, [secretKey]);
  return (
    <Flex
      flexDirection='column'
      gap='1rem'
      align='flex-start'
      border='1px dashed black'
      padding='1rem'
    >
      <Div>
        <Div display='flex' align='center' fontSizePreset='large' fontWeightPreset='bold'>
          SECRET KEY <span style={{ color: 'red' }}>(DO NOT SHARE)</span>
          <Tooltip data-tooltip='Какой то текст'>?</Tooltip>
        </Div>
        <Copyable content={secretKey} />
      </Div>
      <Div>
        <Div display='flex' align='center' fontSizePreset='large' fontWeightPreset='bold'>
          PUBLIC HASH <Tooltip data-tooltip='Какой то текст'>?</Tooltip>
        </Div>
        <Copyable content={publicHash} />
      </Div>
      <ButtonOutlined onClick={generateHex}>GENERATE NEW KEY</ButtonOutlined>
    </Flex>
  );
}
