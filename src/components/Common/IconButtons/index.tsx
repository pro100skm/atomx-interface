import styled from 'styled-components/macro';

export const IconButtonWrapper = styled.div`
  color: ${({ theme }) => theme.text3};
  text-decoration: none;
  font-size: 0.825rem;
  padding: 0;
  :hover,
  :active,
  :focus {
    text-decoration: none;
    color: ${({ theme }) => theme.text2};
  }

  display: flex;
  justify-content: center;
  align-items: center;
`;
