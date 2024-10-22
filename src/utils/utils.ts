export const mask = (phone: string) => {
  let treatPhone = phone.replace(/\D/g, "");
  if (treatPhone.length > 12) {
    const regex = /(\d{2})(\d{2})(\d{5})(\d{4})/;
    return treatPhone.replace(regex, "$1 ($2) $3-$4");
  } else if (treatPhone.length > 8 && treatPhone.length < 13) {
    const regex = /(\d{2})(\d{2})(\d{4})(\d{1})/;
    return treatPhone.replace(regex, "$1 ($2) $3-$4");
  } else if (treatPhone.length === 8) {
    const regex = /(\d{2})(\d{2})(\d{4})/;
    return treatPhone.replace(regex, "$1 ($2) $3");
  } else if (treatPhone.length === 3) {
    const regex = /(\d{2})(\d{1})/;
    return treatPhone.replace(regex, "$1 ($2");
  } else if (treatPhone.length > 3 && treatPhone.length < 5) {
    const regex = /(\d{2})(\d{2})/;
    return treatPhone.replace(regex, "$1 ($2");
  } else if (treatPhone.length > 4 && treatPhone.length < 8) {
    const regex = /(\d{2})(\d{2})(\d{1})/;
    return treatPhone.replace(regex, "$1 ($2) $3");
  }
  return treatPhone;
};

export const truncateAccessToken = (accessToken: string): string => {
  return (
    accessToken.substring(0, 2) +
    "..." +
    accessToken.substring(accessToken.length - 2)
  );
};

export const adjustTime = (time: string) => {
  const adjustTime = new Date(time);
  adjustTime.setHours(adjustTime.getHours() - 3);
  return adjustTime.toLocaleString();
};
export const adjustTimeWithout3Hour = (time: string) => {
  const adjustTime = new Date(time);
  return adjustTime.toLocaleString();
};

export const checkDigitNine = (phone: string) => {
  const phoneString = phone.toString();
  if (phoneString.startsWith("55") && phoneString.length === 12) {
    return phoneString.slice(0, 4) + "9" + phoneString.slice(4);
  }
  return phone;
};

export const dateExcelConverter = (numberOfDays: number) => {
  const initialDate = new Date(1900, 0, 1);
  const initialDateLeapDay = numberOfDays - 2;
  initialDate.setDate(initialDate.getDate() + initialDateLeapDay);

  return initialDate.toLocaleDateString();
};

export const isCellPhone = (phone: string) => {
  const phoneString = phone.toString();
  return phoneString.charAt(4) > "5";
};
