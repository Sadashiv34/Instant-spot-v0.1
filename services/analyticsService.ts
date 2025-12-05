
export const trackEvent = (eventName: string, params: Record<string, any> = {}) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, params);
  } else {
    // Use JSON.stringify to prevent [object Object] in console logs
    console.log(`[Analytics Dev]: ${eventName}`, JSON.stringify(params, null, 2));
  }
};

// Specific helper for Place Clicks
export const trackPlaceClick = (placeName: string, placeId: string) => {
  trackEvent('select_place', {
    place_name: placeName,
    place_id: placeId,
    category: 'Tourist Spot'
  });
};

// Specific helper for Button Clicks
export const trackButtonClick = (buttonName: string) => {
  trackEvent('click_button', {
    button_name: buttonName
  });
};
