export const CalculateHeight = function CalculateHeight(selector) {
  const elements = document.querySelectorAll(selector);
  let totalHeight = 0;

  elements.forEach((element) => {
    totalHeight += element.getBoundingClientRect().height;
  });

  return totalHeight;
};
