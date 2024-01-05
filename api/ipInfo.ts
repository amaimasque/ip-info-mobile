export const getIpInfo = async (ip: string) =>
  fetch(`https://ipinfo.io/${ip}/geo`);
