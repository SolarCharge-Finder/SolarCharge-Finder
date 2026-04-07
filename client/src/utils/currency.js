const lkrFormatter = new Intl.NumberFormat('en-LK', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const wholeNumberFormatter = new Intl.NumberFormat('en-LK', {
  maximumFractionDigits: 0,
});

export const formatLKR = value => {
  const amount = Number(value ?? 0);
  if (Number.isNaN(amount)) return 'LKR 0.00';
  return `LKR ${lkrFormatter.format(amount)}`;
};

export const formatLKRWhole = value => {
  const amount = Number(value ?? 0);
  if (Number.isNaN(amount)) return 'LKR 0';
  return `LKR ${wholeNumberFormatter.format(amount)}`;
};
