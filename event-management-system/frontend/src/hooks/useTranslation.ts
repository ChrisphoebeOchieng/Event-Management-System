import { useTranslation } from 'react-i18next';

export const useTranslate = () => {
  const { t, i18n } = useTranslation();
  
  const translate = (key: string, params?: any) => {
    return t(key, params);
  };
  
  return { t: translate, i18n };
};

export default useTranslate;
