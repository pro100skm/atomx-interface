export const TOKEN_LIST_REPO = 'https://raw.githubusercontent.com/pro100skm/xdc-token-list/master';

export const getTokenLogoURL = (address: string): string => {
  return `${TOKEN_LIST_REPO}/assets/${address}/logo.png`;
};
